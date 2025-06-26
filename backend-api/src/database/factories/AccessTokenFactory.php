<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\AccessToken;

class AccessTokenFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = AccessToken::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'access_token' => $this->faker->regexify('[A-Za-z0-9]{128}'),
            'expire_date' => $this->faker->dateTime(),
        ];
    }
}
