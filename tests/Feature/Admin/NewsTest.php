<?php

namespace Tests\Feature\Admin;

use App\Models\News;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class NewsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cria_noticia(): void
    {
        $admin = User::factory()->admin()->create();

        $this->loginAs($admin)
            ->postJson('/api/admin/news', [
                'title' => 'Bem-vindo',
                'content' => 'Conteúdo da notícia',
                'is_published' => true,
            ])
            ->assertCreated();

        $this->assertDatabaseHas('news', ['title' => 'Bem-vindo']);
    }

    public function test_endpoint_publico_retorna_apenas_publicadas(): void
    {
        $user = User::factory()->create();
        News::factory()->create(['title' => 'Publicada']);
        News::factory()->draft()->create(['title' => 'Rascunho']);

        $response = $this->loginAs($user)->getJson('/api/news');

        $response->assertOk()
            ->assertJsonFragment(['title' => 'Publicada'])
            ->assertJsonMissing(['title' => 'Rascunho']);
    }

    public function test_cache_de_noticias_invalida_ao_publicar_nova(): void
    {
        $user = User::factory()->create();
        News::factory()->create(['title' => 'Primeira']);

        $this->loginAs($user)->getJson('/api/news')->assertOk();
        $this->assertNotNull(Cache::get('news:public'));

        News::factory()->create(['title' => 'Segunda']);
        $this->assertNull(Cache::get('news:public'));
    }

    public function test_admin_atualiza_noticia(): void
    {
        $admin = User::factory()->admin()->create();
        $news = News::factory()->create(['title' => 'Antigo']);

        $this->loginAs($admin)
            ->putJson("/api/admin/news/{$news->id}", ['title' => 'Novo'])
            ->assertOk();

        $this->assertSame('Novo', $news->fresh()->title);
    }

    public function test_admin_deleta_noticia(): void
    {
        $admin = User::factory()->admin()->create();
        $news = News::factory()->create();

        $this->loginAs($admin)
            ->deleteJson("/api/admin/news/{$news->id}")
            ->assertOk();

        $this->assertDatabaseMissing('news', ['id' => $news->id]);
    }
}
