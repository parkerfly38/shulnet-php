<?php

namespace Database\Seeders;

use App\Models\Note;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class NoteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $notes = [
            [
                'item_scope' => 'Member',
                'name' => 'Follow up on dues payment',
                'deadline_date' => Carbon::now()->addDays(7),
                'completed_date' => null,
                'seen_date' => null,
                'note_text' => 'Contact Sarah Cohen about outstanding membership dues from last quarter. She mentioned financial difficulties but wants to continue membership.',
                'added_by' => 'Admin',
                'label' => 'Financial',
                'visibility' => 'Admin',
                'priority' => 'Medium',
            ],
            [
                'item_scope' => 'User',
                'name' => 'Schedule Rabbi meeting',
                'deadline_date' => Carbon::now()->addDays(3),
                'completed_date' => null,
                'seen_date' => Carbon::now()->subHours(2),
                'note_text' => 'Need to discuss upcoming High Holiday services planning. Rabbi requested meeting before end of month.',
                'added_by' => 'Board President',
                'label' => 'Meetings',
                'visibility' => 'Member',
                'priority' => 'High',
            ],
            [
                'item_scope' => 'Member',
                'name' => 'Update member contact information',
                'deadline_date' => null,
                'completed_date' => Carbon::now()->subDays(2),
                'seen_date' => Carbon::now()->subDays(2),
                'note_text' => 'David Goldberg moved to new address. Updated phone number and address in system.',
                'added_by' => 'Secretary',
                'label' => 'Contact Updates',
                'visibility' => 'Admin',
                'priority' => 'Low',
            ],
            [
                'item_scope' => 'Contact',
                'name' => 'Potential new member inquiry',
                'deadline_date' => Carbon::now()->addDays(14),
                'completed_date' => null,
                'seen_date' => null,
                'note_text' => 'Rachel and Mark Thompson called asking about membership. Interested in youth programs and holiday services. Schedule tour.',
                'added_by' => 'Membership Chair',
                'label' => 'New Members',
                'visibility' => 'Member',
                'priority' => 'Medium',
            ],
            [
                'item_scope' => 'User',
                'name' => 'Order Passover supplies',
                'deadline_date' => Carbon::now()->addDays(21),
                'completed_date' => null,
                'seen_date' => null,
                'note_text' => 'Need to order matzah, wine, and other Passover items for community Seder. Contact usual suppliers for quotes.',
                'added_by' => 'Events Committee',
                'label' => 'Holiday Prep',
                'visibility' => 'Member',
                'priority' => 'High',
            ],
            [
                'item_scope' => 'Member',
                'name' => 'Thank you note for donation',
                'deadline_date' => Carbon::now()->subDays(1),
                'completed_date' => null,
                'seen_date' => Carbon::now()->subDays(3),
                'note_text' => 'Send thank you letter to Mrs. Rosen for her generous donation to the building fund. Amount: $500.',
                'added_by' => 'Treasurer',
                'label' => 'Donations',
                'visibility' => 'Admin',
                'priority' => 'High',
            ],
            [
                'item_scope' => 'Contact',
                'name' => 'Vendor contract renewal',
                'deadline_date' => Carbon::now()->addMonths(1),
                'completed_date' => null,
                'seen_date' => null,
                'note_text' => 'Cleaning service contract expires next month. Review terms and negotiate new rates.',
                'added_by' => 'Facilities Manager',
                'label' => 'Contracts',
                'visibility' => 'Admin',
                'priority' => 'Medium',
            ],
            [
                'item_scope' => 'User',
                'name' => 'Website content update',
                'deadline_date' => Carbon::now()->addDays(10),
                'completed_date' => null,
                'seen_date' => Carbon::now()->subDays(1),
                'note_text' => 'Update website with new service times for winter schedule. Also add upcoming events calendar.',
                'added_by' => 'Communications',
                'label' => 'Website',
                'visibility' => 'Member',
                'priority' => 'Low',
            ],
            [
                'item_scope' => 'Member',
                'name' => 'Youth program registration',
                'deadline_date' => Carbon::now()->addDays(5),
                'completed_date' => null,
                'seen_date' => null,
                'note_text' => 'Remind families about youth program registration deadline. Several families haven\'t submitted forms yet.',
                'added_by' => 'Youth Director',
                'label' => 'Youth Programs',
                'visibility' => 'Broadcast',
                'priority' => 'Medium',
            ],
            [
                'item_scope' => 'Contact',
                'name' => 'Security system maintenance',
                'deadline_date' => Carbon::now()->addWeeks(2),
                'completed_date' => null,
                'seen_date' => null,
                'note_text' => 'Schedule quarterly security system check with monitoring company. Last inspection was 3 months ago.',
                'added_by' => 'Security Committee',
                'label' => 'Security',
                'visibility' => 'Admin',
                'priority' => 'Medium',
            ],
            [
                'item_scope' => 'User',
                'name' => 'Board meeting preparation',
                'deadline_date' => Carbon::now()->addDays(2),
                'completed_date' => null,
                'seen_date' => Carbon::now()->subHours(4),
                'note_text' => 'Prepare agenda and financial reports for next board meeting. Include budget review and committee updates.',
                'added_by' => 'President',
                'label' => 'Board Meetings',
                'visibility' => 'Admin',
                'priority' => 'High',
            ],
            [
                'item_scope' => 'Member',
                'name' => 'Yahrzeit reminder system',
                'deadline_date' => null,
                'completed_date' => Carbon::now()->subWeeks(1),
                'seen_date' => Carbon::now()->subWeeks(1),
                'note_text' => 'Successfully implemented automated yahrzeit reminder emails. System now sends monthly notifications.',
                'added_by' => 'IT Committee',
                'label' => 'Technology',
                'visibility' => 'Member',
                'priority' => 'Low',
            ],
        ];

        foreach ($notes as $noteData) {
            Note::create($noteData);
        }
    }
}
