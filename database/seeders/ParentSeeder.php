<?php

namespace Database\Seeders;

use App\Models\ParentModel;
use Illuminate\Database\Seeder;

class ParentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $parents = [
            [
                'first_name' => 'Jonathan',
                'last_name' => 'Abramson',
                'date_of_birth' => '1980-03-15',
                'address' => '100 Family Circle, Brooklyn, NY 11201',
                'email' => 'jonathan.abramson@email.com',
            ],
            [
                'first_name' => 'Rachel',
                'last_name' => 'Abramson',
                'date_of_birth' => '1982-07-22',
                'address' => '100 Family Circle, Brooklyn, NY 11201',
                'email' => 'rachel.abramson@email.com',
            ],
            [
                'first_name' => 'David',
                'last_name' => 'Silverman',
                'date_of_birth' => '1978-11-05',
                'address' => '200 Parent Lane, Brooklyn, NY 11201',
                'email' => 'david.silverman@email.com',
            ],
            [
                'first_name' => 'Miriam',
                'last_name' => 'Silverman',
                'date_of_birth' => '1979-09-18',
                'address' => '200 Parent Lane, Brooklyn, NY 11201',
                'email' => 'miriam.silverman@email.com',
            ],
            [
                'first_name' => 'Benjamin',
                'last_name' => 'Katz',
                'date_of_birth' => '1985-01-30',
                'address' => '300 Guardian Street, Brooklyn, NY 11201',
                'email' => 'benjamin.katz@email.com',
            ],
            [
                'first_name' => 'Esther',
                'last_name' => 'Katz',
                'date_of_birth' => '1986-04-12',
                'address' => '300 Guardian Street, Brooklyn, NY 11201',
                'email' => 'esther.katz@email.com',
            ],
        ];

        foreach ($parents as $parent) {
            ParentModel::create($parent);
        }
    }
}
