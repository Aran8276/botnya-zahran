<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Otp;

class OtpFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Otp::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'otp_code' => $this->faker->regexify('[A-Za-z0-9]{6}'),
            'expire_date' => $this->faker->dateTime(),
        ];
    }
}
