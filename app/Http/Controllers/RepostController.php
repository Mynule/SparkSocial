<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Post;
use App\Models\Repost;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RepostController extends Controller
{
    public function repost(Post $post): RedirectResponse
    {
        Repost::firstOrCreate([
            'user_id' => Auth::id(),
            'post_id' => $post->id,
        ]);

        if ($post->user_id !== Auth::id()) {
            NotificationService::create([
                'user_id' => $post->user_id,
                'source_user_id' => Auth::id(),
                'type' => 'repost',
                'post_id' => $post->id,
            ]);
        }

        return back()->with('success', 'Post reposted successfully.');
    }

    public function undo(Post $post): RedirectResponse
    {
        Repost::where([
            'user_id' => Auth::id(),
            'post_id' => $post->id,
        ])->delete();

        Notification::where('type', 'repost')
            ->where('source_user_id', Auth::id())
            ->where('post_id', $post->id)
            ->where('user_id', $post->user_id)
            ->delete();

        return back()->with('success', 'Repost removed successfully.');
    }
}
