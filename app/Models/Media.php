<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'file_path',
        'file_type',
        'disk',
        'mediable_id',
        'mediable_type',
    ];

    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }

//    public function getUrlAttribute()
//    {
//        return asset('storage/' . $this->file_path);
//    }
//    public function getUrlAttribute()
//    {
//        return Storage::disk('s3')->url($this->file_path);
//    }
//    public function getUrlAttribute(): string
//    {
//        return Storage::disk($this->disk ?? 's3')->url($this->file_path);
//    }

    protected $appends = ['url'];
    public function getUrlAttribute(): string
    {
        $disk = $this->disk ?? config('filesystems.default');

        return Storage::disk($disk)->url($this->file_path);
    }
}
