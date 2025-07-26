<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Follow;
use App\Models\Like;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Users
        $users = User::factory()->count(20)->create();

        // Create Posts
        $posts = Post::factory()
            ->count(10)
            ->make()
            ->each(function ($post) use ($users) {
                $post->user_id = $users->random()->id;
                $post->save();
            });

        // Create Follows (Ensure no user follows themselves)
        $users->each(function ($follower) use ($users) {
            $users->random(rand(1, 5))->each(function ($followee) use ($follower) {
                if ($follower->id !== $followee->id) {
                    Follow::factory()->create([
                        'follower_id' => $follower->id,
                        'followee_id' => $followee->id,
                    ]);
                }
            });
        });

        // Create Comments
        $comments = collect();
        $users->each(function ($user) use ($posts, $users, $comments) {
            $posts->random(rand(1, 5))->each(function ($post) use ($user, $users, $comments) {
                $comment = Comment::factory()->create([
                    'user_id' => $user->id,
                    'post_id' => $post->id,
                ]);
                $comments->push($comment);

                // Nested Replies
                if (rand(0, 1)) {
                    $reply = Comment::factory()->create([
                        'user_id' => $users->random()->id,
                        'post_id' => $post->id,
                        'parent_comment_id' => $comment->id,
                    ]);
                    $comments->push($reply);
                }
            });
        });

        // Create Likes (polymorphic: Post and Comment)
        $likeables = $posts->merge($comments);

        $users->each(function ($user) use ($posts, $comments) {
            $likeables = collect();

            $likeables = $likeables
                ->merge($posts->random(rand(1, min(5, $posts->count()))))
                ->merge($comments->random(rand(1, min(5, $comments->count()))));

            foreach ($likeables as $likeable) {
                Like::factory()
                    ->{$likeable instanceof \App\Models\Post ? 'forPost' : 'forComment'}($likeable)
                    ->create(['user_id' => $user->id]);
            }
        });
    }
}
