<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserMessageIsReadChange implements ShouldBroadcast
{
    public $userId;
    public $operation;

    public function __construct($recipientId, $operation)
    {
        $this->userId = $recipientId;
        $this->operation = $operation;
    }

    public function broadcastOn()
    {
        if (is_null($this->userId)) {
            throw new \Exception('User ID for broadcasting is null.');
        }
        return new PrivateChannel('user-chats.' . $this->userId);
    }
    public function broadcastWith()
    {
        return [
            'operation' => $this->operation,
        ];
    }
}
