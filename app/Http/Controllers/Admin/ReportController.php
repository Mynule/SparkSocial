<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index()
    {
        $reports = Report::with(['post', 'user', 'post.user'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/ReportsIndex', [
            'reports' => $reports,
            'translations' => trans('common'),
        ]);
    }

    public function destroyPostAndReport(Report $report, Post $post)
    {
        if (!auth()->user()->isAdmin()) { return response()->json(['message' => 'Unauthorized'], 403); }

        try {
            DB::beginTransaction(); // Початок транзакції

            if ($report->post_id !== $post->id) {
                DB::rollBack();
            }

            $post->delete();

            $report->delete();

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();

        }
    }


    public function destroyReport(Report $report)
    {
        if (!auth()->user()->isAdmin()) { return response()->json(['message' => 'Unauthorized'], 403); }

        try {
            $report->delete();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete report.', 'error' => $e->getMessage()], 500);
        }
    }
}
