<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Group;

class GroupFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Group::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'group_user_id' => $this->faker->regexify('[A-Za-z0-9]{50}'),
            'group_name' => $this->faker->regexify('[A-Za-z0-9]{255}'),
            'password' => $this->faker->password(),
            'group_pfp' => $this->faker->regexify('[A-Za-z0-9]{255}'),
            'participants' => '{}',
        ];
    }
}
