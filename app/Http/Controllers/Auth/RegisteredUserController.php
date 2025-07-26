<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:20'],
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'username' => $this->generateUsername($request->name),
            'bio' => null,
            'profile_image_url' => null,
            'cover_image_url' => null,
            'location' => null,
            'website' => null,
            'date_of_birth' => null,
            'is_verified' => false,
            'is_private' => false,
            'status' => 'active',
            //'email_verified_at' => now(), ///!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }

//    private function generateUsername(string $name): string
//    {
//        $baseUsername = Str::slug($name, '_');
//        $username = $baseUsername;
//        $count = 1;
//
//        while (User::where('username', $username)->exists()) {
//            $username = $baseUsername . '_' . $count;
//            $count++;
//        }
//
//        return $username;
//    }

    private function generateUsername(): string
    {
        $adjectives = ['Swift', 'Brave', 'Fierce', 'Witty', 'Happy', 'Clever', 'Bold', 'Cool', 'Epic', 'Mighty'];
        $nouns = ['Tiger', 'Falcon', 'Panda', 'Wolf', 'Dragon', 'Hawk', 'Phoenix', 'Bear', 'Lion', 'Shark'];

        do {
            $username = $adjectives[array_rand($adjectives)] . $nouns[array_rand($nouns)] . rand(1000, 9999);
        } while (User::where('username', $username)->exists());

        return $username;
    }
}
