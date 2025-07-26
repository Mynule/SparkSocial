<?php

namespace App\Http\Resources;
use App\Support\Carbon;
use Illuminate\Database\Eloquent;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Number;

class BaseJsonResource extends JsonResource
{
    protected function can(string $ability): bool
    {
        return request()->user()->can($ability, $this->resource);
    }

    protected function firstWhenLoaded($relationship)
    {
        return ($value = $this->whenLoaded($relationship)) instanceof Eloquent\Collection ? $value->first() : $value;
    }

    protected function formatDate(?Carbon $value): ?string
    {
        return $value?->toBaseTz()->format('Y-m-d H:i:s');
    }

    protected function formatFileSize(?int $value): ?string
    {
        return filled($value) ? Number::fileSize($value, 2) : $value;
    }
}

