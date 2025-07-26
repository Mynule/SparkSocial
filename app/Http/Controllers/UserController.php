<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateUserRequest;
use App\Models\Like;
use App\Models\Media;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    use AuthorizesRequests;


    public function show(Request $request, User $user = null): Response
    {
        $currentUser = Auth::user();
        $user = $user ?? $currentUser;

        if (!$user) {
            abort(404, 'User not found');
        }

        $sort = $request->input('sort', 'latest');
        $canViewFullProfile = Gate::allows('view', $user);
        $user->loadCount(['followers', 'following', 'repostedPosts']);

        $originalPostsQuery = $user->posts()
            ->with(['user.profileImage', 'comments', 'likes', 'media', 'hashtags', 'favorites', 'repostedByUsers'])
            ->where(function ($query) use ($currentUser) {
                $query->where('is_private', 0);

                if ($currentUser) {
                    $query->orWhere(function ($subQuery) use ($currentUser) {
                        $subQuery->where('user_id', $currentUser->id)
                            ->orWhereHas('user.followers', function ($followersQuery) use ($currentUser) {
                                $followersQuery->where('follower_id', $currentUser->id);
                            });
                    });
                }
            });

        $repostedPostsQuery = Post::whereHas('repostedByUsers', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->with(['user.profileImage', 'comments', 'likes', 'media', 'hashtags', 'favorites', 'repostedByUsers'])
            ->where(function ($query) use ($currentUser) {
                $query->where('is_private', 0);

                if ($currentUser) {
                    $query->orWhere(function ($subQuery) use ($currentUser) {
                        $subQuery->where('user_id', $currentUser->id)
                            ->orWhereHas('user.followers', function ($followersQuery) use ($currentUser) {
                                $followersQuery->where('follower_id', $currentUser->id);
                            });
                    });
                }
            });

        if ($sort === 'reposts') {
            $originalPosts = collect();
            $repostedPosts = $repostedPostsQuery->latest()->get();
        } elseif ($sort === 'originals') {
            $originalPosts = $originalPostsQuery->latest()->get();
            $repostedPosts = collect();
        } else {
            $originalPosts = $originalPostsQuery->get();
            $repostedPosts = $repostedPostsQuery->get();
        }

        $combinedPosts = $originalPosts->merge($repostedPosts);

        if ($sort === 'most_liked') {
            $combinedPosts = $combinedPosts->sortByDesc(fn($post) => $post->likes->count())->values();
        } elseif ($sort === 'oldest') {
            $combinedPosts = $combinedPosts->sortBy('created_at')->values();
        } else {
            $combinedPosts = $combinedPosts->sortByDesc('created_at')->values();
        }

        $repostedPostIds = $user->repostedPosts()->pluck('posts.id');

        $totalLikes = $user->posts()
            ->whereNotIn('id', $repostedPostIds)
            ->withCount('likes')
            ->get()
            ->sum('likes_count');


        $posts = $combinedPosts->map(function ($post) use ($user, $currentUser) {

            return [
                'id' => $post->id,
                'content' => $post->content,
                'created_at' => $post->created_at->format('n/j/Y'),
                'user' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'username' => $post->user->username,
                    'profile_image' => $post->user->profileImage,
                    'is_verified' => $post->user->is_verified,
                ],

                'media' => $post->media->map(fn ($media) => [
                    'file_path' => $media->file_path,
                    'file_type' => $media->file_type,
                    'disk' => $media->disk,
                    'url' => $media->url,
                ]),
                'hashtags' => $post->hashtags->map(fn ($tag) => [
                    'id' => $tag->id,
                    'hashtag' => $tag->hashtag,
                ]),
                'is_private' => $post->is_private,
                'likes_count' => $post->likes->count(),
                'is_liked' => $currentUser ? $post->likes->contains('user_id', $currentUser->id) : false,
                'favorites_count' => $post->favorites->count(),
                'is_favorited' => $currentUser ? $post->favorites->contains('user_id', $currentUser->id) : false,
                'comments_count' => $post->comments->count(),
                'is_reposted' => $post->repostedByUsers->contains('id', $currentUser->id),
                'reposts_count' => $post->repostedByUsers->count(),
                'reposted_by_you' => $currentUser && $post->repostedByUsers->contains('id', $currentUser->id),
                'reposted_by_user' => $post->repostedByUsers
                    ->firstWhere('id', '!=', $post->user_id && $post->user_id != $currentUser?->id),
                'reposted_by_recent' => $post->repostedByUsers()
                    ->where('user_id', '!=', $post->user_id)
                    ->orderByPivot('created_at', 'desc')
                    ->take(3)
                    ->get()
                    ->map(function ($user) {
                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'username' => $user->username,
                            'profile_image' => $user->profileImage,
                            'is_verified' => $user->is_verified,
                        ];
                    }),
                'current_user' => [
                    'id' => $currentUser->id,
                    'username' => $currentUser->username,
                    'profile_image' => $currentUser->profileImage,
                    'name' => $currentUser->name,
                    'is_verified' => $currentUser->is_verified,
                ],
            ];
        });


        return Inertia::render('user/show', [
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'name' => $user->name,
                'bio' => $canViewFullProfile ? $user->bio : null,
                'profile_image' => $user->profileImage,
                'cover_image' => $canViewFullProfile && $user->coverImage ? $user->coverImage : null,
                'location' => $canViewFullProfile ? $user->location : null,
                'website' => $canViewFullProfile ? $user->website : null,
                'date_of_birth' => $canViewFullProfile ? optional($user->date_of_birth)->format('F j, Y') : null,
                'is_verified' => $user->is_verified,
                'is_private' => $user->is_private,
                'status' => $canViewFullProfile ? $user->status : null,
                'created_at' => $canViewFullProfile ? $user->created_at->format('F j, Y') : null,
                'followers_count' => $user->followers_count,
                'following_count' => $user->following_count,
                'is_following' => Auth::check() && $user->followers()->where('follower_id', Auth::id())->exists(),
                'is_friend' => Auth::check() && Auth::user()->friends()->where('followee_id', $user->id)->exists(),
                'canViewFullProfile' => $canViewFullProfile,
                'has_sent_follow_request' => Auth::check() && auth()->user()->pendingFollowRequests()
                        ->where('followee_id', $user->id)
                        ->exists(),
                'total_likes' => $totalLikes,
            ],
            'posts' => $posts,
            'filters' => [
                'sort' => $sort,
            ],
            'followers_string' => trans_choice('common.followers_count', $user->followers_count),
            'following_string' => trans_choice('common.following_count', $user->following_count),
        ]);
    }


    public function edit(User $user): Response
    {
        $this->authorize('update', $user);
        return Inertia::render('user/edit', [
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'name' => $user->name,
                'bio' => $user->bio,
                'profile_image' => $user->profileImage,
                'cover_image' => $user->coverImage,
                'location' => $user->location,
                'website' => $user->website,
                'date_of_birth' => optional($user->date_of_birth)->format('F j, Y'),
                'is_verified' => $user->is_verified,
                'is_private' => $user->is_private,
                'status' => $user->status,

            ],
        ]);
    }

//    public function update(UpdateUserRequest $request, User $user)
//    {
//        $this->authorize('update', $user);
//
//        if ($request->hasFile('profile_image')) {
//            if ($user->profileImage) {
//                Storage::disk('public')->delete($user->profileImage->file_path);
//                $user->profileImage()->delete();
//            }
//
//            $media = new Media([
//                'file_path' => $request->file('profile_image')->store('profile_images', 'public'),
//                'file_type' => 'profile',
//                'mediable_id' => $user->id,
//                'mediable_type' => User::class,
//            ]);
//
//            $media->save();
//        }
//        if ($request->hasFile('cover_image')) {
//            if ($user->coverImage) {
//                Storage::disk('public')->delete($user->coverImage->file_path);
//                $user->coverImage()->delete();
//            }
//
//            $media = new Media([
//                'file_path' => $request->file('cover_image')->store('cover_images', 'public'),
//                'file_type' => 'cover',
//                'mediable_id' => $user->id,
//                'mediable_type' => User::class,
//            ]);
//
//            $media->save();
//        }
//
//        $user->update($request->validated());
//
//        return redirect()->route('user.show', $user->username)
//            ->with('success', 'Profile updated successfully.');
//    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $this->authorize('update', $user);

        $disk = config('filesystems.default');

        if ($request->hasFile('profile_image')) {
            if ($user->profileImage) {
                Storage::disk($disk)->delete($user->profileImage->file_path);
                $user->profileImage()->delete();
            }
            $path = $request->file('profile_image')->store('profile_images', $disk);

            $media = new Media([
                'file_path' => $path,
                'file_type' => 'profile',
                'disk' => $disk,
                'mediable_id' => $user->id,
                'mediable_type' => User::class,
            ]);

            $media->save();
        }
        elseif ($request->boolean('remove_profile_image') && $user->profileImage) {
            Storage::disk($disk)->delete($user->profileImage->file_path);
            $user->profileImage()->delete();
        }

        if ($request->hasFile('cover_image')) {
            if ($user->coverImage) {
                Storage::disk($disk)->delete($user->coverImage->file_path);
                $user->coverImage()->delete();
            }

            $path = $request->file('cover_image')->store('cover_images', $disk);

            $media = new Media([
                'file_path' => $path,
                'file_type' => 'cover',
                'disk' => $disk,
                'mediable_id' => $user->id,
                'mediable_type' => User::class,
            ]);

            $media->save();
        }
        elseif ($request->boolean('remove_cover_image') && $user->coverImage) {
            Storage::disk($disk)->delete($user->coverImage->file_path);
            $user->coverImage()->delete();
        }

        $user->update($request->validated());

        return redirect()->route('user.show', $user->username)
            ->with('success', 'Profile updated successfully.');
    }


    public function users(Request $request): Response
    {
        $currentUser = Auth::user();
        $sort = $request->query('sort', 'newest');

        $usersQuery = User::with('profileImage')->withCount('followers');

        switch ($sort) {
            case 'oldest':
                $usersQuery->oldest();
                break;
            case 'popular':
                $usersQuery->orderByDesc('followers_count');
                break;
            case 'least_followed':
                $usersQuery->orderBy('followers_count');
                break;
            case 'following':
                if ($currentUser) {
                    $usersQuery->whereHas('followers', fn($query) => $query->where('follower_id', $currentUser->id));
                }
                break;
            case 'followers':
                if ($currentUser) {
                    $usersQuery->whereHas('following', fn($query) => $query->where('followee_id', $currentUser->id));
                }
                break;
            case 'mutual_subscribers':
                if ($currentUser) {
                    $usersQuery->whereHas('followers', function ($query) use ($currentUser) {
                        $query->where('follower_id', $currentUser->id);
                    })->whereHas('following', function ($query) use ($currentUser) {
                        $query->where('followee_id', $currentUser->id);
                    });
                }
                break;
            default:
                $usersQuery->latest();
                break;
        }

        $users = $usersQuery->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'profile_image' => $user->profileImage,
                'followers_count' => $user->followers_count,
                'is_verified' => $user->is_verified,
            ];
        });

        return Inertia::render('user-dashboard', [
            'users' => $users,
            'sort' => $sort,
        ]);
    }

    public function search(Request $request, string $searchText = ''): Response
    {
        $currentUser = Auth::user();
        $sort = $request->query('sort', 'newest');

        $usersQuery = User::with('profileImage')->withCount('followers');

        if (trim($searchText) !== '') {
            $usersQuery->where(function ($query) use ($searchText) {
                $query->where('name', 'like', "%{$searchText}%")
                    ->orWhere('username', 'like', "%{$searchText}%");
            });
        }

        switch ($sort) {
            case 'oldest':
                $usersQuery->oldest();
                break;
            case 'popular':
                $usersQuery->orderByDesc('followers_count');
                break;
            case 'least_followed':
                $usersQuery->orderBy('followers_count');
                break;
            case 'following':
                if ($currentUser) {
                    $usersQuery->whereHas('followers', fn($query) => $query->where('follower_id', $currentUser->id));
                }
                break;
            case 'followers':
                if ($currentUser) {
                    $usersQuery->whereHas('following', fn($query) => $query->where('followee_id', $currentUser->id));
                }
                break;
            case 'mutual_subscribers':
                if ($currentUser) {
                    $usersQuery->whereHas('followers', function ($query) use ($currentUser) {
                        $query->where('follower_id', $currentUser->id);
                    })->whereHas('following', function ($query) use ($currentUser) {
                        $query->where('followee_id', $currentUser->id);
                    });
                }
                break;
            default:
                $usersQuery->latest();
                break;
        }

        $users = $usersQuery->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'profile_image' => $user->profileImage,
                'followers_count' => $user->followers_count,
                'is_verified' => $user->is_verified,
            ];
        });

        return Inertia::render('user/search-users', [
            'users' => $users,
            'sort' => $sort,
            'searchText' => $searchText,
        ]);
    }

    public function searchEmpty(Request $request): Response
    {
        return Inertia::render('user/search-users', [
            'users' => [],
            'sort' => 'oldest',
            'searchText' => '',
        ]);
    }

    public function usersList(Request $request)
    {
        $authUser = $request->user();

        $excludedUserIds = collect([
            $authUser->following()->pluck('users.id'),
            [$authUser->id]
        ])->flatten();

        $users = User::with('profileImage')
            ->withCount('followers')
            ->whereNotIn('id', $excludedUserIds)
            ->orderByDesc('followers_count')
            ->take(5)
            ->get();

        return $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'profile_image' => $user->profileImage,
                'followers_count' => $user->followers_count,
                'is_verified' => $user->is_verified,
            ];
        });
    }


    public function favorites(Request $request): Response
    {
        $currentUser = Auth::user();

        if (!$currentUser) {
            abort(403, 'Unauthorized');
        }

        $sort = $request->input('sort', 'latest');

        $favoritedPostsQuery = $currentUser->favorites()
            ->with(['user.profileImage', 'comments', 'likes', 'media', 'hashtags', 'favorites', 'repostedByUsers', 'user.followers'])
            ->where(function ($query) use ($currentUser) {
                $query->where('posts.is_private', 0)
                    ->orWhere(function ($subQuery) use ($currentUser) {
                        $subQuery->where('posts.user_id', $currentUser->id)
                            ->orWhereHas('user.followers', function ($followersQuery) use ($currentUser) {
                                $followersQuery->where('follower_id', $currentUser->id);
                            });
                    });
            });

        $favoritedPosts = match ($sort) {
            'oldest' => $favoritedPostsQuery->oldest()->get(),
            'most_liked' => $favoritedPostsQuery->get()->sortByDesc(fn($post) => $post->likes->count())->values(),
            'reposted_friends' => $favoritedPostsQuery->get()->filter(function ($post) use ($currentUser) {
                return $currentUser->following->contains('id', $post->user_id);
            })->values(),
            default => $favoritedPostsQuery->latest()->get(),
        };

        $posts = $favoritedPosts->map(function ($post) use ($currentUser) {
            return [
                'id' => $post->id,
                'content' => $post->content,
                'created_at' => $post->created_at->format('n/j/Y'),
                'user' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'username' => $post->user->username,
                    'profile_image' => $post->user->profileImage,
                    'is_verified' => $post->user->is_verified,
                ],
                'media' => $post->media->map(fn ($media) => [
                    'file_path' => $media->file_path,
                    'file_type' => $media->file_type,
                    'disk' => $media->disk,
                    'url' => $media->url,
                ]),
                'hashtags' => $post->hashtags->map(fn ($tag) => [
                    'id' => $tag->id,
                    'hashtag' => $tag->hashtag,
                ]),
                'is_private' => $post->is_private,
                'likes_count' => $post->likes->count(),
                'is_liked' => $currentUser ? $post->likes->contains('user_id', $currentUser->id) : false,
                'favorites_count' => $post->favorites->count(),
                'is_favorited' => $currentUser ? $post->favorites->contains('user_id', $currentUser->id) : false,
                'comments_count' => $post->comments->count(),
                'is_reposted' => $currentUser ? $post->repostedByUsers->contains('id', $currentUser->id) : false,
                'reposts_count' => $post->repostedByUsers->count(),
                'reposted_by_you' => $currentUser && $post->repostedByUsers->contains('id', $currentUser->id),
                'reposted_by_user' => $post->repostedByUsers
                    ->firstWhere('id', '!=', $post->user_id && $post->user_id != $currentUser?->id),
                'reposted_by_recent' => $post->repostedByUsers()
                    ->where('user_id', '!=', $post->user_id)
                    ->where('user_id', '!=', $currentUser->id)
                    ->with(['followers', 'following'])
                    ->get()
                    ->sortByDesc(function ($user) use ($currentUser) {
                        $isFollowed = $user->followers->contains('id', $currentUser->id);
                        $isFollowing = $user->following->contains('id', $currentUser->id);
                        return $isFollowed || $isFollowing ? 1 : 0;
                    })
                    ->values()
                    ->take(3)
                    ->map(function ($user) {
                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'username' => $user->username,
                            'profile_image' => $user->profileImage,
                            'is_verified' => $user->is_verified,
                        ];
                    })
                    ->values()
                    ->toArray(),
                'current_user' => [
                    'id' => $currentUser->id,
                    'username' => $currentUser->username,
                    'profile_image' => $currentUser->profileImage,
                    'name' => $currentUser->name,
                    'is_verified' => $currentUser->is_verified,
                ],
            ];
        });

        return Inertia::render('user/favorites', [
            'user' => $currentUser,
            'posts' => $posts,
            'filters' => [
                'sort' => $sort,
            ],
        ]);
    }


    public function liked(Request $request): Response
    {
        $currentUser = Auth::user();

        if (!$currentUser) {
            abort(403, 'Unauthorized');
        }

        $sort = $request->query('sort', 'latest');

        $followingIds = $currentUser->following->pluck('id');

        $likedPostIds = Like::where('user_id', $currentUser->id)
            ->where('likeable_type', Post::class)
            ->pluck('likeable_id');

        $likedQuery = Post::with([
            'user.profileImage',
            'comments',
            'likes',
            'media',
            'user.followers',
            'favorites',
            'hashtags',
            'repostedByUsers',
        ])
            ->whereIn('id', $likedPostIds)
            ->where(function ($query) use ($currentUser, $followingIds) {
                $query->where('is_private', 0)
                    ->orWhere(function ($subQuery) use ($currentUser, $followingIds) {
                        $subQuery->where('user_id', $currentUser->id)
                            ->orWhereIn('user_id', $followingIds);
                    });
            });

        switch ($sort) {
            case 'oldest':
                $likedQuery->oldest();
                break;

            case 'most_liked':
                $likedQuery->withCount('likes')->orderByDesc('likes_count');
                break;

            case 'following':
                $likedQuery->whereIn('posts.user_id', $followingIds);
                break;

            case 'latest':
            default:
                $likedQuery->latest();
                break;
        }

        $likedPosts = $likedQuery->get()->map(function ($post) use ($currentUser, $followingIds) {
            return [
                'id' => $post->id,
                'content' => $post->content,
                'created_at' => $post->created_at->format('n/j/Y'),
                'user' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'username' => $post->user->username,
                    'profile_image' => $post->user->profileImage,
                    'is_verified' => $post->user->is_verified,
                ],
                'media' => $post->media->map(fn ($media) => [
                    'file_path' => $media->file_path,
                    'file_type' => $media->file_type,
                    'disk' => $media->disk,
                    'url' => $media->url,
                ]),
                'hashtags' => $post->hashtags->map(fn ($tag) => [
                    'id' => $tag->id,
                    'hashtag' => $tag->hashtag,
                ]),
                'is_private' => $post->is_private,
                'likes_count' => $post->likes->count(),
                'is_liked' => $post->likes->contains('user_id', $currentUser->id),
                'favorites_count' => $post->favorites->count(),
                'is_favorited' => $post->favorites->contains('user_id', $currentUser->id),
                'comments_count' => $post->comments->count(),
                'is_reposted' => $post->repostedByUsers->contains('id', $currentUser->id),
                'reposts_count' => $post->repostedByUsers->count(),
                'reposted_by_you' => $post->repostedByUsers->contains('id', $currentUser->id),
                'reposted_by_user' => $post->repostedByUsers
                    ->whereNotIn('id', [$post->user_id, $currentUser->id])
                    ->first(),
                'reposted_by_recent' => $post->repostedByUsers()
                    ->where('user_id', '!=', $post->user_id)
                    ->where('user_id', '!=', $currentUser->id)
                    ->with(['followers', 'following'])
                    ->get()
                    ->sortByDesc(function ($user) use ($currentUser) {
                        $isFollowed = $user->followers->contains('id', $currentUser->id);
                        $isFollowing = $user->following->contains('id', $currentUser->id);
                        return $isFollowed || $isFollowing ? 1 : 0;
                    })
                    ->values()
                    ->take(3)
                    ->map(function ($user) {
                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'username' => $user->username,
                            'profile_image' => $user->profileImage,
                            'is_verified' => $user->is_verified,
                        ];
                    })
                    ->values()
                    ->toArray(),
                'current_user' => [
                    'id' => $currentUser->id,
                    'username' => $currentUser->username,
                    'profile_image' => $currentUser->profileImage,
                    'name' => $currentUser->name,
                    'is_verified' => $currentUser->is_verified,
                ],
            ];
        });

        return Inertia::render('user/liked', [
            'user' => $currentUser,
            'posts' => $likedPosts,
            'filters' => [
                'sort' => $sort,
            ],
        ]);
    }




    public function followingPosts(Request $request): Response
    {
        $currentUser = Auth::user();

        if (!$currentUser) {
            abort(403, 'Unauthorized');
        }

        $sort = $request->query('sort', 'latest');

        $query = $currentUser->followingPosts()
            ->with(['user.profileImage', 'comments', 'likes', 'media', 'favorites', 'hashtags', 'repostedByUsers']);

        switch ($sort) {
            case 'oldest':
                $query->oldest();
                break;
            case 'most_liked':
                $query->withCount('likes')->orderByDesc('likes_count');
                break;
            default:
                $query->latest();
                break;
        }

        $followingPosts = $query->get()
            ->map(function ($post) use ($currentUser) {
                return [
                    'id' => $post->id,
                    'content' => $post->content,
                    'created_at' => $post->created_at->format('n/j/Y'),
                    'user' => [
                        'id' => $post->user->id,
                        'name' => $post->user->name,
                        'username' => $post->user->username,
                        'profile_image' => $post->user->profileImage,
                        'is_verified' => $post->user->is_verified,
                    ],
                    'media' => $post->media->map(fn ($media) => [
                        'file_path' => $media->file_path,
                        'file_type' => $media->file_type,
                        'disk' => $media->disk,
                        'url' => $media->url,
                    ]),
                    'hashtags' => $post->hashtags->map(fn ($tag) => [
                        'id' => $tag->id,
                        'hashtag' => $tag->hashtag,
                    ]),
                    'is_private' => $post->is_private,
                    'likes_count' => $post->likes->count(),
                    'is_liked' => $currentUser ? $post->likes->contains('user_id', $currentUser->id) : false,
                    'favorites_count' => $post->favorites->count(),
                    'is_favorited' => $currentUser ? $post->favorites->contains('user_id', $currentUser->id) : false,
                    'comments_count' => $post->comments->count(),
                    'is_reposted' => $currentUser ? $post->repostedByUsers->contains('id', $currentUser->id) : false,
                    'reposts_count' => $post->repostedByUsers->count(),
                    'reposted_by_you' => $currentUser && $post->repostedByUsers->contains('id', $currentUser->id),
                    'reposted_by_user' => $post->repostedByUsers
                        ->firstWhere('id', '!=', $post->user_id && $post->user_id != $currentUser?->id),
                    'reposted_by_recent' => $post->repostedByUsers()
                        ->where('user_id', '!=', $post->user_id)
                        ->where('user_id', '!=', $currentUser->id)
                        ->with(['followers', 'following'])
                        ->get()
                        ->sortByDesc(function ($user) use ($currentUser) {
                            $isFollowed = $user->followers->contains('id', $currentUser->id);
                            $isFollowing = $user->following->contains('id', $currentUser->id);
                            return $isFollowed || $isFollowing ? 1 : 0;
                        })
                        ->values()
                        ->take(3)
                        ->map(function ($user) {
                            return [
                                'id' => $user->id,
                                'name' => $user->name,
                                'username' => $user->username,
                                'profile_image' => $user->profileImage,
                                'is_verified' => $user->is_verified,
                            ];
                        })
                        ->values()
                        ->toArray(),
                    'current_user' => [
                        'id' => $currentUser->id,
                        'username' => $currentUser->username,
                        'profile_image' => $currentUser->profileImage,
                        'name' => $currentUser->name,
                        'is_verified' => $currentUser->is_verified,
                    ],
                ];
            });

        return Inertia::render('user/following-posts', [
            'user' => $currentUser,
            'posts' => $followingPosts,
            'filters' => [
                'sort' => $sort,
            ],
        ]);
    }



    public function friends(Request $request): Response
    {
        $currentUser = Auth::user();

        $sort = $request->input('sort', 'latest');

        $friendsQuery = $currentUser->friends()
            ->with(['profileImage', 'followers'])
            ->withCount('followers');


        switch ($sort) {
            case 'latest':
                $friendsQuery->orderBy('pivot_created_at', 'desc');
                break;

            case 'oldest':
                $friendsQuery->orderBy('pivot_created_at', 'asc');
                break;

            case 'popular':
                $friendsQuery->orderByDesc('followers_count');
                break;
            case 'least_followers':
                $friendsQuery->orderBy('followers_count');
                break;
        }

        $friends = $friendsQuery->get();

        $mappedFriends = $friends->map(function ($friend) use ($currentUser) {
            return [
                'id' => $friend->id,
                'name' => $friend->name,
                'username' => $friend->username,
                'profile_image' => $friend->profileImage,
                'is_private' => $friend->is_private,
                'is_followed' => $currentUser?->following->contains('id', $friend->id) ?? false,
                'has_sent_follow_request' => $currentUser?->pendingFollowRequests()->where('followee_id', $friend->id)->exists() ?? false,
                'followers_count' => $friend->followers->count(),
                'is_friend' => $currentUser?->friends()->pluck('id')->contains($friend->id) ?? false,
                'is_verified' => $friend->is_verified,
            ];
        });

        return Inertia::render('user/friends', [
            'title' => 'Friends',
            'users' => $mappedFriends,
            'filters' => ['sort' => $sort],
            'user' => [
                'id' => $currentUser->id,
                'name' => $currentUser->name,
                'username' => $currentUser->username,
                'is_verified' => $currentUser->is_verified,
                'profile_image' => $currentUser->profileImage,
                'is_following' => $currentUser?->followers()->where('follower_id', $currentUser->id)->exists() ?? false,
                'has_sent_follow_request' => $currentUser?->pendingFollowRequests()->where('followee_id', $currentUser->id)->exists() ?? false,
            ],
        ]);
    }









    public function reposts(Request $request, User $user = null): Response
    {
        $currentUser = Auth::user();
        $user = $user ?? $currentUser;

        if (!$user) {
            abort(404, 'User not found');
        }

        $sort = $request->input('sort', 'latest');

        $repostedPostsQuery = Post::whereHas('repostedByUsers', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->with(['user.profileImage', 'comments', 'likes', 'media', 'hashtags', 'favorites', 'repostedByUsers'])
            ->where(function ($query) use ($currentUser) {
                $query->where('is_private', 0)
                    ->orWhere(function ($subQuery) use ($currentUser) {
                        $subQuery->where('user_id', $currentUser->id)
                            ->orWhereHas('user.followers', function ($followersQuery) use ($currentUser) {
                                $followersQuery->where('follower_id', $currentUser->id);
                            });
                    });
            });

        $repostedPosts = match ($sort) {
            'oldest' => $repostedPostsQuery->oldest()->get(),
            'most_liked' => $repostedPostsQuery->get()->sortByDesc(fn($post) => $post->likes->count())->values(),
            'reposted_friends' => $repostedPostsQuery->get()->filter(function ($post) use ($currentUser) {
                return $currentUser->following->contains('id', $post->user_id);
            })->values(),
            default => $repostedPostsQuery->latest()->get(),
        };

        $posts = $repostedPosts->map(function ($post) use ($user, $currentUser) {
            return [
                'id' => $post->id,
                'content' => $post->content,
                'created_at' => $post->created_at->format('n/j/Y'),
                'user' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'username' => $post->user->username,
                    'profile_image' => $post->user->profileImage,
                    'is_verified' => $post->user->is_verified,
                ],
                'media' => $post->media->map(fn ($media) => [
                    'file_path' => $media->file_path,
                    'file_type' => $media->file_type,
                    'disk' => $media->disk,
                    'url' => $media->url,
                ]),
                'hashtags' => $post->hashtags->map(fn ($tag) => [
                    'id' => $tag->id,
                    'hashtag' => $tag->hashtag,
                ]),
                'is_private' => $post->is_private,
                'likes_count' => $post->likes->count(),
                'is_liked' => $currentUser ? $post->likes->contains('user_id', $currentUser->id) : false,
                'favorites_count' => $post->favorites->count(),
                'is_favorited' => $currentUser ? $post->favorites->contains('user_id', $currentUser->id) : false,
                'comments_count' => $post->comments->count(),
                'is_reposted' => $user->repostedPosts->contains($post->id),
                'reposts_count' => $post->repostedByUsers->count(),
                'reposted_by_you' => $currentUser && $post->repostedByUsers->contains('id', $currentUser->id),
                'reposted_by_user' => $post->repostedByUsers
                    ->firstWhere('id', '!=', $post->user_id && $post->user_id != $currentUser?->id),
                'reposted_by_recent' => $post->repostedByUsers()
                    ->where('user_id', '!=', $post->user_id)
                    ->where('user_id', '!=', $currentUser->id)
                    ->with(['followers', 'following'])
                    ->get()
                    ->sortByDesc(function ($user) use ($currentUser) {
                        $isFollowed = $user->followers->contains('id', $currentUser->id);
                        $isFollowing = $user->following->contains('id', $currentUser->id);
                        return $isFollowed || $isFollowing ? 1 : 0;
                    })
                    ->values()
                    ->take(3)
                    ->map(function ($user) {
                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'username' => $user->username,
                            'profile_image' => $user->profileImage,
                            'is_verified' => $user->is_verified,
                        ];
                    })
                    ->values()
                    ->toArray(),

                'current_user' => [
                    'id' => $currentUser->id,
                    'username' => $currentUser->username,
                    'profile_image' => $currentUser->profileImage,
                    'name' => $currentUser->name,
                    'is_verified' => $currentUser->is_verified,
                ],
            ];
        });

        return Inertia::render('user/reposts', [
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'name' => $user->name,
                'profile_image' => $user->profileImage,
                'is_verified' => $user->is_verified,
            ],
            'posts' => $posts,
            'filters' => [
                'sort' => $sort,
            ],
        ]);
    }



}
