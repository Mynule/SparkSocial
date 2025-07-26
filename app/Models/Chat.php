<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Chat extends Model
{
    use HasFactory;

    protected $fillable = ['user1_id', 'user2_id', 'last_message_id'];

    public static function getChat($userId1, $userId2)
    {
        return self::where(function ($query) use ($userId1, $userId2) {
            $query->where('user1_id', $userId1)->where('user2_id', $userId2);
        })->orWhere(function ($query) use ($userId1, $userId2) {
            $query->where('user1_id', $userId2)->where('user2_id', $userId1);
        })->first();
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function lastMessage() : HasOne
    {
        //return $this->belongsTo(Message::class, 'last_message_id');
        return $this->hasOne(Message::class, 'chat_id')->latestOfMany();
    }

    public static function firstOrCreateChat($userId1, $userId2)
    {
        return self::firstOrCreate(
            [
                'user1_id' => min($userId1, $userId2),
                'user2_id' => max($userId1, $userId2),
            ]
        );
    }

    public function user1()
    {
        return $this->belongsTo(User::class, 'user1_id');
    }

    public function user2()
    {
        return $this->belongsTo(User::class, 'user2_id');
    }
}

