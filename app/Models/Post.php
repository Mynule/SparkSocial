<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'content',
        'parent_post_id',
        'is_deleted',
        'is_private',
        'likes_count',
        'is_liked',
        'comments_count',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function parentPost()
    {
        return $this->belongsTo(Post::class, 'parent_post_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Post::class, 'parent_post_id');
    }

    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function hashtags()
    {
        return $this->belongsToMany(Hashtag::class, 'post_hashtags');
    }

    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    public function reposts()
    {
        return $this->hasMany(Repost::class);
    }

    public function repostedByUsers()
    {
        return $this->belongsToMany(User::class, 'reposts');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }


}
