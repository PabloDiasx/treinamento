<?php

namespace App\Enums;

enum LessonType: string
{
    case Video = 'video';
    case Ebook = 'ebook';
    case Text = 'text';
    case Quiz = 'quiz';

    public function label(): string
    {
        return match ($this) {
            self::Video => 'Video',
            self::Ebook => 'E-book',
            self::Text => 'Texto',
            self::Quiz => 'Questionario',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::Video => 'play-circle',
            self::Ebook => 'book-open',
            self::Text => 'file-text',
            self::Quiz => 'help-circle',
        };
    }
}
