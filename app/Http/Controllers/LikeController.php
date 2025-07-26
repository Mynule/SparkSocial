<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Notification;
use App\Models\Post;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Models\Like;
use Illuminate\Support\Facades\Auth;


class LikeController extends Controller
{
    public function like(Request $request): RedirectResponse
    {
        $type = $request->input('type');
        $id = $request->input('id');

        $modelClass = match ($type) {
            'post' => Post::class,
            'comment' => Comment::class,
            default => abort(404, 'Invalid likeable type')
        };

        $likeable = $modelClass::findOrFail($id);

        Like::firstOrCreate([
            'user_id' => Auth::id(),
            'likeable_id' => $likeable->id,
            'likeable_type' => $modelClass,
        ]);

        if ($likeable->user_id !== Auth::id()) {
            NotificationService::create([
                'user_id' => $likeable->user_id,
                'source_user_id' => Auth::id(),
                'type' => 'like',
                'post_id' => $type === 'post' ? $likeable->id : ($likeable->post_id ?? null),
                'extra_data' => $type === 'comment' ? $likeable->content : null,

                'comment_id' => $type === 'comment' ? $likeable->id : null,
            ]);
        }

        return back()->with('success', class_basename($modelClass) . ' liked successfully.');
    }


    public function unlike(Request $request): RedirectResponse
    {
        $request->validate([
            'type' => 'required|string',
            'id' => 'required|integer',
        ]);

        $type = $request->input('type');
        $id = $request->input('id');
        $userId = Auth::id();

        $likeableClass = match ($type) {
            'post' => Post::class,
            'comment' => Comment::class,
            default => abort(404, 'Invalid likeable type.'),
        };

        Like::where([
            'user_id' => $userId,
            'likeable_id' => $id,
            'likeable_type' => $likeableClass,
        ])->delete();

        if ($type === 'post') {
            $post = Post::find($id);
            if ($post) {
                Notification::where('type', 'like')
                    ->where('source_user_id', $userId)
                    ->where('post_id', $post->id)
                    ->where('user_id', $post->user_id)
                    ->delete();
            }
        } elseif ($type === 'comment') {
            $comment = Comment::find($id);
            if ($comment) {
                Notification::where('type', 'like')
                    ->where('source_user_id', $userId)
                    ->where('comment_id', $comment->id)
                    ->where('user_id', $comment->user_id)
                    ->delete();
            }
        }

        return back()->with('success', ucfirst($type) . ' unliked successfully.');
    }


    public function isLiked($type, $id, Request $request)
    {
        $userId = Auth::id();

        $model = match ($type) {
            'post' => Post::class,
            'comment' => Comment::class,
            default => abort(400, 'Invalid likeable type.'),
        };

        $isLiked = Like::where('user_id', $userId)
            ->where('likeable_id', $id)
            ->where('likeable_type', $model)
            ->exists();

        return back()->with(['liked' => $isLiked]);
    }

}
