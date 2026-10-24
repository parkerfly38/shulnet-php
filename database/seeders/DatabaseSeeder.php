<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'brian.kresge@gmail.com'],
            [
                'name' => 'Brian Kresge',
                'password' => 'password',
                'email_verified_at' => now(),
                'roles' => ['admin'],
            ]
        );

        $this->call([
            NoteSeeder::class,
            CalendarSeeder::class,
            MemberSeeder::class,
            MembershipTierSeeder::class,
            YahrzeitSeeder::class,
            EventSeeder::class,
            EventRSVPSeeder::class,
            PdfTemplateSeeder::class,
            CemeterySeeder::class,
            SettingSeeder::class,
            ChartOfAccountsSeeder::class,
            InvoiceSeeder::class,
            EmailTemplateSeeder::class,

            // Leadership Management Seeders
            BoardSeeder::class,
            CommitteeSeeder::class,

            // School Management Seeders
            SchoolTuitionTierSeeder::class,
            SubjectSeeder::class,
            TeacherSeeder::class,
            ParentSeeder::class,
            StudentSeeder::class,
            ClassDefinitionSeeder::class,
            ExamSeeder::class,

            // Content Management Seeders
            HtmlContentSeeder::class,

            // Member Portal Test Data
            MemberPortalTestSeeder::class,
            DemoExperienceSeeder::class,
            MembershipBillingSeeder::class,

            MemberTypeSeeder::class,

            // High Holy Day seating: runs after member types so non-members get non-member prices
            SeatingSeeder::class,

            // Must run last: spreads member join dates over the past 12 months
            MemberTimelineSeeder::class,
        ]);
    }
}
