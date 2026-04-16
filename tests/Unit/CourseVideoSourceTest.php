<?php

namespace Tests\Unit;

use App\Models\CourseVideo;
use PHPUnit\Framework\TestCase;

class CourseVideoSourceTest extends TestCase
{
    public function test_detecta_youtube(): void
    {
        $this->assertSame('youtube', CourseVideo::detectSource('https://www.youtube.com/watch?v=abc'));
        $this->assertSame('youtube', CourseVideo::detectSource('https://youtu.be/abc'));
    }

    public function test_detecta_vimeo(): void
    {
        $this->assertSame('vimeo', CourseVideo::detectSource('https://vimeo.com/12345'));
    }

    public function test_detecta_gdrive(): void
    {
        $this->assertSame('gdrive', CourseVideo::detectSource('https://drive.google.com/file/d/abc/view'));
    }

    public function test_classifica_como_external_quando_nao_reconhece(): void
    {
        $this->assertSame('external', CourseVideo::detectSource('https://random.com/video.mp4'));
    }

    public function test_retorna_null_para_url_vazia(): void
    {
        $this->assertNull(CourseVideo::detectSource(null));
        $this->assertNull(CourseVideo::detectSource(''));
    }
}
