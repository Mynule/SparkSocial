<?php

namespace App\Policies;

use App\Models\Follow;
use App\Models\User;

class FollowPolicy
{
    public function accept(User $user, Follow $follow): bool
    {
        return $follow->followee_id === $user->id;
    }

    public function reject(User $user, Follow $follow): bool
    {
        return $follow->followee_id === $user->id;
    }
}
