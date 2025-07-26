<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use App\Models\Report;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function create(Post $post)
    {
        return Inertia::render('report-post', [
            'post' => $post->load('user'),
            'translations' => trans('common'),
        ]);
    }

    public function store(Request $request, Post $post)
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        Report::create([
            'user_id' => auth()->id(),
            'post_id' => $post->id,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return redirect('/dashboard')->with('success', 'Your report has been submitted successfully.');
    }
}
