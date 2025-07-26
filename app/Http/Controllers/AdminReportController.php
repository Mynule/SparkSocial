<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;


class AdminReportController extends Controller
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
}
