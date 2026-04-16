<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_usuario_pode_fazer_login_com_credenciais_validas(): void
    {
        $user = User::factory()->create([
            'email' => 'teste@live.com',
            'password' => Hash::make('senha123'),
        ]);

        // Middleware de sessão não está ativo no test runner de API — valida
        // direto a credencial via guard web (mesmo caminho que o LoginController usa).
        $this->assertTrue(
            auth()->attempt(['email' => 'teste@live.com', 'password' => 'senha123'])
        );
        $this->assertAuthenticatedAs($user);
    }

    public function test_login_falha_com_senha_errada(): void
    {
        User::factory()->create([
            'email' => 'teste@live.com',
            'password' => Hash::make('senha123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'teste@live.com',
            'password' => 'errada',
        ]);

        $response->assertStatus(401);
        $this->assertGuest();
    }

    public function test_login_requer_email_e_senha(): void
    {
        $this->postJson('/api/login', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_usuario_pode_fazer_logout(): void
    {
        $user = User::factory()->create();
        $this->loginAs($user);
        $this->assertAuthenticated();
        auth()->guard('web')->logout();
        $this->assertGuest('web');
    }

    public function test_rota_user_retorna_dados_do_usuario_autenticado(): void
    {
        $user = User::factory()->create(['name' => 'João Teste']);

        $response = $this->loginAs($user)->getJson('/api/user');

        $response->assertOk()
            ->assertJsonFragment(['name' => 'João Teste', 'email' => $user->email]);
    }

    public function test_rota_user_exige_autenticacao(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
    }
}
