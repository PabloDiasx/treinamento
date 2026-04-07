<?php

namespace App\Enums;

enum CourseStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Rascunho',
            self::Published => 'Publicado',
            self::Archived => 'Arquivado',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Draft => 'text-yellow-600 bg-yellow-100',
            self::Published => 'text-green-600 bg-green-100',
            self::Archived => 'text-gray-600 bg-gray-100',
        };
    }
}
