<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserMessageCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $userId;

    public function __construct($message, $userId)
    {
        $this->message = $message;
        $this->userId = $userId;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user-chats.' . $this->userId);
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->message->id,
            'text' => $this->message->text,
            'user' => [
                'id' => $this->message->user->id,
                'name' => $this->message->user->name,
                'username' => $this->message->user->username,
                'profile_image_url' => $this->message->user->profile_image_url,
            ],
            'time' => $this->message->time,
        ];
    }
}
