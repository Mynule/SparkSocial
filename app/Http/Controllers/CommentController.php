<?php

namespace App\Http\Controllers;

use App\Events\CommentCreated;
use App\Http\Requests\StoreCommentRequest;
use App\Models\Notification;
use App\Models\Post;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Comment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;

class CommentController extends Controller
{
    public function store(StoreCommentRequest $request, Post $post): RedirectResponse
    {
        $request->validated();

        $comment = Comment::create([
            'user_id' => Auth::id(),
            'post_id' => $request['post_id'],
            'parent_comment_id' =>  $request['parent_comment_id'],
            'content' => $request['content'],
        ]);

        if ($post->user_id !== Auth::id()) {
            NotificationService::create([
                'user_id' => $post->user_id,
                'source_user_id' => Auth::id(),
                'type' => 'comment',
                'post_id' => $post->id,
                'extra_data' => $comment->content,
                'comment_id' => $comment->id,
            ]);
        }

        event(new CommentCreated($comment));

        return redirect()->back()->with('success', 'Comment added successfully.');
    }

    public function destroy(Comment $comment): RedirectResponse
    {
        if (Auth::id() !== $comment->user_id) {
            return Redirect::back()->with(['error' => 'Unauthorized'], 403);
        }

        Notification::where('type', 'comment')
            ->where('source_user_id', $comment->user_id)
            ->where('comment_id', $comment->id)
            ->delete();


        $comment->delete();
        return redirect()->back()->with(['message' => 'Comment deleted successfully']);
    }
}
