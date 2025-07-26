<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\Notification;
use App\Models\Post;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    public function addFavorite(Post $post): RedirectResponse
    {
        Favorite::firstOrCreate([
            'user_id' => Auth::id(),
            'post_id' => $post->id,
        ]);

        if ($post->user_id !== Auth::id()) {
            NotificationService::create([
                'user_id' => $post->user_id,
                'source_user_id' => Auth::id(),
                'type' => 'favorite',
                'post_id' => $post->id,
            ]);
        }

        return back()->with('success', 'Post liked successfully.');
    }

    public function removeFavorite(Post $post): RedirectResponse
    {
        Favorite::where([
            'user_id' => Auth::id(),
            'post_id' => $post->id,
        ])->delete();

        Notification::where('type', 'favorite')
            ->where('source_user_id', Auth::id())
            ->where('post_id', $post->id)
            ->delete();

        return back()->with('success', 'Post unliked successfully.');
    }

    public function isFavorited(Post $post, Request $request)
    {
        $userId = Auth::id();
        $postId = $post->post_id;

        $isFavorited = Favorite::where('user_id', $userId)
            ->where('post_id', $postId)
            ->exists();

        return back()->with(['favorited' => $isFavorited]);
    }
}
