<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the default admin user.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@treinamento.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make(env('ADMIN_DEFAULT_PASSWORD', 'changeme123!')),
                'role' => UserRole::Admin->value,
                'is_active' => true,
            ]
        );
    }
}
