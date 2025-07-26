<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'email',
        'password',
        'name',
        'bio',
        'location',
        'website',
        'date_of_birth',
        'is_verified',
        'email_verified_at',
        'is_private',
        'status',
        'is_admin'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_verified' => 'boolean',
            'is_private' => 'boolean',
            'date_of_birth' => 'date',
            'status' => 'string',
            'is_admin' => 'boolean',
        ];
    }

    public function profileImage(): HasOne
    {
        return $this->hasOne(Media::class, 'mediable_id')
            ->where('mediable_type', User::class)
            ->where('file_type', 'profile');
    }

    public function coverImage(): HasOne
    {
        return $this->hasOne(Media::class, 'mediable_id')
            ->where('mediable_type', User::class)
            ->where('file_type', 'cover');
    }

    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'followee_id', 'follower_id')
            ->wherePivot('is_accepted', true)
            ->withPivot('created_at');
    }

    public function following(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'followee_id')
            ->wherePivot('is_accepted', true)
            ->withPivot('created_at');
    }

    public function friends(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'followee_id')
            ->wherePivot('is_accepted', true)
            ->withPivot('created_at')
            ->whereIn('followee_id', function ($query) {
                $query->select('follower_id')
                    ->from('follows')
                    ->where('is_accepted', true)
                    ->where('followee_id', $this->id);
            });
    }


    public function isFollowing(User $user): bool
    {
        return $this->following()
            ->where('followee_id', $user->id)
            ->wherePivot('is_accepted', true)
            ->exists();
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'user_id');
    }

    public function favorites(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'favorites', 'user_id', 'post_id');
    }

    public function likes(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'likes', 'user_id', 'post_id');
    }

    public function reposts(): HasMany
    {
        return $this->hasMany(Repost::class);
    }

    public function repostedPosts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'reposts');
    }

    public function followingPosts(): HasManyThrough
    {
        return $this->hasManyThrough(
            Post::class,
            Follow::class,
            'follower_id',
            'user_id',
            'id',
            'followee_id'
        )->where('follows.is_accepted', true);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function sentNotifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'source_user_id');
    }

    public function pendingFollowRequests(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'followee_id')
            ->wherePivot('is_accepted', false);
    }

    public function isAdmin(): bool
    {
        return $this->is_admin === true;
    }
}
