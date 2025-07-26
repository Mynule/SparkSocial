<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('user'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:24'],
            'username' => ['required', 'string', 'max:20', Rule::unique('users')->ignore($this->route('user')->id)],
            'bio' => ['nullable', 'string', 'max:300'],
            'location' => ['nullable', 'string', 'max:100'],
            'website' => ['nullable', 'string', 'max:120'],
            'date_of_birth' => ['nullable', 'date'],
            'profile_image' => ['nullable', 'image', 'mimes:jpg,png,jpeg,gif', 'max:2048'],
            'cover_image' => ['nullable', 'image', 'mimes:jpg,png,jpeg,gif', 'max:4096'],
            'is_private' => ['required', 'boolean'],
            'status' => ['required', Rule::in(['active', 'suspended', 'deactivated'])],
        ];
    }
}
