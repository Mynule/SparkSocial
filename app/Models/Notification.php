<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id', 'type', 'source_user_id', 'post_id', 'is_read', 'extra_data', 'comment_id',
    ];

    protected $casts = [
        'extra_data' => 'array',
        'is_read' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sourceUser()
    {
        return $this->belongsTo(User::class, 'source_user_id');
    }

    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}

