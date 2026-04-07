<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Seed categories matching the sidebar menu.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Como manusear os Equipamentos', 'icon' => 'wrench',    'color' => '#6d28d9', 'sort_order' => 1],
            ['name' => 'Ebooks',                        'icon' => 'book-open', 'color' => '#3b82f6', 'sort_order' => 2],
            ['name' => 'Exercícios com Acessórios',     'icon' => 'dumbbell',  'color' => '#f59e0b', 'sort_order' => 3],
            ['name' => 'Exercícios Extras',             'icon' => 'dumbbell',  'color' => '#10b981', 'sort_order' => 4],
            ['name' => 'Manuais',                       'icon' => 'file-text', 'color' => '#ec4899', 'sort_order' => 5],
            ['name' => 'Vídeos de Exercícios',          'icon' => 'video',     'color' => '#ef4444', 'sort_order' => 6],
            ['name' => 'Vídeos de Montagens',           'icon' => 'video',     'color' => '#8b5cf6', 'sort_order' => 7],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(
                ['slug' => Str::slug($cat['name'])],
                array_merge($cat, ['slug' => Str::slug($cat['name'])])
            );
        }
    }
}
