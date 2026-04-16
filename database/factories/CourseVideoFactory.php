<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\CourseVideo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourseVideo>
 */
class CourseVideoFactory extends Factory
{
    protected $model = CourseVideo::class;

    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'title' => fake()->sentence(3),
            'video_url' => 'https://www.youtube.com/watch?v=' . fake()->lexify('???????????'),
            'video_source' => 'youtube',
            'tag' => 'todos',
            'sort_order' => 0,
        ];
    }
}
