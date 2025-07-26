<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share([
            'auth' => function () {
                $user = Auth::user();
                return $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'profile_image_url' => $user->profileImage ? asset('storage/' . $user->profileImage->file_path) : null,
                ] : null;
            },
            'can_view_reports' => function () {
                $user = Auth::user();
                return $user && Gate::forUser($user)->allows('viewReports');
            },
        ]);
        Route::bind('user', function ($value) {
            return User::where('username', $value)->orWhere('id', $value)->firstOrFail();
        });
    }


}

