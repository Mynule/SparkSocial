<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    public $table = 'messages';

    protected $fillable = ['id', 'user_id', 'chat_id', 'text', 'read_at'];

    protected $appends = ['time'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class, 'chat_id');
    }

    public function getTimeAttribute(): string
    {
        return date("d M Y, H:i:s", strtotime($this->attributes['created_at']));
    }
}
