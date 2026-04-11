<?php

namespace Database\Factories;

use App\Models\GabbaiAssignment;
use App\Models\Member;
use Illuminate\Database\Eloquent\Factories\Factory;

class GabbaiAssignmentFactory extends Factory
{
    protected $model = GabbaiAssignment::class;

    public function definition(): array
    {
        return [
            'member_id' => Member::factory(),
            'date' => $this->faker->dateTimeBetween('now', '+3 months'),
            'honor' => $this->faker->randomElement([
                'Aliyah 1',
                'Aliyah 2',
                'Aliyah 3',
                'Maftir',
                'Haftarah',
                'Opening Ark',
                'Closing Ark',
            ]),
        ];
    }
}
