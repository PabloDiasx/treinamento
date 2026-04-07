<?php

namespace App\Enums;

enum VideoSource: string
{
    case Local = 'local';
    case Youtube = 'youtube';
    case Vimeo = 'vimeo';
    case External = 'external';

    public function label(): string
    {
        return match ($this) {
            self::Local => 'Local',
            self::Youtube => 'YouTube',
            self::Vimeo => 'Vimeo',
            self::External => 'Externo',
        };
    }
}
