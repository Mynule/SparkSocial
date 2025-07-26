<?php

namespace Database\Factories;

use App\Models\Follow;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Follow>
 */
class FollowFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Follow::class;
    public function definition(): array
    {
        return [
            'follower_id' => User::factory(),
            'followee_id' => User::factory(),
            'is_accepted' => $this->faker->boolean(90),
        ];

    }
}
