<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\AdminSetting;

class AdminSettingFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = AdminSetting::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'admin_id' => $this->faker->numberBetween(-100000, 100000),
            'bot_delay_enabled' => $this->faker->boolean(),
            'bot_delay' => $this->faker->numberBetween(-10000, 10000),
        ];
    }
}
