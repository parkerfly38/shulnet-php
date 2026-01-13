<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Member;
use App\Models\ParentModel;
use App\Models\Student;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Yahrzeit;
use App\Models\GabbaiAssignment;
use App\Models\Event;
use App\Models\Calendar;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;

class MemberPortalTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Delete existing test data if it exists
        $existingUser = User::where('email', 'david.cohen@test.com')->first();
        if ($existingUser) {
            // Delete associated data first
            if ($existingUser->member) {
                $member = $existingUser->member;
                
                // Delete yahrzeits associations
                $member->yahrzeits()->detach();
                
                // Delete assignments
                GabbaiAssignment::where('member_id', $member->id)->delete();
                
                // Delete invoices
                Invoice::where('member_id', $member->id)->delete();
                
                // Delete students if parent exists
                if ($member->parent_id) {
                    Student::where('parent_id', $member->parent_id)->delete();
                    ParentModel::where('id', $member->parent_id)->delete();
                }
                
                $member->delete();
            }
            
            $existingUser->delete();
        }
        
        // Create a test user
        $user = User::create([
            'name' => 'David Cohen',
            'email' => 'david.cohen@test.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Create a parent record first
        $parent = ParentModel::create([
            'first_name' => 'David',
            'last_name' => 'Cohen',
            'email' => 'david.cohen@test.com',
            'phone' => '555-0123',
            'address' => '123 Main St',
        ]);

        // Create a member linked to the user and parent
        $member = Member::create([
            'first_name' => 'David',
            'last_name' => 'Cohen',
            'email' => 'david.cohen@test.com',
            'phone1' => '555-0123',
            'address_line_1' => '123 Main St',
            'city' => 'New York',
            'state' => 'NY',
            'zip' => '10001',
            'member_type' => 'member',
            'user_id' => $user->id,
            'parent_id' => $parent->id,
            'hebrew_name' => 'David ben Avraham',
            'father_hebrew_name' => 'Avraham',
            'mother_hebrew_name' => 'Sarah',
        ]);

        // Create students (children)
        $student1 = Student::create([
            'first_name' => 'Rachel',
            'last_name' => 'Cohen',
            'parent_id' => $parent->id,
            'gender' => 'female',
            'date_of_birth' => '2015-03-15',
            'email' => 'rachel.cohen@test.com',
            'is_parent_email' => true,
        ]);

        $student2 = Student::create([
            'first_name' => 'Jacob',
            'last_name' => 'Cohen',
            'parent_id' => $parent->id,
            'gender' => 'male',
            'date_of_birth' => '2017-08-22',
            'email' => 'jacob.cohen@test.com',
            'is_parent_email' => true,
        ]);

        // Create invoices
        $invoice1 = Invoice::create([
            'member_id' => $member->id,
            'invoice_number' => 'INV-2026-001',
            'notes' => 'Annual Membership Dues 2026',
            'invoice_date' => Carbon::now()->subDays(35),
            'due_date' => Carbon::now()->subDays(30),
            'total' => 500.00,
            'subtotal' => 500.00,
            'amount_paid' => 500.00,
            'status' => 'paid',
        ]);

        // Add invoice items for invoice 1
        InvoiceItem::create([
            'invoice_id' => $invoice1->id,
            'description' => 'Annual Membership Dues',
            'quantity' => 1,
            'unit_price' => 500.00,
            'total' => 500.00,
            'sort_order' => 1,
        ]);

        $invoice2 = Invoice::create([
            'member_id' => $member->id,
            'invoice_number' => 'INV-2026-002',
            'notes' => 'Hebrew School Tuition - Spring Semester',
            'invoice_date' => Carbon::now()->subDays(10),
            'due_date' => Carbon::now()->addDays(15),
            'total' => 1200.00,
            'subtotal' => 1200.00,
            'amount_paid' => 0.00,
            'status' => 'open',
        ]);

        // Add invoice items for invoice 2
        InvoiceItem::create([
            'invoice_id' => $invoice2->id,
            'description' => 'Hebrew School Tuition - Rachel Cohen',
            'quantity' => 1,
            'unit_price' => 600.00,
            'total' => 600.00,
            'sort_order' => 1,
        ]);

        InvoiceItem::create([
            'invoice_id' => $invoice2->id,
            'description' => 'Hebrew School Tuition - Jacob Cohen',
            'quantity' => 1,
            'unit_price' => 600.00,
            'total' => 600.00,
            'sort_order' => 2,
        ]);

        $invoice3 = Invoice::create([
            'member_id' => $member->id,
            'invoice_number' => 'INV-2026-003',
            'notes' => 'High Holiday Seats',
            'invoice_date' => Carbon::now()->subDays(5),
            'due_date' => Carbon::now()->addDays(45),
            'total' => 180.00,
            'subtotal' => 180.00,
            'amount_paid' => 0.00,
            'status' => 'open',
        ]);

        // Add invoice items for invoice 3
        InvoiceItem::create([
            'invoice_id' => $invoice3->id,
            'description' => 'High Holiday Reserved Seat - Main Sanctuary',
            'quantity' => 2,
            'unit_price' => 90.00,
            'total' => 180.00,
            'sort_order' => 1,
        ]);

        // Create yahrzeits
        $yahrzeit1 = Yahrzeit::create([
            'name' => 'Avraham Cohen',
            'hebrew_name' => 'Avraham ben Yitzchak',
            'date_of_death' => Carbon::now()->subYears(5)->addDays(20)->toDateString(),
            'hebrew_day_of_death' => 15,
            'hebrew_month_of_death' => 5,
            'hebrew_year_of_death' => 5781,
        ]);

        $yahrzeit2 = Yahrzeit::create([
            'name' => 'Sarah Goldstein',
            'hebrew_name' => 'Sarah bat Moshe',
            'date_of_death' => Carbon::now()->subYears(10)->addDays(45)->toDateString(),
            'hebrew_day_of_death' => 22,
            'hebrew_month_of_death' => 3,
            'hebrew_year_of_death' => 5776,
        ]);

        // Associate yahrzeits with member
        $member->yahrzeits()->attach($yahrzeit1->id, ['relationship' => 'Father']);
        $member->yahrzeits()->attach($yahrzeit2->id, ['relationship' => 'Grandmother']);

        // Create aliyah assignments
        GabbaiAssignment::create([
            'member_id' => $member->id,
            'date' => Carbon::now()->next('Saturday')->toDateString(),
            'honor' => '3',
        ]);

        GabbaiAssignment::create([
            'member_id' => $member->id,
            'date' => Carbon::now()->addWeeks(2)->next('Saturday')->toDateString(),
            'honor' => 'M',
        ]);

        GabbaiAssignment::create([
            'member_id' => $member->id,
            'date' => Carbon::now()->addWeeks(4)->next('Saturday')->toDateString(),
            'honor' => '5',
        ]);

        // Create a calendar if it doesn't exist
        $calendar = Calendar::firstOrCreate(
            ['name' => 'Community Events'],
            [
                'public' => true,
                'members_only' => false,
            ]
        );

        // Create upcoming registerable events
        Event::create([
            'name' => 'Annual Community Dinner',
            'tagline' => 'Join us for our annual community celebration',
            'calendar_id' => $calendar->id,
            'event_start' => Carbon::now()->addWeeks(3)->setTime(18, 0),
            'event_end' => Carbon::now()->addWeeks(3)->setTime(21, 0),
            'location' => 'Main Hall',
            'description' => 'An evening of community, food, and celebration. Bring your family and friends!',
            'registration_required' => true,
            'registration_starts' => Carbon::now()->subDays(7),
            'registration_ends' => Carbon::now()->addWeeks(2),
            'public' => true,
            'members_only' => false,
            'allow_guests' => true,
            'max_guests' => 4,
            'maxrsvp' => 100,
            'all_day' => false,
            'online' => false,
        ]);

        Event::create([
            'name' => 'Torah Study Session',
            'tagline' => 'Weekly Torah discussion and learning',
            'calendar_id' => $calendar->id,
            'event_start' => Carbon::now()->addDays(5)->setTime(19, 30),
            'event_end' => Carbon::now()->addDays(5)->setTime(21, 0),
            'location' => 'Study Room',
            'description' => 'Join Rabbi for weekly Torah study and discussion.',
            'registration_required' => true,
            'registration_starts' => Carbon::now(),
            'registration_ends' => Carbon::now()->addDays(4),
            'public' => true,
            'members_only' => true,
            'allow_guests' => false,
            'maxrsvp' => 25,
            'all_day' => false,
            'online' => false,
        ]);

        Event::create([
            'name' => 'Youth Program - Family Fun Day',
            'tagline' => 'Activities and games for the whole family',
            'calendar_id' => $calendar->id,
            'event_start' => Carbon::now()->addWeeks(2)->setTime(14, 0),
            'event_end' => Carbon::now()->addWeeks(2)->setTime(17, 0),
            'location' => 'Community Center',
            'description' => 'Outdoor activities, games, crafts, and fun for all ages!',
            'registration_required' => true,
            'registration_starts' => Carbon::now(),
            'registration_ends' => Carbon::now()->addWeeks(1)->addDays(5),
            'public' => true,
            'members_only' => false,
            'allow_guests' => true,
            'max_guests' => 10,
            'maxrsvp' => 50,
            'all_day' => false,
            'online' => false,
        ]);

        $this->command->info('Member portal test data created:');
        $this->command->info('Email: david.cohen@test.com');
        $this->command->info('Password: password');
        $this->command->info('Created 3 upcoming registerable events');
    }
}
