<?php

namespace App\Jobs;

use App\Models\Message;
use App\Events\GotPersonalMessage;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendPersonalMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public Message $message;
    public int $chatId;

    /**
     * Create a new job instance.
     */
    public function __construct(Message $message, int $chatId)
    {
        $this->message = $message;
        $this->chatId = $chatId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        GotPersonalMessage::dispatch($this->message, $this->chatId);
    }
}
