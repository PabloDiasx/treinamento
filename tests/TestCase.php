<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Sanctum\Sanctum;

abstract class TestCase extends BaseTestCase
{
    /**
     * Autentica via Sanctum para testes de rotas auth:sanctum.
     * Retorna $this para permitir chainar: $this->loginAs($u)->getJson(...)
     */
    protected function loginAs(User $user): self
    {
        Sanctum::actingAs($user);
        return $this;
    }
}
