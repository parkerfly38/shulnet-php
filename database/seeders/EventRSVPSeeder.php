<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventRSVP;
use App\Models\EventTicketType;
use App\Models\Member;
use Illuminate\Database\Seeder;

class EventRSVPSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find the Annual Gala event
        $gala = Event::where('name', 'Annual Gala Dinner')->first();
        if (!$gala) {
            return;
        }

        // Get ticket types
        $member = EventTicketType::where('event_id', $gala->id)
            ->where('name', 'Member')
            ->first();
        $nonMember = EventTicketType::where('event_id', $gala->id)
            ->where('name', 'Non-Member')
            ->first();
        $vip = EventTicketType::where('event_id', $gala->id)
            ->where('name', 'VIP Seat')
            ->first();
        $student = EventTicketType::where('event_id', $gala->id)
            ->where('name', 'Student/Young Professional')
            ->first();

        // Get some members to link RSVPs
        $members = Member::limit(10)->get();

        // Create RSVPs for the Gala
        if ($member && $members->count() > 0) {
            EventRSVP::create([
                'event_id' => $gala->id,
                'member_id' => $members[0]->id ?? null,
                'event_ticket_type_id' => $member->id,
                'name' => $members[0]->first_name . ' ' . $members[0]->last_name ?? 'Sarah Cohen',
                'email' => $members[0]->email ?? 'sarah.cohen@example.com',
                'phone' => $members[0]->phone_home ?? '(207) 555-0101',
                'guests' => 0,
                'quantity' => 1,
                'ticket_price' => $member->price,
                'total_amount' => $member->price,
                'status' => 'confirmed',
                'notes' => null,
            ]);
        }

        if ($member && $members->count() > 1) {
            // First person in couple
            EventRSVP::create([
                'event_id' => $gala->id,
                'member_id' => $members[1]->id ?? null,
                'event_ticket_type_id' => $member->id,
                'name' => isset($members[1]) ? $members[1]->first_name . ' ' . $members[1]->last_name : 'David Levy',
                'email' => $members[1]->email ?? 'david.levy@example.com',
                'phone' => $members[1]->phone_home ?? '(207) 555-0102',
                'guests' => 0,
                'quantity' => 1,
                'ticket_price' => $member->price,
                'total_amount' => $member->price,
                'status' => 'confirmed',
                'notes' => 'Vegetarian meal, please.',
            ]);
            
            // Second person in couple
            EventRSVP::create([
                'event_id' => $gala->id,
                'member_id' => $members[1]->id ?? null,
                'event_ticket_type_id' => $member->id,
                'name' => isset($members[1]->spouse_first_name) ? $members[1]->spouse_first_name . ' ' . $members[1]->last_name : 'Rachel Levy',
                'email' => $members[1]->email ?? 'rachel.levy@example.com',
                'phone' => $members[1]->phone_home ?? '(207) 555-0102',
                'guests' => 0,
                'quantity' => 1,
                'ticket_price' => $member->price,
                'total_amount' => $member->price,
                'status' => 'confirmed',
                'notes' => 'Vegetarian meal, please.',
            ]);
        }

        if ($member && $members->count() > 2) {
            EventRSVP::create([
                'event_id' => $gala->id,
                'member_id' => $members[2]->id ?? null,
                'event_ticket_type_id' => $member->id,
                'name' => isset($members[2]) ? $members[2]->first_name . ' ' . $members[2]->last_name : 'Rebecca Goldstein',
                'email' => $members[2]->email ?? 'rebecca.goldstein@example.com',
                'phone' => $members[2]->phone_home ?? '(207) 555-0103',
                'guests' => 2,
                'quantity' => 1,
                'ticket_price' => $member->price,
                'total_amount' => $member->price,
                'status' => 'confirmed',
                'notes' => 'Bringing two guests - will purchase additional tickets.',
            ]);
        }

        // Non-member RSVP
        if ($nonMember) {
            EventRSVP::create([
                'event_id' => $gala->id,
                'member_id' => null,
                'event_ticket_type_id' => $nonMember->id,
                'name' => 'Michael Anderson',
                'email' => 'michael.anderson@example.com',
                'phone' => '(207) 555-0201',
                'guests' => 0,
                'quantity' => 1,
                'ticket_price' => $nonMember->price,
                'total_amount' => $nonMember->price,
                'status' => 'confirmed',
                'notes' => null,
            ]);

            EventRSVP::create([
                'event_id' => $gala->id,
                'member_id' => null,
                'event_ticket_type_id' => $nonMember->id,
                'name' => 'Jennifer Martinez',
                'email' => 'jennifer.martinez@example.com',
                'phone' => '(207) 555-0202',
                'guests' => 1,
                'quantity' => 1,
                'ticket_price' => $nonMember->price,
                'total_amount' => $nonMember->price,
                'status' => 'pending',
                'notes' => 'Payment not yet received - following up.',
            ]);
        }

        // VIP Seat RSVPs
        if ($vip && $members->count() > 3) {
            // Create 3 VIP seat reservations
            for ($i = 0; $i < 3; $i++) {
                EventRSVP::create([
                    'event_id' => $gala->id,
                    'member_id' => $members[3]->id ?? null,
                    'event_ticket_type_id' => $vip->id,
                    'name' => isset($members[3]) ? $members[3]->first_name . ' ' . $members[3]->last_name : 'Dr. Joshua Silverman',
                    'email' => $members[3]->email ?? 'josh.silverman@example.com',
                    'phone' => $members[3]->phone_home ?? '(207) 555-0104',
                    'guests' => 0,
                    'quantity' => 1,
                    'ticket_price' => $vip->price,
                    'total_amount' => $vip->price,
                    'status' => 'confirmed',
                    'notes' => $i === 0 ? 'VIP seating for family foundation.' : null,
                ]);
            }
        }

        // Student tickets
        if ($student) {
            EventRSVP::create([
                'event_id' => $gala->id,
                'member_id' => null,
                'event_ticket_type_id' => $student->id,
                'name' => 'Emma Green',
                'email' => 'emma.green@university.edu',
                'phone' => '(207) 555-0301',
                'guests' => 0,
                'quantity' => 1,
                'ticket_price' => $student->price,
                'total_amount' => $student->price,
                'status' => 'confirmed',
                'notes' => 'Student at UMaine - excited to attend!',
            ]);

            EventRSVP::create([
                'event_id' => $gala->id,
                'member_id' => null,
                'event_ticket_type_id' => $student->id,
                'name' => 'Noah Berkowitz',
                'email' => 'noah.berkowitz@college.edu',
                'phone' => '(207) 555-0302',
                'guests' => 1,
                'quantity' => 1,
                'ticket_price' => $student->price,
                'total_amount' => $student->price,
                'status' => 'confirmed',
                'notes' => null,
            ]);
        }

        // Cancelled RSVP
        if ($member) {
            EventRSVP::create([
                'event_id' => $gala->id,
                'member_id' => null,
                'event_ticket_type_id' => $member->id,
                'name' => 'Lisa Thompson',
                'email' => 'lisa.thompson@example.com',
                'phone' => '(207) 555-0401',
                'guests' => 0,
                'quantity' => 1,
                'ticket_price' => $member->price,
                'total_amount' => $member->price,
                'status' => 'cancelled',
                'notes' => 'Cancelled due to schedule conflict - refund issued.',
            ]);
        }

        // Create RSVPs for the Passover Seder (past event)
        $passover = Event::where('name', 'Community Passover Seder')->first();
        if ($passover) {
            $adultTicket = EventTicketType::where('event_id', $passover->id)
                ->where('name', 'Adult')
                ->first();

            if ($adultTicket && $members->count() > 4) {
                EventRSVP::create([
                    'event_id' => $passover->id,
                    'member_id' => $members[4]->id ?? null,
                    'event_ticket_type_id' => $adultTicket->id,
                    'name' => isset($members[4]) ? $members[4]->first_name . ' ' . $members[4]->last_name : 'Aaron Rosenberg',
                    'email' => $members[4]->email ?? 'aaron.rosenberg@example.com',
                    'phone' => $members[4]->phone_home ?? '(207) 555-0105',
                    'guests' => 3,
                    'quantity' => 2,
                    'ticket_price' => $adultTicket->price,
                    'total_amount' => $adultTicket->price * 2,
                    'status' => 'confirmed',
                    'notes' => 'Family of 5 - 2 adults, 1 child (age 8), 1 child (age 3)',
                ]);
            }

            if ($adultTicket) {
                EventRSVP::create([
                    'event_id' => $passover->id,
                    'member_id' => null,
                    'event_ticket_type_id' => $adultTicket->id,
                    'name' => 'Hannah & Jacob Friedman',
                    'email' => 'hannah.friedman@example.com',
                    'phone' => '(207) 555-0501',
                    'guests' => 2,
                    'quantity' => 2,
                    'ticket_price' => $adultTicket->price,
                    'total_amount' => $adultTicket->price * 2,
                    'status' => 'confirmed',
                    'notes' => 'Gluten-free meal needed for Hannah.',
                ]);
            }
        }
    }
}
