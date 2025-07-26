<?php

namespace Database\Factories;

use App\Models\Comment;
use App\Models\Like;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class LikeFactory extends Factory
{
    protected $model = Like::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'likeable_id' => null,
            'likeable_type' => null,
            'is_deleted' => false,
        ];
    }

    public function forPost(Post $post = null)
    {
        $post = $post ?? Post::factory()->create();

        return $this->state(function () use ($post) {
            return [
                'likeable_id' => $post->id,
                'likeable_type' => Post::class,
            ];
        });
    }

    public function forComment(Comment $comment = null)
    {
        $comment = $comment ?? Comment::factory()->create();

        return $this->state(function () use ($comment) {
            return [
                'likeable_id' => $comment->id,
                'likeable_type' => Comment::class,
            ];
        });
    }
}
