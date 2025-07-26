<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            // Drop existing foreign keys first
            $table->dropForeign(['user1_id']);
            $table->dropForeign(['user2_id']);

            // Then re-add them with onDelete('cascade')
            $table->foreign('user1_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('user2_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            // Drop the cascade foreign keys
            $table->dropForeign(['user1_id']);
            $table->dropForeign(['user2_id']);

            // Re-add the original foreign keys without cascade
            $table->foreign('user1_id')->references('id')->on('users');
            $table->foreign('user2_id')->references('id')->on('users');
        });
    }
};
