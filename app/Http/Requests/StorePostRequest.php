<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'content' => ['nullable','string', 'max:1000'],
            'parent_post_id' => ['nullable', 'exists:posts,id'],
            'is_private' => ['required', 'boolean'],
            'media' => ['nullable', 'array'],
            'media.*' => ['file', 'mimes:jpeg,jpg,png,gif,mp4,mov,webm', 'max:10240'],
            'remove_media' => ['nullable', 'array'],
            'remove_media.*' => ['string'],
            'hashtags' => ['nullable','array'],
            'hashtags.*' => ['string','max:30'],
        ];
    }
}
