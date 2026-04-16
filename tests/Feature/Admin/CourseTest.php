<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Course;
use App\Models\CourseVideo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_lista_cursos_paginados(): void
    {
        $admin = User::factory()->admin()->create();
        Course::factory()->count(3)->create();

        $this->loginAs($admin)
            ->getJson('/api/admin/courses')
            ->assertOk()
            ->assertJsonStructure(['data', 'current_page', 'last_page', 'total']);
    }

    public function test_admin_cria_curso(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();

        $this->loginAs($admin)
            ->postJson('/api/admin/courses', [
                'title' => 'Curso Teste',
                'slug' => 'curso-teste',
                'category_id' => $category->id,
                'difficulty' => 'beginner',
                'status' => 'draft',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('courses', ['slug' => 'curso-teste']);
    }

    public function test_admin_atualiza_curso(): void
    {
        $admin = User::factory()->admin()->create();
        $course = Course::factory()->create(['title' => 'Velho']);

        $this->loginAs($admin)
            ->putJson("/api/admin/courses/{$course->id}", ['title' => 'Novo'])
            ->assertOk();

        $this->assertDatabaseHas('courses', ['id' => $course->id, 'title' => 'Novo']);
    }

    public function test_admin_duplica_curso_com_videos_para_outra_categoria(): void
    {
        $admin = User::factory()->admin()->create();
        $catOrigem = Category::factory()->create();
        $catDestino = Category::factory()->create();

        $course = Course::factory()->create([
            'category_id' => $catOrigem->id,
            'title' => 'Original',
        ]);
        CourseVideo::factory()->count(3)->create(['course_id' => $course->id]);

        $response = $this->loginAs($admin)
            ->postJson("/api/admin/courses/{$course->id}/duplicate", [
                'category_id' => $catDestino->id,
                'title' => 'Copia',
            ])
            ->assertCreated()
            ->assertJsonFragment(['title' => 'Copia']);

        $newCourseId = $response->json('id');

        $this->assertDatabaseHas('courses', [
            'id' => $newCourseId,
            'category_id' => $catDestino->id,
            'title' => 'Copia',
        ]);

        // Garante que os 3 vídeos foram copiados
        $this->assertSame(3, CourseVideo::where('course_id', $newCourseId)->count());
    }

    public function test_duplicar_requer_categoria_destino_valida(): void
    {
        $admin = User::factory()->admin()->create();
        $course = Course::factory()->create();

        $this->loginAs($admin)
            ->postJson("/api/admin/courses/{$course->id}/duplicate", [
                'category_id' => 99999,
            ])
            ->assertStatus(422);
    }

    public function test_admin_deleta_curso(): void
    {
        $admin = User::factory()->admin()->create();
        $course = Course::factory()->create();

        $this->loginAs($admin)
            ->deleteJson("/api/admin/courses/{$course->id}")
            ->assertOk();

        $this->assertDatabaseMissing('courses', ['id' => $course->id]);
    }

    public function test_usuario_comum_nao_acessa_admin_courses(): void
    {
        $user = User::factory()->create();
        $this->loginAs($user)
            ->getJson('/api/admin/courses')
            ->assertForbidden();
    }
}
