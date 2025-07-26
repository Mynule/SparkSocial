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
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 50)->unique()->nullable()->after('id');
            $table->text('bio')->nullable()->after('name');
//            $table->string('profile_image_url', 255)->nullable()->after('bio');
//            $table->string('cover_image_url', 255)->nullable()->after('profile_image_url');
            $table->string('location', 100)->nullable()->after('bio');
            $table->string('website', 255)->nullable()->after('location');
            $table->date('date_of_birth')->nullable()->after('website');
            $table->boolean('is_verified')->default(false)->after('date_of_birth');
            $table->boolean('is_private')->default(false)->after('is_verified');
            $table->enum('status', ['active', 'suspended', 'deactivated'])->default('active')->after('is_private');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username',
                'bio',
                'profile_image_url',
                'cover_image_url',
                'location',
                'website',
                'date_of_birth',
                'is_verified',
                'is_private',
                'status',
            ]);
        });
    }
};

