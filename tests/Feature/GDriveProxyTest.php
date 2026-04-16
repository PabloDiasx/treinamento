<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GDriveProxyTest extends TestCase
{
    use RefreshDatabase;

    public function test_rota_gdrive_exige_autenticacao(): void
    {
        $this->getJson('/api/gdrive-stream?id=abc123')
            ->assertUnauthorized();
    }

    public function test_id_do_drive_deve_ter_formato_valido(): void
    {
        $user = User::factory()->create();

        $this->loginAs($user)
            ->getJson('/api/gdrive-stream?id=' . urlencode('id com espaço'))
            ->assertStatus(422);
    }

    public function test_id_ausente_retorna_erro(): void
    {
        $user = User::factory()->create();

        $this->loginAs($user)
            ->getJson('/api/gdrive-stream')
            ->assertStatus(422);
    }
}
