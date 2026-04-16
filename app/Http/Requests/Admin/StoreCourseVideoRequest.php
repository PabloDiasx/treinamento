<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseVideoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'        => ['required', 'string', 'max:255'],
            'video_url'    => ['nullable', 'string', 'max:500'],
            'video_source' => ['nullable', 'string', 'in:youtube,vimeo,gdrive,local,external'],
            'tag'          => ['nullable', 'string', 'in:todos,forca,hit,cardio,alongamento,sport'],
            'sort_order'   => ['nullable', 'integer', 'min:0'],
        ];
    }
}
