<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\AccessToken;
use App\Models\AccessTokenAdmin;

class AccessTokenAdminFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = AccessTokenAdmin::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'access_token_id' => AccessToken::factory(),
        ];
    }
}
