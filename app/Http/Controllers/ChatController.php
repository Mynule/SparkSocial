<?php

namespace App\Http\Controllers;

use App\Events\GotPersonalMessage;
use App\Events\UserMessageCreated;
use App\Events\UserMessageIsReadChange;
use App\Jobs\SendMessage;
use App\Jobs\SendPersonalMessage;
use App\Models\Chat;
use App\Models\Message;
use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\JsonResponse;

class ChatController extends Controller
{
    public function getEveryoneChat(Request $request): Response
    {
        $user = Auth::user();
        $messages = Message::with(['user.profileImage'])
            ->where('chat_id',null)
            ->latest()
            ->take(50)
            ->get()
            ->sortBy('created_at')
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'text' => $message->text,
                    'chat_id' => $message->chat_id,
                    'time' => $message->created_at->format('d M Y, H:i:s'),
                    'user' => [
                        'id' => $message->user->id,
                        'name' => $message->user->name,
                        'username' => $message->user->username,
                        'profile_image' => $message->user->profileImage,
                        'is_verified' => $message->user->is_verified,
                    ],
                ];
            })
            ->values();


        return Inertia::render('chat/everyone-chat', [
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'is_verified' => $user->is_verified,
            ],
            'init_messages' => $messages,
        ]);
    }

    public function message(Request $request): RedirectResponse
    {
        $message = Message::create([
            'user_id' => auth()->id(),
            'text' => $request->get('text'),
        ]);
        SendMessage::dispatch($message);

        return redirect()->back();
    }

    public function getUserChats(Request $request): Response
    {
        $user = Auth::user();

        $chats = Chat::with(['user1.profileImage', 'user2.profileImage', 'lastMessage'])
            ->where(function ($query) use ($user) {
                $query->where('user1_id', $user->id)
                    ->orWhere('user2_id', $user->id);
            })
            ->get();

        $chatUserIds = $chats->map(function ($chat) use ($user) {
            return $chat->user1_id === $user->id ? $chat->user2_id : $chat->user1_id;
        })->push($user->id);

        $chatData = $chats->map(function ($chat) use ($user) {
            $otherUser = $chat->user1_id === $user->id ? $chat->user2 : $chat->user1;

            $unreadCount = $chat->messages()
                ->whereNull('read_at')
                ->where('user_id', '!=', $user->id)
                ->count();

            return [
                'id' => $chat->id,
                'user' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'username' => $otherUser->username,
                    'profile_image' => $otherUser->profileImage,
                    'is_verified' => $otherUser->is_verified,
                ],
                'last_message' => $chat->lastMessage ? [
                    'user_id' => $chat->lastMessage->user_id,
                    'text' => $chat->lastMessage->text,
                    'time' => $chat->lastMessage->created_at->format('d M Y, H:i:s'),
                    'created_at' => $chat->lastMessage->created_at,
                ] : null,
                'unread_count' => $unreadCount,
            ];
        })->sortByDesc(fn ($chat) => $chat['last_message']['created_at'] ?? now()->subYears(10))->values();

        $allUsers = User::with('profileImage')
            ->where('id', '!=', $user->id)
            ->whereNotIn('id', $chatUserIds)
            ->get();

        $mutuals = $user->friends()->pluck('id')->toArray();
        $followers = $user->followers()->pluck('id')->toArray();
        $following = $user->following()->pluck('id')->toArray();

        $groupedUsers = [
            'Mutuals' => [],
            'Followers' => [],
            'Following' => [],
            'Others' => [],
        ];

        foreach ($allUsers as $u) {
            if (in_array($u->id, $mutuals)) {
                $groupedUsers['Mutuals'][] = $u;
            } elseif (in_array($u->id, $followers)) {
                $groupedUsers['Followers'][] = $u;
            } elseif (in_array($u->id, $following)) {
                $groupedUsers['Following'][] = $u;
            } else {
                $groupedUsers['Others'][] = $u;
            }
        }

        $users = [];
        foreach ($groupedUsers as $group => $list) {
            $users[] = [
                'label' => $group,
                'users' => collect($list)->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'username' => $user->username,
                        'profile_image' => $user->profileImage,
                    ];
                }),
            ];
        }

        return Inertia::render('chat/user-chats', [
            'chats' => $chatData,
            'users' => $users,
        ]);
    }



    public function getUserChat(User $otherUser): Response
    {
        $user = Auth::user();

        $chat = Chat::getChat($user->id, $otherUser->id);

        if (!$chat) {
            abort(404, 'Chat not found');
        }

        $messages = Message::with(['user.profileImage'])
            ->where('chat_id', $chat->id)
            ->latest()
            ->take(50)
            ->get()
            ->sortBy('created_at')
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'text' => $message->text,
                    'chat_id' => $message->chat_id,
                    'time' => $message->created_at->format('d M Y, H:i:s'),
                    'user' => [
                        'id' => $message->user->id,
                        'name' => $message->user->name,
                        'username' => $message->user->username,
                        'profile_image' => $message->user->profileImage,
                        'is_verified' => $message->user->is_verified,
                    ],
                    'read_at' => $message->read_at,
                ];
            })
            ->values();

        return Inertia::render('chat/user-chat', [
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'is_verified' => $user->is_verified,
            ],
            'chat_id' => $chat->id,
            'other_user' => [
                'id' => $otherUser->id,
                'name' => $otherUser->name,
                'username' => $otherUser->username,
                'profile_image' => $otherUser->profileImage,
                'is_verified' => $otherUser->is_verified,
            ],
            'init_messages' => $messages,
        ]);
    }

    public function searchOrCreateUserChat(User $otherUser): RedirectResponse
    {
        $user = Auth::user();

        if ($user->id === $otherUser->id) {
            abort(400, "You can't create a chat with yourself");
        }

        Chat::firstOrCreateChat($user->id, $otherUser->id);

        return redirect()->route('chat.getUserChat', ['user' => $otherUser->id]);
    }


    public function postMessageToUserChat(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'chatId' => 'required|exists:chats,id',
            'text' => 'required|string|max:1000',
        ]);

        $user = Auth::user();

        $chat = Chat::findOrFail($validated['chatId']);

        $recipientId = $chat->user1_id === $user->id ? $chat->user2_id : $chat->user1_id;

        $message = Message::create([
            'user_id' => $user->id,
            'chat_id' => $validated['chatId'],
            'text' => $validated['text'],
        ]);

        Chat::where('id', $validated['chatId'])
            ->update(['last_message_id' => $message->id]);

        if ($recipientId !== $user->id) {
            NotificationService::create([
                'user_id' => $recipientId,
                'source_user_id' => $user->id,
                'type' => 'message',
                'extra_data' => $message->text,
                'message_id' => $message->id,
            ]);
        }


        event(new GotPersonalMessage($message, $validated['chatId']));
        event(new UserMessageCreated($message, $recipientId));

        return redirect()->back();
    }

    public function deleteMessage(Message $message): RedirectResponse
    {
        $user = Auth::user();

        if ($message->user_id !== $user->id) {
            abort(403, 'You cannot delete this message.');
        }

        $chat = $message->chat;

        $recipientId = null;
        if (!is_null($chat)){
            $recipientId = $chat->user1_id === $user->id ? $chat->user2_id : $chat->user1_id;
        }

        Notification::where('type', 'message')
            ->where('source_user_id', $message->user_id)
            ->where('message_id', $message->id)
            ->delete();

        $message->delete();

        if ($chat != null && $chat->last_message_id === $message->id) {
            $previousMessage = Message::where('chat_id', $chat->id)
                ->latest('created_at')
                ->first();

            $chat->last_message_id = $previousMessage?->id;
            $chat->save();
        }
        if (!is_null($recipientId)){
            event(new UserMessageIsReadChange($recipientId, "delete"));
        }

        return redirect()->back()->with('success', 'The message has been deleted.');
    }

    public function markAsRead(Request $request, Chat $chat)
    {
        $user = Auth::user();

        $messages = Message::where('chat_id', $chat->id)
            ->where('user_id', '!=', $user->id)
            ->whereNull('read_at')
            ->get();

        if ($messages->isEmpty()) {
            return redirect()->back()->with('error', 'No unread messages to mark as read.');
        }

        $messages->each(function ($message) {
            $message->update(['read_at' => now()]);
        });

        $recipientId = $chat->user1_id === $user->id ? $chat->user2_id : $chat->user1_id;

        if (is_null($recipientId)) {
            return redirect()->back()->with('error', 'Recipient not found.');
        }

        if (!is_null($recipientId)) {
            event(new UserMessageIsReadChange($recipientId, "read"));
        }

        return redirect()->back()->with('success', 'The message has been read.');
    }

    public function getUnreadMessagesCount(Request $request)
    {
        $currentUser = Auth::user();

        $unreadCount = Message::whereHas('chat', function ($query) use ($currentUser) {
            $query->where('user1_id', $currentUser->id)
                ->orWhere('user2_id', $currentUser->id);
        })
            ->where('user_id', '!=', $currentUser->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'unread_count' => $unreadCount,
        ]);
    }

}
