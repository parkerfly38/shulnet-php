<?php

namespace Database\Seeders;

use App\Enums\MemberCareAlert;
use App\Models\Banner;
use App\Models\Board;
use App\Models\CampaignEmail;
use App\Models\ChartOfAccount;
use App\Models\Committee;
use App\Models\EmailCampaign;
use App\Models\EmailRecord;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\Invoice;
use App\Models\Member;
use App\Models\MemberRelationship;
use App\Models\Note;
use App\Models\Payment;
use App\Models\RideRequest;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class DemoExperienceSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'brian.kresge@gmail.com')->firstOrFail();
        $portalMember = Member::where('email', 'david.cohen@test.com')->firstOrFail();

        $demoMembers = collect([
            [
                'first_name' => 'Alex',
                'last_name' => 'Morgan',
                'email' => 'alex.morgan.demo@example.test',
                'phone1' => '207-555-0101',
                'city' => 'Bangor',
                'state' => 'ME',
                'country' => 'USA',
                'member_type' => 'member',
            ],
            [
                'first_name' => 'Jamie',
                'last_name' => 'Morgan',
                'email' => 'jamie.morgan.demo@example.test',
                'phone1' => '207-555-0102',
                'city' => 'Bangor',
                'state' => 'ME',
                'country' => 'USA',
                'member_type' => 'member',
            ],
            [
                'first_name' => 'Riley',
                'last_name' => 'Morgan',
                'email' => 'riley.morgan.demo@example.test',
                'city' => 'Bangor',
                'state' => 'ME',
                'country' => 'USA',
                'member_type' => 'member',
            ],
            [
                'first_name' => 'Casey',
                'last_name' => 'Bennett',
                'email' => 'casey.bennett.demo@example.test',
                'phone1' => '207-555-0104',
                'city' => 'Brewer',
                'state' => 'ME',
                'country' => 'USA',
                'member_type' => 'member',
            ],
        ])->map(fn (array $attributes) => Member::updateOrCreate(
            ['email' => $attributes['email']],
            $attributes
        ));

        [$alex, $jamie, $riley, $casey] = $demoMembers;

        MemberRelationship::updateOrCreate(
            [
                'member_id' => $alex->id,
                'related_member_id' => $jamie->id,
                'relationship_type' => 'spouse',
            ]
        );
        MemberRelationship::updateOrCreate(
            [
                'member_id' => $alex->id,
                'related_member_id' => $riley->id,
                'relationship_type' => 'child',
            ]
        );

        $financeCommittee = Committee::firstOrCreate(
            ['name' => 'Finance Committee'],
            ['description' => 'Oversees budgeting and financial planning.']
        );
        $board = Board::firstOrCreate(
            ['name' => 'Board of Directors'],
            ['description' => 'Provides governance and strategic oversight.']
        );

        $financeCommittee->meetings()->updateOrCreate(
            ['title' => 'Quarterly Budget Review'],
            [
                'agenda' => 'Review the quarterly budget, membership dues, and facility costs.',
                'meeting_date' => now()->addDays(14)->setTime(18, 0),
                'location' => 'Conference Room',
            ]
        );
        $board->meetings()->updateOrCreate(
            ['title' => 'Board Planning Session'],
            [
                'agenda' => 'Review committee reports and plan upcoming community programs.',
                'meeting_date' => now()->subDays(21)->setTime(19, 0),
                'location' => 'Community Hall',
                'minutes' => 'Approved the fall program calendar and assigned follow-up actions.',
            ]
        );
        $financeCommittee->reports()->updateOrCreate(
            ['title' => 'Quarterly Finance Report'],
            [
                'report_date' => now()->subDays(7)->toDateString(),
                'content' => 'Membership renewals are on track. The committee reviewed tuition receipts, event revenue, and the facilities reserve.',
            ]
        );
        $board->reports()->updateOrCreate(
            ['title' => 'Community Programs Update'],
            [
                'report_date' => now()->subDays(14)->toDateString(),
                'content' => 'Holiday programming, adult education, and youth activities are progressing according to plan.',
            ]
        );

        $volunteerForm = Form::updateOrCreate(
            ['name' => 'Community Volunteer Interest'],
            [
                'description' => 'Tell us how you would like to help with community programs.',
                'schema' => [
                    ['id' => 'name', 'type' => 'text', 'label' => 'Name', 'required' => true],
                    ['id' => 'email', 'type' => 'text', 'label' => 'Email', 'required' => true],
                    ['id' => 'interests', 'type' => 'multiselect', 'label' => 'Areas of interest', 'required' => false, 'options' => ['Events', 'Education', 'Caring community']],
                    ['id' => 'availability', 'type' => 'textarea', 'label' => 'Availability', 'required' => false],
                ],
                'is_active' => true,
            ]
        );
        foreach ([
            ['ip_address' => '192.0.2.10', 'data' => ['name' => 'Alex Morgan', 'email' => $alex->email, 'interests' => ['Events', 'Education'], 'availability' => 'Two evenings per month']],
            ['ip_address' => '192.0.2.11', 'data' => ['name' => 'Casey Bennett', 'email' => $casey->email, 'interests' => ['Caring community'], 'availability' => 'Weekends']],
        ] as $submission) {
            FormSubmission::firstOrCreate(
                ['form_id' => $volunteerForm->id, 'ip_address' => $submission['ip_address']],
                ['data' => $submission['data']]
            );
        }

        $campaign = EmailCampaign::updateOrCreate(
            ['name' => 'Community Weekly Update'],
            [
                'description' => 'A demo newsletter for upcoming programs and community news.',
                'opt_in_type' => 'double',
                'is_active' => true,
                'confirmation_subject' => 'Confirm your community newsletter subscription',
                'confirmation_content' => 'Please confirm your subscription to the community weekly update.',
            ]
        );
        foreach ([$alex, $jamie, $casey] as $member) {
            $campaign->subscribers()->syncWithoutDetaching([
                $member->id => [
                    'status' => 'confirmed',
                    'confirmed_at' => now()->subDays(3),
                ],
            ]);
        }
        $campaign->subscribers()->syncWithoutDetaching([
            $riley->id => [
                'status' => 'pending',
                'confirmation_token' => 'demo-confirmation-token',
            ],
        ]);
        CampaignEmail::firstOrCreate(
            ['campaign_id' => $campaign->id, 'subject' => 'This Week at Our Community'],
            [
                'content' => 'Upcoming events: community dinner, Torah study, and volunteer orientation.',
                'status' => 'sent',
                'sent_at' => now()->subDays(2),
            ]
        );
        CampaignEmail::firstOrCreate(
            ['campaign_id' => $campaign->id, 'subject' => 'Volunteer Orientation Reminder'],
            [
                'content' => 'Join us for an orientation and learn about current volunteer opportunities.',
                'status' => 'pending',
            ]
        );

        $banner = Banner::updateOrCreate(
            ['title' => 'Community Dinner Registration Open'],
            [
                'message' => 'Reserve your place at the upcoming community dinner.',
                'type' => 'info',
                'target_audience' => 'all',
                'start_date' => now()->subDay(),
                'end_date' => now()->addMonth(),
                'is_active' => true,
                'is_dismissible' => true,
                'show_on_login' => true,
                'show_on_dashboard' => true,
                'action_url' => '/member/events',
                'action_text' => 'View events',
                'created_by' => $admin->id,
            ]
        );
        $banner->users()->syncWithoutDetaching([
            $portalMember->user_id => [
                'viewed' => true,
                'viewed_at' => now()->subHours(2),
            ],
        ]);
        Banner::updateOrCreate(
            ['title' => 'Office Holiday Hours'],
            [
                'message' => 'The administrative office will have adjusted hours during the holiday week.',
                'type' => 'warning',
                'target_audience' => 'members',
                'start_date' => now()->addDays(10),
                'end_date' => now()->addDays(20),
                'is_active' => true,
                'is_dismissible' => true,
                'show_on_dashboard' => true,
                'created_by' => $admin->id,
            ]
        );

        foreach ([
            ['message_id' => 'demo-email-record-001', 'member_id' => $alex->id, 'subject' => 'Welcome to the community', 'to' => $alex->email],
            ['message_id' => 'demo-email-record-002', 'member_id' => $jamie->id, 'subject' => 'Community dinner details', 'to' => $jamie->email],
            ['message_id' => 'demo-email-record-003', 'member_id' => $casey->id, 'subject' => 'Thank you for volunteering', 'to' => $casey->email],
        ] as $email) {
            EmailRecord::firstOrCreate(
                ['message_id' => $email['message_id']],
                [
                    'member_id' => $email['member_id'],
                    'subject' => $email['subject'],
                    'from' => 'community@example.test',
                    'to' => $email['to'],
                    'date_sent' => now()->subDays(4),
                    'conversation_id' => 'demo-community-update',
                ]
            );
        }

        RideRequest::firstOrCreate(
            [
                'requester_id' => $portalMember->id,
                'service_at' => now()->addDays(5)->setTime(9, 0),
                'pickup_location' => '123 Main St, Bangor',
            ],
            ['passenger_count' => 1, 'notes' => 'Ride to the morning service.']
        );
        RideRequest::firstOrCreate(
            [
                'requester_id' => $alex->id,
                'service_at' => now()->addDays(7)->setTime(17, 30),
                'pickup_location' => '45 Oak Street, Bangor',
            ],
            [
                'driver_id' => $casey->id,
                'passenger_count' => 2,
                'notes' => 'Two passengers; one folding walker.',
                'claimed_at' => now()->subHours(5),
            ]
        );
        RideRequest::firstOrCreate(
            [
                'requester_id' => $jamie->id,
                'service_at' => now()->addDays(9)->setTime(18, 0),
                'pickup_location' => '18 Pine Avenue, Brewer',
            ],
            ['passenger_count' => 1, 'notes' => 'Please call on arrival.']
        );

        $paidInvoice = Invoice::where('invoice_number', 'INV-000001')->firstOrFail();
        Payment::updateOrCreate(
            ['transaction_id' => 'DEMO-PAYMENT-INV-000001'],
            [
                'invoice_id' => $paidInvoice->id,
                'member_id' => $paidInvoice->member_id,
                'amount' => 500,
                'payment_method' => 'credit_card',
                'status' => 'completed',
                'payment_details' => ['demo' => true, 'note' => 'Simulated card payment; no external gateway was contacted.'],
                'paid_at' => now()->subMonths(2),
            ]
        );
        foreach ([
            [
                'invoice_number' => 'INV-000002',
                'transaction_id' => 'DEMO-PAYMENT-INV-000002',
                'amount' => 250,
                'payment_method' => 'stripe',
                'status' => 'pending',
                'paid_at' => null,
            ],
            [
                'invoice_number' => 'INV-000003',
                'transaction_id' => 'DEMO-PAYMENT-INV-000003',
                'amount' => 250,
                'payment_method' => 'paypal',
                'status' => 'failed',
                'paid_at' => null,
            ],
        ] as $paymentData) {
            $invoice = Invoice::where('invoice_number', $paymentData['invoice_number'])->firstOrFail();
            Payment::updateOrCreate(
                ['transaction_id' => $paymentData['transaction_id']],
                [
                    'invoice_id' => $invoice->id,
                    'member_id' => $invoice->member_id,
                    'amount' => $paymentData['amount'],
                    'payment_method' => $paymentData['payment_method'],
                    'status' => $paymentData['status'],
                    'payment_details' => ['demo' => true, 'note' => 'Simulated payment; no external gateway was contacted.'],
                    'paid_at' => $paymentData['paid_at'],
                ]
            );
        }

        $accountsByCode = [
            '4000' => 'membership',
            '4100' => 'tuition',
            '4300' => 'event',
            '4400' => 'cemetery',
            '4500' => 'holiday',
        ];
        foreach (Invoice::with('items')->get() as $invoice) {
            foreach ($invoice->items as $item) {
                foreach ($accountsByCode as $code => $term) {
                    if (str_contains(strtolower($item->description), $term)) {
                        $item->update([
                            'gl_account_id' => ChartOfAccount::where('account_code', $code)->value('id'),
                        ]);
                        break;
                    }
                }
            }
        }

        $this->seedLeadership($portalMember);
        $this->seedCareAlerts($admin, collect([$alex, $jamie, $casey]));
    }

    /**
     * Puts the portal member (David Cohen) on the board and a few committees, so his
     * leadership roles show on the admin board and committee pages.
     */
    private function seedLeadership(Member $member): void
    {
        $term = [
            'term_start_date' => now()->subMonths(9)->toDateString(),
            'term_end_date' => now()->addMonths(15)->toDateString(),
        ];

        Board::firstOrCreate(
            ['name' => 'Board of Directors'],
            ['description' => 'Provides governance and strategic oversight.']
        )->members()->syncWithoutDetaching([$member->id => ['title' => 'Trustee', ...$term]]);

        $committees = [
            'Ritual Committee' => ['Vice Chair', 'Manages religious services, holiday observances, and ritual practices.'],
            'Education Committee' => ['Member', 'Oversees religious school programs, adult education, and lifelong learning initiatives.'],
            'Finance Committee' => ['Member', 'Oversees budgeting and financial planning.'],
        ];

        foreach ($committees as $name => [$title, $description]) {
            Committee::firstOrCreate(['name' => $name], ['description' => $description])
                ->members()->syncWithoutDetaching([$member->id => ['title' => $title, ...$term]]);
        }
    }

    /**
     * Open member care alerts for the admin dashboard, one of each kind, plus a resolved one
     * that should no longer appear there.
     */
    private function seedCareAlerts(User $admin, Collection $members): void
    {
        [$alex, $jamie, $casey] = $members->all();
        $john = Member::where('email', 'john.doe@example.com')->first() ?? $alex;

        $alerts = [
            [$casey, MemberCareAlert::Hospitalized, 'Casey in hospital after surgery', 'Casey is at Northern Light Eastern Maine Medical Center recovering from knee surgery. Rabbi to visit; Chesed committee to arrange meals for the week after discharge.', 'High', now()->addDays(2), null],
            [$jamie, MemberCareAlert::Mourning, 'Shiva for Jamie\'s father', 'Jamie\'s father passed away. Shiva at the Morgan home through Sunday; evening minyan at 7:00 PM. Coordinate meal train and minyan volunteers.', 'High', now()->addDays(5), null],
            [$alex, MemberCareAlert::ImmediateFollowUp, 'Check in with Alex after job loss', 'Alex mentioned being laid off. Reach out privately about dues relief and the community job network.', 'Medium', now()->addDays(3), null],
            [$john, MemberCareAlert::OtherEmergency, 'House fire: John Doe family displaced', 'Kitchen fire at the Doe home; family is staying with relatives. Collect gift cards and check on housing needs.', 'High', now()->addDay(), null],
            [$casey, MemberCareAlert::ImmediateFollowUp, 'Call Casey after outpatient tests', 'Casey received good news from the tests. No further follow-up needed.', 'Low', now()->subDays(20), now()->subDays(18)],
        ];

        foreach ($alerts as [$member, $alert, $name, $text, $priority, $deadline, $completed]) {
            Note::updateOrCreate(
                ['name' => $name, 'member_id' => $member->id],
                [
                    'item_scope' => 'Member',
                    'note_text' => $text,
                    'member_care_alert' => $alert,
                    'priority' => $priority,
                    'visibility' => 'Admin',
                    'label' => 'Member Care',
                    'added_by' => $admin->name,
                    'user_id' => $admin->id,
                    'deadline_date' => $deadline,
                    'completed_date' => $completed,
                ]
            );
        }
    }
}
