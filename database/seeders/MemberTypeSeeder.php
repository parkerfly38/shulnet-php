<?php

namespace Database\Seeders;

use App\Models\Member;
use Illuminate\Database\Seeder;

/**
 * Seeds non-member records (contacts, prospects, former members) so every member_type
 * filter has realistic data to show.
 */
class MemberTypeSeeder extends Seeder
{
    public function run(): void
    {
        $people = [
            'contact' => [
                ['Rachel', 'Greenberg'],
                ['Samuel', 'Okafor'],
                ['Linda', 'Moskowitz'],
                ['Tom', 'Reyes'],
                ['Hannah', 'Weiss'],
                ['Peter', 'Lindqvist'],
                ['Miriam', 'Katz'],
                ['Daniel', 'Park'],
            ],
            'prospect' => [
                ['Jessica', 'Feldman'],
                ['Aaron', 'Schwartz'],
                ['Olivia', 'Brenner'],
                ['Marcus', 'Goldfarb'],
                ['Naomi', 'Stern'],
                ['Eli', 'Rosenthal'],
            ],
            'former' => [
                ['Harold', 'Berman'],
                ['Sylvia', 'Adler'],
                ['Gary', 'Isaacs'],
                ['Debra', 'Lowenthal'],
                ['Joel', 'Pearlman'],
            ],
        ];

        foreach ($people as $type => $entries) {
            foreach ($entries as [$first, $last]) {
                $email = strtolower("{$first}.{$last}").'@example.com';

                Member::firstOrCreate(
                    ['email' => $email],
                    Member::factory()->make([
                        'member_type' => $type,
                        'first_name' => $first,
                        'last_name' => $last,
                        'email' => $email,
                    ])->getAttributes()
                );
            }
        }
    }
}
