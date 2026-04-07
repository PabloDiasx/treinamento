<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoCourseSeeder extends Seeder
{
    /**
     * Seed a demo course with modules and lessons.
     */
    public function run(): void
    {
        // Ensure the Desenvolvimento category exists
        $category = Category::where('slug', 'desenvolvimento')->first();

        if (! $category) {
            $this->command->warn('Category "Desenvolvimento" not found. Run CategorySeeder first.');
            return;
        }

        // Grab the admin user (created by AdminUserSeeder)
        $admin = User::where('email', 'admin@treinamento.com')->first();

        if (! $admin) {
            $this->command->warn('Admin user not found. Run AdminUserSeeder first.');
            return;
        }

        // -------------------------------------------------------
        // Course
        // -------------------------------------------------------
        $course = Course::updateOrCreate(
            ['slug' => 'intro-dev-web'],
            [
                'instructor_id'     => $admin->id,
                'category_id'       => $category->id,
                'title'             => 'Introducao ao Desenvolvimento Web',
                'slug'              => 'intro-dev-web',
                'description'       => 'Aprenda os fundamentos do desenvolvimento web com HTML, CSS e as melhores praticas do mercado.',
                'short_description' => 'Fundamentos de HTML e CSS para iniciantes.',
                'status'            => 'published',
                'difficulty'        => 'beginner',
                'estimated_hours'   => 10,
                'is_featured'       => true,
                'published_at'      => now(),
            ]
        );

        // -------------------------------------------------------
        // Module 1 – HTML Basico
        // -------------------------------------------------------
        $module1 = Module::updateOrCreate(
            ['course_id' => $course->id, 'title' => 'HTML Basico'],
            [
                'sort_order'  => 1,
                'description' => 'Introducao ao HTML e sua estrutura basica.',
            ]
        );

        $this->createLesson($module1, [
            'title'        => 'O que e HTML?',
            'slug'         => 'o-que-e-html',
            'type'         => 'video',
            'video_source' => 'youtube',
            'content_url'  => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'duration_seconds' => 600,
            'sort_order'   => 1,
        ]);

        $this->createLesson($module1, [
            'title'        => 'Tags e Estrutura',
            'slug'         => 'tags-e-estrutura',
            'type'         => 'video',
            'video_source' => 'youtube',
            'content_url'  => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'duration_seconds' => 900,
            'sort_order'   => 2,
        ]);

        $this->createLesson($module1, [
            'title'           => 'Material de Apoio',
            'slug'            => 'material-de-apoio',
            'type'            => 'ebook',
            'is_free_preview' => true,
            'sort_order'      => 3,
        ]);

        // -------------------------------------------------------
        // Module 2 – CSS Fundamentos
        // -------------------------------------------------------
        $module2 = Module::updateOrCreate(
            ['course_id' => $course->id, 'title' => 'CSS Fundamentos'],
            [
                'sort_order'  => 2,
                'description' => 'Aprenda os fundamentos do CSS para estilizar suas paginas.',
            ]
        );

        $this->createLesson($module2, [
            'title'        => 'Seletores CSS',
            'slug'         => 'seletores-css',
            'type'         => 'video',
            'video_source' => 'youtube',
            'content_url'  => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'duration_seconds' => 720,
            'sort_order'   => 1,
        ]);

        $this->createLesson($module2, [
            'title'        => 'Flexbox e Grid',
            'slug'         => 'flexbox-e-grid',
            'type'         => 'text',
            'content_text' => 'Flexbox e Grid sao os dois principais sistemas de layout do CSS moderno. Flexbox e ideal para layouts unidimensionais, enquanto Grid e perfeito para layouts bidimensionais. Ambos sao essenciais para qualquer desenvolvedor web.',
            'sort_order'   => 2,
        ]);
    }

    /**
     * Create or update a lesson inside the given module.
     */
    private function createLesson(Module $module, array $data): Lesson
    {
        return Lesson::updateOrCreate(
            ['module_id' => $module->id, 'slug' => $data['slug']],
            array_merge($data, ['module_id' => $module->id])
        );
    }
}
