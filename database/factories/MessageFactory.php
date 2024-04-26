<?php

namespace Database\Factories;

use App\Models\Group;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Message>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $senderId = $this->faker->randomElement([0, 1]);

        if ($senderId === 0) {
            $senderId = $this->faker->randomElement((new User)->where('id', '!=', 1)->pluck('id')->toArray());
            $receiverId = 1;
        } else {
            $receiverId = $this->faker->randomElement((new User)->pluck('id')->toArray());
        }

        $groupId = null;
        if ($this->faker->boolean()) {
            $groupId = $this->faker->randomElement((new Group)->pluck('id')->toArray());
            $group = (new Group)->find($groupId);
            $senderId = $this->faker->randomElement($group->users->pluck('id')->toArray());
        }

        return [
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'group_id' => $groupId,
            'message' => $this->faker->realText(),
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
