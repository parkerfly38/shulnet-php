<?php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\MemberRelationship;
use App\Models\Yahrzeit;
use App\Services\HebrewCalendarService;
use DateInterval;
use DatePeriod;
use DateTimeImmutable;
use Illuminate\Database\Seeder;

class YahrzeitSeeder extends Seeder
{
    private const MONTHS = [
        'Tishrei',
        'Cheshvan',
        'Kislev',
        'Tevet',
        'Shevat',
        'Adar',
        'Adar II',
        'Nisan',
        'Iyar',
        'Sivan',
        'Tammuz',
        'Av',
        'Elul',
    ];

    private const YAHRZEIT_NAMES = [
        'Tishrei' => [
            ['name' => 'Miriam Rosen', 'hebrew_name' => 'Miriam bat Avraham'],
            ['name' => 'Eli Feldman', 'hebrew_name' => 'Eliyahu ben Moshe'],
            ['name' => 'Ruth Kaplan', 'hebrew_name' => 'Rivkah bat David'],
        ],
        'Cheshvan' => [
            ['name' => 'Samuel Weiss', 'hebrew_name' => 'Shmuel ben Yitzchak'],
            ['name' => 'Esther Adler', 'hebrew_name' => 'Esther bat Yaakov'],
            ['name' => 'Morris Klein', 'hebrew_name' => 'Moshe ben Aharon'],
        ],
        'Kislev' => [
            ['name' => 'Rebecca Stein', 'hebrew_name' => 'Rivkah bat Shlomo'],
            ['name' => 'Daniel Rubin', 'hebrew_name' => 'Daniel ben Yosef'],
            ['name' => 'Hannah Weiss', 'hebrew_name' => 'Chana bat Eliyahu'],
        ],
        'Tevet' => [
            ['name' => 'Abraham Cohen', 'hebrew_name' => 'אברהם כהן'],
            ['name' => 'Miriam Stein', 'hebrew_name' => 'Miriam bat Shlomo'],
            ['name' => 'Ezra Perlman', 'hebrew_name' => 'Ezra ben David'],
        ],
        'Shevat' => [
            ['name' => 'Joseph Levy', 'hebrew_name' => 'Yosef ben Avraham'],
            ['name' => 'Leah Gold', 'hebrew_name' => 'Leah bat Moshe'],
            ['name' => 'Benjamin Morris', 'hebrew_name' => 'Binyamin ben Yaakov'],
        ],
        'Adar' => [
            ['name' => 'Nathan Silver', 'hebrew_name' => 'Natan ben Yitzchak'],
            ['name' => 'Dinah Green', 'hebrew_name' => 'Dinah bat Shmuel'],
            ['name' => 'Meyer Bernstein', 'hebrew_name' => 'Meir ben Aharon'],
        ],
        'Adar II' => [
            ['name' => 'Sarah Levy', 'hebrew_name' => 'שרה לוי'],
            ['name' => 'Aaron Goldstein', 'hebrew_name' => 'Aharon ben Yaakov'],
            ['name' => 'Chaya Rosen', 'hebrew_name' => 'Chaya bat Avraham'],
        ],
        'Nisan' => [
            ['name' => 'Isaac Adler', 'hebrew_name' => 'Yitzchak ben Shlomo'],
            ['name' => 'Naomi Weiss', 'hebrew_name' => 'Naomi bat Eliyahu'],
            ['name' => 'Solomon Katz', 'hebrew_name' => 'Shlomo ben Yosef'],
        ],
        'Iyar' => [
            ['name' => 'David Friedman', 'hebrew_name' => 'David ben Moshe'],
            ['name' => 'Rachel Klein', 'hebrew_name' => 'Rachel bat Aharon'],
            ['name' => 'Mordechai Stein', 'hebrew_name' => 'Mordechai ben David'],
        ],
        'Sivan' => [
            ['name' => 'Isaac Goldman', 'hebrew_name' => 'יצחק גולדמן'],
            ['name' => 'Deborah Rubin', 'hebrew_name' => 'Devorah bat Yitzchak'],
            ['name' => 'Hirsch Kaplan', 'hebrew_name' => 'Tzvi ben Shmuel'],
        ],
        'Tammuz' => [
            ['name' => 'Moses Silverman', 'hebrew_name' => 'Moshe ben Avraham'],
            ['name' => 'Sarah Feld', 'hebrew_name' => 'Sarah bat Yaakov'],
            ['name' => 'Reuben Adler', 'hebrew_name' => 'Reuven ben Yosef'],
        ],
        'Av' => [
            ['name' => 'Esther Cohen', 'hebrew_name' => 'Esther bat David'],
            ['name' => 'Jacob Morris', 'hebrew_name' => 'Yaakov ben Shlomo'],
            ['name' => 'Judith Green', 'hebrew_name' => 'Yehudit bat Moshe'],
        ],
        'Elul' => [
            ['name' => 'Solomon Weiss', 'hebrew_name' => 'Shlomo ben Yitzchak'],
            ['name' => 'Anna Bernstein', 'hebrew_name' => 'Chana bat Aharon'],
            ['name' => 'Benjamin Rubin', 'hebrew_name' => 'Binyamin ben David'],
        ],
    ];

    public function run(): void
    {
        $calendar = new HebrewCalendarService;
        $members = $this->seedFamilyMembers();
        $datesByMonth = $this->gregorianDatesByHebrewMonth($calendar);

        foreach (self::MONTHS as $monthIndex => $month) {
            $dates = $datesByMonth[$month] ?? [];

            if (count($dates) < 3) {
                throw new \RuntimeException("Could not find three sample dates for Hebrew month [{$month}].");
            }

            foreach (self::YAHRZEIT_NAMES[$month] as $recordIndex => $person) {
                $date = $dates[$recordIndex];
                $hebrewDate = $calendar->gregorianToHebrew($date);
                $yahrzeit = Yahrzeit::updateOrCreate(
                    ['name' => $person['name']],
                    [
                        'hebrew_name' => $person['hebrew_name'],
                        'date_of_death' => $date,
                        'hebrew_day_of_death' => $hebrewDate['day'],
                        'hebrew_month_of_death' => $hebrewDate['month'],
                        'hebrew_year_of_death' => $hebrewDate['year'],
                        'observance_type' => 'standard',
                        'notes' => 'Demo yahrzeit record; linked to the sample family.',
                    ]
                );

                $family = $members[($monthIndex + $recordIndex) % 2];
                $yahrzeit->members()->sync([
                    $family[0]->id => ['relationship' => $recordIndex === 0 ? 'Father' : 'Grandfather'],
                    $family[1]->id => ['relationship' => $recordIndex === 1 ? 'Mother' : 'Grandmother'],
                    $family[2]->id => ['relationship' => 'Grandparent'],
                ]);
            }
        }
    }

    /**
     * @return array<int, array<int, Member>>
     */
    private function seedFamilyMembers(): array
    {
        $families = [
            [
                [
                    'first_name' => 'David',
                    'last_name' => 'Levin',
                    'email' => 'david.levin.yahrzeit-demo@example.test',
                    'hebrew_name' => 'David ben Avraham',
                ],
                [
                    'first_name' => 'Miriam',
                    'last_name' => 'Levin',
                    'email' => 'miriam.levin.yahrzeit-demo@example.test',
                    'hebrew_name' => 'Miriam bat Shlomo',
                ],
                [
                    'first_name' => 'Rachel',
                    'last_name' => 'Levin',
                    'email' => 'rachel.levin.yahrzeit-demo@example.test',
                    'hebrew_name' => 'Rachel bat David',
                ],
            ],
            [
                [
                    'first_name' => 'Aaron',
                    'last_name' => 'Rosen',
                    'email' => 'aaron.rosen.yahrzeit-demo@example.test',
                    'hebrew_name' => 'Aharon ben Moshe',
                ],
                [
                    'first_name' => 'Leah',
                    'last_name' => 'Rosen',
                    'email' => 'leah.rosen.yahrzeit-demo@example.test',
                    'hebrew_name' => 'Leah bat Yosef',
                ],
                [
                    'first_name' => 'Jacob',
                    'last_name' => 'Rosen',
                    'email' => 'jacob.rosen.yahrzeit-demo@example.test',
                    'hebrew_name' => 'Yaakov ben Aharon',
                ],
            ],
        ];

        return collect($families)->map(function (array $family): array {
            $members = collect($family)->map(fn (array $attributes) => Member::updateOrCreate(
                ['email' => $attributes['email']],
                [
                    ...$attributes,
                    'member_type' => 'member',
                    'city' => 'Bangor',
                    'state' => 'ME',
                    'country' => 'USA',
                ]
            ))->all();

            MemberRelationship::updateOrCreate(
                [
                    'member_id' => $members[0]->id,
                    'related_member_id' => $members[1]->id,
                    'relationship_type' => 'spouse',
                ]
            );
            MemberRelationship::updateOrCreate(
                [
                    'member_id' => $members[0]->id,
                    'related_member_id' => $members[2]->id,
                    'relationship_type' => 'child',
                ]
            );

            return $members;
        })->all();
    }

    /**
     * @return array<string, array<int, string>>
     */
    private function gregorianDatesByHebrewMonth(HebrewCalendarService $calendar): array
    {
        $datesByMonth = array_fill_keys(self::MONTHS, []);
        $period = new DatePeriod(
            new DateTimeImmutable('2010-01-01'),
            new DateInterval('P1D'),
            new DateTimeImmutable('2031-01-01')
        );

        foreach ($period as $date) {
            $gregorianDate = $date->format('Y-m-d');
            $hebrewDate = $calendar->gregorianToHebrew($gregorianDate);
            $month = $hebrewDate['month'];

            if (array_key_exists($month, $datesByMonth) && count($datesByMonth[$month]) < 3) {
                $datesByMonth[$month][] = $gregorianDate;
            }
        }

        return $datesByMonth;
    }
}
