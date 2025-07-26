<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    use HandlesAuthorization;

    public function update(User $currentUser, User $user) : Response
    {
        return $currentUser->id === $user->id
            ? Response::allow()
            : Response::deny('You can only update your own profile.');
    }

    public function view(?User $currentUser, User $user): bool
    {
        if (!$user->is_private) {
            return true;
        }

        if ($currentUser && ($currentUser->id === $user->id || $user->followers()->where('follower_id', $currentUser->id)->exists())) {
            return true;
        }

        return false;
    }

    public function viewReports(User $user): bool
    {
        return $user->isAdmin();
    }
}
