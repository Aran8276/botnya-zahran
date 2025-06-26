<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Group;
use App\Models\GroupSetting;

class GroupSettingFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = GroupSetting::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'group_id' => Group::factory(),
            'lock_mention_everyone' => $this->faker->boolean(),
            'schedule_piket' => $this->faker->boolean(),
        ];
    }
}
