<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('likes', function (Blueprint $table) {
            $table->dropForeign(['post_id']);
            $table->dropForeign(['user_id']);
            $table->dropPrimary(['user_id', 'post_id']);
        });

        Schema::table('likes', function (Blueprint $table) {
            $table->renameColumn('post_id', 'likeable_id');
        });

        Schema::table('likes', function (Blueprint $table) {
            $table->string('likeable_type')->after('likeable_id');
            $table->id()->first();
        });

        Schema::table('likes', function (Blueprint $table) {
            $table->unique(['user_id', 'likeable_id', 'likeable_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('likes', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'likeable_id', 'likeable_type']);
        });

        Schema::table('likes', function (Blueprint $table) {
            $table->dropColumn('likeable_type');
            $table->dropColumn('id');
        });

        Schema::table('likes', function (Blueprint $table) {
            $table->renameColumn('likeable_id', 'post_id');
        });

        Schema::table('likes', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
            $table->primary(['user_id', 'post_id']);
        });
    }
};
