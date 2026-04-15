<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\ProgressController;
use App\Http\Controllers\Api\EbookController;
use App\Http\Controllers\Api\AiChatController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VideoStreamController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\CertificateController;

// ─── Publicas ───────────────────────────────────────────
Route::post('/login', [LoginController::class, 'login']);
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
Route::post('/reset-password', [ResetPasswordController::class, 'reset']);

// ─── Google Drive video proxy (sem auth para o player funcionar) ───
Route::get('/gdrive-stream', [\App\Http\Controllers\Api\GDriveProxyController::class, 'stream']);

// ─── Autenticadas ───────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::get('/user', [UserController::class, 'me']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::put('/user/password', [UserController::class, 'updatePassword']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Catalogo de Cursos
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{course:slug}', [CourseController::class, 'show']);
    Route::get('/categories', [CategoryController::class, 'index']);

    // Inscricoes
    Route::post('/enrollments/{course}', [EnrollmentController::class, 'enroll']);
    Route::delete('/enrollments/{course}', [EnrollmentController::class, 'drop']);
    Route::get('/my-courses', [EnrollmentController::class, 'myCourses']);

    // Licoes
    Route::get('/lessons/{lesson}', [LessonController::class, 'show']);
    Route::put('/lessons/{lesson}/progress', [ProgressController::class, 'update']);
    Route::get('/lessons/{lesson}/stream', [VideoStreamController::class, 'stream']);

    // Ebooks
    Route::get('/ebooks/{ebook}', [EbookController::class, 'show']);
    Route::get('/ebooks/{ebook}/download', [EbookController::class, 'download']);

    // IA
    Route::post('/ai/chat', [AiChatController::class, 'chat']);
    Route::get('/ai/chat/history', [AiChatController::class, 'history']);
    Route::post('/ai/summarize/{ebook}', [AiChatController::class, 'summarize']);

    // Certificados
    Route::get('/certificates', [CertificateController::class, 'index']);
    Route::get('/certificates/{certificate:certificate_code}/download', [CertificateController::class, 'download']);

    // Noticias
    Route::get('/news', [\App\Http\Controllers\Api\NewsController::class, 'index']);

    // Notificacoes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    // ─── Admin / Instructor ─────────────────────────────
    Route::middleware('role:admin,instructor')->prefix('admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'admin']);

        Route::apiResource('courses', \App\Http\Controllers\Api\Admin\CourseController::class);
        Route::post('/courses/{course}/upload-video', [\App\Http\Controllers\Api\Admin\CourseController::class, 'uploadVideo']);
        Route::post('/courses/{course}/duplicate', [\App\Http\Controllers\Api\Admin\CourseController::class, 'duplicate']);

        // Course videos
        Route::get('/courses/{course}/videos', [\App\Http\Controllers\Api\Admin\CourseVideoController::class, 'index']);
        Route::post('/courses/{course}/videos', [\App\Http\Controllers\Api\Admin\CourseVideoController::class, 'store']);
        Route::put('/videos/{video}', [\App\Http\Controllers\Api\Admin\CourseVideoController::class, 'update']);
        Route::delete('/videos/{video}', [\App\Http\Controllers\Api\Admin\CourseVideoController::class, 'destroy']);
        Route::post('/videos/{video}/upload', [\App\Http\Controllers\Api\Admin\CourseVideoController::class, 'uploadFile']);

        Route::apiResource('categories', \App\Http\Controllers\Api\Admin\CategoryController::class);
        Route::apiResource('news', \App\Http\Controllers\Api\Admin\NewsController::class);
    });

    // ─── Apenas Admin ───────────────────────────────────
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::apiResource('users', \App\Http\Controllers\Api\Admin\UserController::class);
    });
});
