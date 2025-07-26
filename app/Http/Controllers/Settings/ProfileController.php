<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{

//    /**
//     * Display the specified user's profile.
//     */
//    public function show(User $user = null): Response
//    {
//        $user = $user ?? Auth::user();
//
//        if (!$user) {
//            abort(404, 'User not found');
//        }
//
//        return Inertia::render('user/show', [
//            'user' => [
//                'id' => $user->id,
//                'username' => $user->username,
//                'email' => $user->email,
//                'name' => $user->name,
//                'bio' => $user->bio,
//                'profile_image_url' => $user->profile_image_url,
//                'cover_image_url' => $user->cover_image_url,
//                'location' => $user->location,
//                'website' => $user->website,
//                'date_of_birth' => $user->date_of_birth ? Carbon::parse($user->date_of_birth)->format('F j, Y') : null,
//                'is_verified' => $user->is_verified,
//                'is_private' => $user->is_private,
//                'status' => $user->status,
//                'created_at' => $user->created_at,
//            ]
//        ]);
//    }

    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
