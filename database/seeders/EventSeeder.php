<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventTicketType;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Simple weekly event without registration
        Event::factory()->create([
            'name' => 'Shabbat',
            'tagline' => 'Weekly Shabbat Service',
            'event_start' => '2024-01-05 18:00:00',
            'event_end' => '2024-01-05 20:00:00',
            'location' => '144 York Street, Bangor, ME 04401',
            'registration_required' => false,
            'members_only' => false,
            'description' => 'Join us for our weekly Shabbat service.',
            'online' => false,
            'public' => true,
            'calendar_id' => 1,
        ]);

        // Event with registration and tickets - Annual Gala
        $gala = Event::factory()->create([
            'name' => 'Annual Gala Dinner',
            'tagline' => 'Celebrating Community and Tradition',
            'event_start' => now()->addMonths(2)->setTime(18, 0, 0),
            'event_end' => now()->addMonths(2)->setTime(22, 0, 0),
            'location' => 'Grand Ballroom, Bangor Convention Center',
            'registration_required' => true,
            'registration_starts' => now()->subWeek(),
            'registration_ends' => now()->addMonths(2)->subDay(),
            'earlybird' => true,
            'earlybird_starts' => now()->subWeek(),
            'earlybird_ends' => now()->addWeek(),
            'registration_closed' => null, // Still open for registration
            'maxrsvp' => 200,
            'members_only' => false,
            'allow_guests' => true,
            'max_guests' => 4,
            'description' => 'Join us for an elegant evening celebrating our community. Enjoy a gourmet dinner, live music, and special presentations honoring our members and supporters.',
            'rsvp_message' => 'Thank you for registering! We look forward to seeing you at the gala. You will receive a confirmation email with event details.',
            'online' => false,
            'all_day' => false,
            'public' => true,
            'calendar_id' => 1,
        ]);

        // Create ticket types for the gala
        EventTicketType::create([
            'event_id' => $gala->id,
            'name' => 'Member',
            'description' => 'Individual member ticket with dinner and open bar',
            'category' => 'member',
            'price' => 75.00,
            'quantity_available' => 150,
            'quantity_sold' => 0,
            'sale_starts' => now()->subWeek(),
            'sale_ends' => now()->addMonths(2)->subDay(),
            'active' => true,
            'sort_order' => 1,
        ]);

        EventTicketType::create([
            'event_id' => $gala->id,
            'name' => 'Non-Member',
            'description' => 'Individual ticket with dinner and open bar',
            'category' => 'nonmember',
            'price' => 95.00,
            'quantity_available' => 40,
            'quantity_sold' => 0,
            'sale_starts' => now()->subWeek(),
            'sale_ends' => now()->addMonths(2)->subDay(),
            'active' => true,
            'sort_order' => 2,
        ]);

        EventTicketType::create([
            'event_id' => $gala->id,
            'name' => 'VIP Seat',
            'description' => 'Individual VIP seat with premium seating and champagne service',
            'category' => 'vip',
            'price' => 125.00,
            'quantity_available' => 50,
            'quantity_sold' => 0,
            'sale_starts' => now()->subWeek(),
            'sale_ends' => now()->addMonths(2)->subDay(),
            'active' => true,
            'sort_order' => 3,
        ]);

        EventTicketType::create([
            'event_id' => $gala->id,
            'name' => 'Student/Young Professional',
            'description' => 'Discounted ticket for students and young professionals (under 30)',
            'category' => 'adult',
            'price' => 45.00,
            'quantity_available' => 20,
            'quantity_sold' => 0,
            'sale_starts' => now()->subWeek(),
            'sale_ends' => now()->addMonths(2)->subDay(),
            'active' => true,
            'sort_order' => 4,
        ]);

        // Create a past event with registration
        $passover = Event::factory()->create([
            'name' => 'Community Passover Seder',
            'tagline' => 'First Night Seder',
            'event_start' => now()->subMonths(1)->setTime(18, 30, 0),
            'event_end' => now()->subMonths(1)->setTime(22, 0, 0),
            'location' => '144 York Street, Bangor, ME 04401',
            'registration_required' => true,
            'registration_starts' => now()->subMonths(2),
            'registration_ends' => now()->subMonths(1)->subDays(3),
            'registration_closed' => now()->subMonths(1)->subDays(3), // Closed at registration end date
            'maxrsvp' => 80,
            'members_only' => false,
            'allow_guests' => true,
            'max_guests' => 6,
            'description' => 'Join us for a traditional Passover Seder celebrating freedom and community.',
            'rsvp_message' => 'Thank you for registering! Please arrive by 6:15 PM.',
            'online' => false,
            'all_day' => false,
            'public' => true,
            'calendar_id' => 1,
        ]);

        // Create ticket types for Passover
        EventTicketType::create([
            'event_id' => $passover->id,
            'name' => 'Adult',
            'description' => 'Adult ticket (13+)',
            'category' => 'adult',
            'price' => 36.00,
            'quantity_available' => 60,
            'quantity_sold' => 0,
            'sale_starts' => now()->subMonths(2),
            'sale_ends' => now()->subMonths(1)->subDays(3),
            'active' => false,
            'sort_order' => 1,
        ]);

        EventTicketType::create([
            'event_id' => $passover->id,
            'name' => 'Child (5-12)',
            'description' => 'Child ticket with kid-friendly meal',
            'category' => 'child',
            'price' => 18.00,
            'quantity_available' => 20,
            'quantity_sold' => 0,
            'sale_starts' => now()->subMonths(2),
            'sale_ends' => now()->subMonths(1)->subDays(3),
            'active' => false,
            'sort_order' => 2,
        ]);

        EventTicketType::create([
            'event_id' => $passover->id,
            'name' => 'Young Child (Under 5)',
            'description' => 'Free admission for children under 5',
            'category' => 'child',
            'price' => 0.00,
            'quantity_available' => null,
            'quantity_sold' => 0,
            'sale_starts' => now()->subMonths(2),
            'sale_ends' => now()->subMonths(1)->subDays(3),
            'active' => false,
            'sort_order' => 3,
        ]);
    }
}
