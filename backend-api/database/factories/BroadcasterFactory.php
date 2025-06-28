<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Broadcaster;
use App\Models\Group;

class BroadcasterFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Broadcaster::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'group_id' => Group::factory(),
            'motd_enabled' => $this->faker->boolean(),
            'motd' => $this->faker->text(),
            'motd_time' => $this->faker->dateTime(),
            'pfpslide_enabled' => $this->faker->boolean(),
            'pfp_slide' => '{}',
            'pfp_slide_interval' => $this->faker->numberBetween(-10000, 10000),
        ];
    }
}
