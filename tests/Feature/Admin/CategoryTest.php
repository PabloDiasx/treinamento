<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_lista_categorias(): void
    {
        $admin = User::factory()->admin()->create();
        Category::factory()->count(3)->create();

        $this->loginAs($admin)
            ->getJson('/api/admin/categories')
            ->assertOk()
            ->assertJsonCount(3);
    }

    public function test_admin_cria_categoria(): void
    {
        $admin = User::factory()->admin()->create();

        $this->loginAs($admin)
            ->postJson('/api/admin/categories', [
                'name' => 'Nova Categoria',
                'slug' => 'nova-categoria',
            ])
            ->assertCreated()
            ->assertJsonFragment(['name' => 'Nova Categoria']);

        $this->assertDatabaseHas('categories', ['slug' => 'nova-categoria']);
    }

    public function test_admin_nao_cria_categoria_com_slug_duplicado(): void
    {
        $admin = User::factory()->admin()->create();
        Category::factory()->create(['slug' => 'duplicado']);

        $this->loginAs($admin)
            ->postJson('/api/admin/categories', [
                'name' => 'X',
                'slug' => 'duplicado',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);
    }

    public function test_admin_atualiza_categoria(): void
    {
        $admin = User::factory()->admin()->create();
        $cat = Category::factory()->create(['name' => 'Original']);

        $this->loginAs($admin)
            ->putJson("/api/admin/categories/{$cat->id}", ['name' => 'Editado'])
            ->assertOk();

        $this->assertDatabaseHas('categories', ['id' => $cat->id, 'name' => 'Editado']);
    }

    public function test_admin_remove_categoria(): void
    {
        $admin = User::factory()->admin()->create();
        $cat = Category::factory()->create();

        $this->loginAs($admin)
            ->deleteJson("/api/admin/categories/{$cat->id}")
            ->assertOk();

        $this->assertDatabaseMissing('categories', ['id' => $cat->id]);
    }

    public function test_listagem_publica_usa_cache_e_invalida_ao_salvar(): void
    {
        $admin = User::factory()->admin()->create();
        Category::factory()->create(['name' => 'Primeira']);

        // Primeira chamada popula cache
        $this->loginAs($admin)->getJson('/api/categories')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Primeira']);

        $this->assertNotNull(Cache::get('categories:public'));

        // Nova categoria invalida cache via model event
        Category::factory()->create(['name' => 'Segunda']);

        $this->assertNull(Cache::get('categories:public'));

        $this->loginAs($admin)->getJson('/api/categories')
            ->assertJsonFragment(['name' => 'Segunda']);
    }

    public function test_usuario_comum_nao_pode_criar_categoria(): void
    {
        $user = User::factory()->create();

        $this->loginAs($user)
            ->postJson('/api/admin/categories', ['name' => 'X', 'slug' => 'x'])
            ->assertForbidden();
    }
}
