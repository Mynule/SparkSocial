<?php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PostPolicy
{

    public function view(?User $user, Post $post): bool
    {
        if (!$post->is_private) {
            return true;
        }

        if ($user && $user->id === $post->user_id) {
            return true;
        }

        if ($user && $post->user->followers()->where('follower_id', $user->id)->exists()) {
            return true;
        }

        return false;
    }

    public function update(User $currentUser, Post $post): Response
    {
        return $currentUser->id === $post->user_id
            ? Response::allow()
            : Response::deny('You can only update your own posts.');
    }






//    public function view(?User $user, Post $post): bool
//    {
//        if ($post->user->is_private) {
//            if (!$user) {
//                return false;
//            }
//
//            if ($user->id === $post->user_id) {
//                return true;
//            }
//
//            return $post->user->followers()->where('follower_id', $user->id)->exists();
//        }
//
//        if (!$post->is_private) {
//            return true;
//        }
//
//        if (!$user) {
//            return false;
//        }
//
//        if ($user->id === $post->user_id) {
//            return true;
//        }
//
//        return $post->user->followers()->where('follower_id', $user->id)->exists();
//    }

}
