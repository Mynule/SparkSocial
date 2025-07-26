<?php

namespace App\Http\Controllers;

use App\Events\NotificationCreated;
use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Follow;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;

class FollowController extends Controller
{
    use AuthorizesRequests;

    public function follow(User $user): RedirectResponse
    {
        $followerId = Auth::id();
        $followeeId = $user->id;

        if ($followerId === $followeeId) {
            return back()->with('error', 'You cannot follow yourself.');
        }

        $alreadyFollowing = Follow::where('follower_id', $followerId)
            ->where('followee_id', $followeeId)
            ->exists();

        if ($alreadyFollowing) {
            return back()->with('error', 'Already following this user.');
        }

        Follow::create([
            'follower_id' => $followerId,
            'followee_id' => $followeeId,
            'is_accepted' => !$user->is_private,
        ]);

        Notification::where('type', 'follow')
            ->where('source_user_id', $followerId)
            ->where('user_id', $followeeId)
            ->delete();

        $notification = NotificationService::create([
            'user_id' => $followeeId,
            'source_user_id' => $followerId,
            'type' => 'follow',
        ]);

        return back()->with('success', 'Followed successfully.');
    }

    public function unfollow(User $user): RedirectResponse
    {
        $followerId = Auth::id();
        $followeeId = $user->id;

        $deleted = Follow::where('follower_id', $followerId)
            ->where('followee_id', $followeeId)
            ->delete();

        if ($deleted) {
            Notification::where('type', 'follow')
                ->where('source_user_id', $followerId)
                ->where('user_id', $followeeId)
                ->delete();

            return back()->with('success', 'Unfollowed successfully.');
        }

        return back()->with('error', 'You are not following this user.');
    }

    public function isFollowing(User $user)
    {
        $followerId = Auth::id();
        $followeeId = $user->id;

        $isFollowing = Follow::where('follower_id', $followerId)
            ->where('followee_id', $followeeId)
            ->exists();

        return response()->json(['following' => $isFollowing]);
    }

    public function followers(Request $request, User $user)
    {
        $authUser = Auth::user();
        $sort = $request->input('sort', 'latest');
        $authUserFriends = $authUser->friends->pluck('id')->toArray();

        $followersQuery = $authUser->followers()
            ->with(['profileImage', 'followers'])
            ->withCount('followers');

        switch ($sort) {
            case 'latest':
                $followersQuery->orderBy('pivot_created_at', 'desc');
                break;
            case 'oldest':
                $followersQuery->orderBy('pivot_created_at', 'asc');
                break;
            case 'popular':
                $followersQuery->orderByDesc('followers_count');
                break;
            case 'least_followers':
                $followersQuery->orderBy('followers_count');
                break;
        }

        $followers = $followersQuery->get()
            ->map(function ($follower) use ($authUser, $authUserFriends) {
                return [
                    'id' => $follower->id,
                    'name' => $follower->name,
                    'username' => $follower->username,
                    'profile_image' => $follower->profileImage,
                    'followers_count' => $follower->followers_count,
                    'is_followed' => $authUser->following->contains($follower->id),
                    'is_private' => $follower->is_private,
                    'is_friend' => in_array($follower->id, $authUserFriends),
                    'has_sent_follow_request' => $authUser->pendingFollowRequests()->where('followee_id', $follower->id)->exists(),
                    'is_verified' => $follower->is_verified,
                ];
            });

        return inertia('user/followers', [
            'title' => 'Followers',
            'users' => $followers,
            'filters' => ['sort' => $sort],
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'profile_image' => $user->profileImage,
                'is_verified' => $user->is_verified,
            ],
        ]);
    }




    public function following(Request $request, User $user)
    {
        $authUser = Auth::user();
        $sort = $request->input('sort', 'latest');
        $authUserFriends = $authUser->friends->pluck('id')->toArray();

        $followingQuery = $authUser->following()
            ->with(['profileImage', 'followers'])
            ->withCount('followers');

        switch ($sort) {
            case 'latest':
                $followingQuery->orderBy('pivot_created_at', 'desc');
                break;
            case 'oldest':
                $followingQuery->orderBy('pivot_created_at', 'asc');
                break;
            case 'popular':
                $followingQuery->orderByDesc('followers_count');
                break;
            case 'least_followers':
                $followingQuery->orderBy('followers_count');
                break;
        }

        $following = $followingQuery->get()
            ->map(function ($followingUser) use ($authUser, $authUserFriends) {
                return [
                    'id' => $followingUser->id,
                    'name' => $followingUser->name,
                    'username' => $followingUser->username,
                    'profile_image' => $followingUser->profileImage,
                    'followers_count' => $followingUser->followers_count,
                    'is_followed' => $authUser->following->contains($followingUser->id),
                    'is_private' => $followingUser->is_private,
                    'is_friend' => in_array($followingUser->id, $authUserFriends),
                    'is_verified' => $followingUser->is_verified,
                ];
            });

        return inertia('user/following', [
            'title' => 'Following',
            'users' => $following,
            'filters' => ['sort' => $sort],
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'profile_image' => $user->profileImage,
                'is_verified' => $user->is_verified
            ],
        ]);
    }



    public function acceptRequest(User $sourceUser, Notification $notification): RedirectResponse
    {
        $user = Auth::user();

        $follow = Follow::where('follower_id', $sourceUser->id)
            ->where('followee_id', $user->id)
            ->firstOrFail();

        $this->authorize('accept', $follow);

        Follow::where('follower_id', $sourceUser->id)
            ->where('followee_id', $user->id)
            ->update(['is_accepted' => true]);

        Notification::where('type', 'follow')
            ->where('source_user_id', $sourceUser->id)
            ->where('user_id', $user->id)
            ->delete();

        Notification::create([
            'user_id' => $follow->follower_id,
            'source_user_id' => $follow->followee_id,
            'type' => 'follow',
            'is_read' => false,
            'extra_data' => 'accepted',
        ]);

        Notification::create([
            'user_id' => $follow->followee_id,
            'source_user_id' => $follow->follower_id,
            'type' => 'follow',
            'is_read' => false,
        ]);

        $notification->delete();

        return back()->with('success', 'Follow request accepted.');
    }

    public function rejectRequest(User $sourceUser, Notification $notification): RedirectResponse
    {
        $user = Auth::user();

        $follow = Follow::where('follower_id', $sourceUser->id)
            ->where('followee_id', $user->id)
            ->firstOrFail();

        $this->authorize('reject', $follow);

        Notification::where('type', 'follow')
            ->where('source_user_id', $sourceUser->id)
            ->where('user_id', $user->id)
            ->delete();

        Notification::create([
            'user_id' => $follow->follower_id,
            'source_user_id' => $follow->followee_id,
            'type' => 'follow',
            'is_read' => false,
            'extra_data' => 'rejected',
        ]);

        Follow::where('follower_id', $sourceUser->id)
            ->where('followee_id', $user->id)
            ->delete();

        $notification->delete();

        return back()->with('success', 'Follow request rejected.');
    }

    public function followRequests()
    {
        $user = Auth::user();

        $requests = Follow::with('follower.profileImage')
            ->where('followee_id', $user->id)
            ->where('is_accepted', false)
            ->get();

        return Inertia::render('user/follow-requests', [
            'requests' => $requests,
        ]);
    }

    public function sendFollowRequest(User $user)
    {
        $authUser = auth()->user();

        if ($user->id === $authUser->id) {
            return back()->with('error', 'You cannot follow yourself.');
        }

        $existingRequest = Follow::where('follower_id', $authUser->id)
            ->where('followee_id', $user->id)
            ->where('is_accepted', false)
            ->first();

        if ($existingRequest) {
            $existingRequest->delete();

            Notification::where('type', 'follow')
                ->where('source_user_id', $authUser->id)
                ->where('user_id', $user->id)
                ->delete();

            return back()->with('success', 'Follow request deleted.');
        } else {
            Follow::create([
                'follower_id' => $authUser->id,
                'followee_id' => $user->id,
                'is_accepted' => false,
            ]);

            Notification::where('type', 'follow')
                ->where('source_user_id', $authUser->id)
                ->where('user_id', $user->id)
                ->delete();

            Notification::create([
                'user_id' => $user->id,
                'source_user_id' => $authUser->id,
                'type' => 'follow',
                'is_read' => false,
                'extra_data' => 'pending',
            ]);

            return back()->with('success', 'Follow request sent.');
        }
    }
}
