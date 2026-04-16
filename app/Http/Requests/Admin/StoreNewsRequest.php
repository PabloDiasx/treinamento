<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreNewsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'        => ['required', 'string', 'max:255'],
            'content'      => ['required', 'string'],
            'image_url'    => ['nullable', 'string', 'max:500'],
            'is_published' => ['boolean'],
            'published_at' => ['nullable', 'date'],
            'sort_order'   => ['nullable', 'integer', 'min:0'],
        ];
    }
}
