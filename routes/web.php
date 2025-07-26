<?php

//use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\RepostController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log; // <-- ДОДАЙТЕ ЦЕЙ РЯДОК


Route::get('/', function () {
    return Inertia::render('auth/login');
})->name('home');

Route::delete('/admin/reports/{report}/post/{post}/delete-all', [AdminReportController::class, 'destroyPostAndReport'])
    ->name('admin.reports.destroyPostAndReport');

Route::delete('/admin/reports/{report}/delete-only', [AdminReportController::class, 'destroyReport'])
    ->name('admin.reports.destroyReport');

Route::get('/api/auth/google/callback', [GoogleAuthController::class, 'googleAuth'])->name('api.auth.google.callback');
Route::get('/api/auth/google', [GoogleAuthController::class, 'googleLogin']) ->name('api.auth.google');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [PostController::class, 'index'])->name('home');
    Route::get('dashboard', [PostController::class, 'index'])->name('dashboard');
    Route::get('dashboard/users', [UserController::class, 'users'])->name('dashboard.users');
    Route::get('/users-list', [UserController::class, 'usersList'])->name('users.list');


    Route::get('/report-post/{post}', [ReportController::class, 'create'])->name('report.create');
    Route::post('/report-post/{post}', [ReportController::class, 'store'])->name('report.store');


    Route::get('/admin/reports', [AdminReportController::class, 'index'])
        // ->middleware('can:viewReports') з невідомих мені причин десь у Middleware не дає viewReports пройти
        ->name('admin.reports.index');


    Route::get('/user/favorites', [UserController::class, 'favorites'])->name('user.favorites');
    Route::get('/user/liked', [UserController::class, 'liked'])->name('user.liked');
    Route::get('/user/reposts', [UserController::class, 'reposts'])->name('user.reposts');
    Route::get('/user/following-posts', [UserController::class, 'followingPosts'])->name('user.followingPosts');
    Route::get('/user/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/user', [UserController::class, 'show'])->name('user.show');
    Route::get('/user/friends', [UserController::class, 'friends'])->name('user.friends');
    Route::get('/user/{user}/edit', [UserController::class, 'edit'])->name('user.edit');
    Route::patch('/user/{user}/update', [UserController::class, 'update'])->name('user.update');

    Route::get('/user/{user}', [UserController::class, 'show'])->name('user.show');
    Route::get('/user/search/{searchText}', [UserController::class, 'search'])->name('user.search');
    Route::get('/search-empty', [UserController::class, 'searchEmpty'])->name('user.searchEmpty');

    Route::post('/user/{user}/follow', [FollowController::class, 'follow'])->name('user.follow');
    Route::post('/user/{user}/unfollow', [FollowController::class, 'unfollow'])->name('user.unfollow');
    Route::post('/user/{user}/follow-request', [FollowController::class, 'sendFollowRequest'])->name('follow.request');
    Route::post('/user/{user}/{notification}/accept-request', [FollowController::class, 'acceptRequest'])->name('follow.acceptRequest');
    Route::post('/user/{user}/{notification}/reject-request', [FollowController::class, 'rejectRequest'])->name('follow.rejectRequest');
    Route::get('/is-following/{user}', [FollowController::class, 'isFollowing'])->name('isFollowing');
    Route::get('/user/{user}/followers', [FollowController::class, 'followers'])->name('user.followers');
    Route::get('/user/{user}/following', [FollowController::class, 'following'])->name('user.following');


    Route::post('/dashboard', [PostController::class, 'store'])->name('posts.store');
    Route::get('/post/{post}', [PostController::class, 'show'])->name('post.show');
    Route::delete('/post/{post}', [PostController::class, 'destroy']);
    Route::get('/show-popular-hashtags', [PostController::class, 'showPopularHashtags'])->name('showPopularHashtags');
    Route::get('/popular-hashtags', [PostController::class, 'popularHashtags'])->name('popularHashtags');
    Route::get('/posts-by-hashtag/{hashtag}', [PostController::class, 'postsByHashtag'])->name('postsByHashtag');

    Route::post('/like', [LikeController::class, 'like'])->name('like');
    Route::post('/unlike', [LikeController::class, 'unlike'])->name('unlike');
    Route::get('/{type}/{id}/is-liked', [LikeController::class, 'isLiked'])->name('like.isLiked');

    Route::post('/post/{post}/add-favorite', [FavoriteController::class, 'addFavorite'])->name('post.addFavorite');
    Route::post('/post/{post}/remove-favorite', [FavoriteController::class, 'removeFavorite'])->name('post.removeFavorite');
    Route::get('/post/{post}/is-favorited', [FavoriteController::class, 'isFavorited'])->name('post.isFavorited');

    Route::post('/post/{post}/comment', [CommentController::class, 'store'])->name('post.comment');
    Route::post('/comment/{comment}/delete', [CommentController::class, 'destroy'])->name('comment.delete');

    Route::post('/post/{post}/repost', [RepostController::class, 'repost']);
    Route::post('/post/{post}/undo', [RepostController::class, 'undo']);

    Route::get('/post/{post}/edit', [PostController::class, 'edit'])->name('post.edit');
    Route::patch('/post/{post}/update', [PostController::class, 'update'])->name('post.update');

    Route::get('/chat/everyone', [ChatController::class, 'getEveryoneChat'])->name('chat.getEveryoneChat');
    Route::post('/chat/message', [ChatController::class, 'message'])->name('chat.message');
    Route::get('/chat/user-chats', [ChatController::class, 'getUserChats'])->name('chat.getUserChats');
    Route::get('/chat/user-chat/{user}', [ChatController::class, 'getUserChat'])->name('chat.getUserChat');
    Route::post('/chat/user-chat/new/{user}', [ChatController::class, 'searchOrCreateUserChat'])->name('chat.createUserChat');
    Route::post('/chat/user-chat/post-message', [ChatController::class, 'postMessageToUserChat'])->name('chat.postMessageToUserChat');
    Route::delete('/chat/message/{message}', [ChatController::class, 'deleteMessage'])->name('chat.deleteMessage');
    Route::post('/chat/user-chat/{chat}/mark-messages-as-read', [ChatController::class, 'markAsRead'])->name('chat.markAsRead');

    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::patch('/notifications/{notification}/unread', [NotificationController::class, 'markAsUnread'])->name('notifications.unread');
    Route::patch('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');
    Route::patch('/notifications/mark-all-unread', [NotificationController::class, 'markAllAsUnread'])->name('notifications.markAllAsUnread');

    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadNotificationsCount'])->name('notifications.unreadCount');
    Route::get('/chat/user-chat/messages/unread-count', [ChatController::class, 'getUnreadMessagesCount'])->name('chat.getUnreadMessagesCount');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
