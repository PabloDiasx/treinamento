<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Instructor = 'instructor';
    case Student = 'student';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrador',
            self::Instructor => 'Instrutor',
            self::Student => 'Aluno',
        };
    }

    public function level(): int
    {
        return match ($this) {
            self::Admin => 3,
            self::Instructor => 2,
            self::Student => 1,
        };
    }
}
