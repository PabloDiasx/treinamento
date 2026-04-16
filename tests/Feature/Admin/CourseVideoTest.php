<?php

namespace Tests\Feature\Admin;

use App\Models\Course;
use App\Models\CourseVideo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseVideoTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_lista_videos_de_um_curso(): void
    {
        $admin = User::factory()->admin()->create();
        $course = Course::factory()->create();
        CourseVideo::factory()->count(2)->create(['course_id' => $course->id]);

        $this->loginAs($admin)
            ->getJson("/api/admin/courses/{$course->id}/videos")
            ->assertOk()
            ->assertJsonCount(2);
    }

    public function test_criar_video_detecta_source_youtube(): void
    {
        $admin = User::factory()->admin()->create();
        $course = Course::factory()->create();

        $this->loginAs($admin)
            ->postJson("/api/admin/courses/{$course->id}/videos", [
                'title' => 'Aula 1',
                'video_url' => 'https://www.youtube.com/watch?v=abc123',
            ])
            ->assertCreated()
            ->assertJsonFragment(['video_source' => 'youtube']);
    }

    public function test_criar_video_detecta_source_gdrive(): void
    {
        $admin = User::factory()->admin()->create();
        $course = Course::factory()->create();

        $this->loginAs($admin)
            ->postJson("/api/admin/courses/{$course->id}/videos", [
                'title' => 'Aula',
                'video_url' => 'https://drive.google.com/file/d/abc/view',
            ])
            ->assertCreated()
            ->assertJsonFragment(['video_source' => 'gdrive']);
    }

    public function test_reorder_atualiza_sort_order_dos_videos(): void
    {
        $admin = User::factory()->admin()->create();
        $course = Course::factory()->create();

        $v1 = CourseVideo::factory()->create(['course_id' => $course->id, 'sort_order' => 0]);
        $v2 = CourseVideo::factory()->create(['course_id' => $course->id, 'sort_order' => 1]);
        $v3 = CourseVideo::factory()->create(['course_id' => $course->id, 'sort_order' => 2]);

        // Inverte: v3, v1, v2
        $this->loginAs($admin)
            ->putJson("/api/admin/courses/{$course->id}/videos/reorder", [
                'order' => [$v3->id, $v1->id, $v2->id],
            ])
            ->assertOk();

        $this->assertSame(0, $v3->fresh()->sort_order);
        $this->assertSame(1, $v1->fresh()->sort_order);
        $this->assertSame(2, $v2->fresh()->sort_order);
    }

    public function test_atualizar_video(): void
    {
        $admin = User::factory()->admin()->create();
        $video = CourseVideo::factory()->create(['title' => 'Antigo']);

        $this->loginAs($admin)
            ->putJson("/api/admin/videos/{$video->id}", ['title' => 'Novo'])
            ->assertOk();

        $this->assertSame('Novo', $video->fresh()->title);
    }

    public function test_deletar_video(): void
    {
        $admin = User::factory()->admin()->create();
        $video = CourseVideo::factory()->create();

        $this->loginAs($admin)
            ->deleteJson("/api/admin/videos/{$video->id}")
            ->assertOk();

        $this->assertDatabaseMissing('course_videos', ['id' => $video->id]);
    }
}
