<?php

namespace Tests\Feature\Member;

use App\Models\Event;
use App\Models\EventRSVP;
use App\Models\EventTicketType;
use App\Models\GabbaiAssignment;
use App\Models\Invoice;
use App\Models\Member;
use App\Models\Student;
use App\Models\User;
use App\Models\Yahrzeit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Member $member;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->member = Member::factory()->create(['user_id' => $this->user->id]);
        $this->user->refresh();
    }

    public function test_dashboard_loads_for_authenticated_member()
    {
        $response = $this->actingAs($this->user)->get('/member/dashboard');

        $response->assertStatus(200);
    }

    public function test_dashboard_redirects_when_no_member_profile()
    {
        $userWithoutMember = User::factory()->create();

        $response = $this->actingAs($userWithoutMember)->get('/member/dashboard');

        $response->assertRedirect('/dashboard');
        $response->assertSessionHas('error', 'No member profile found.');
    }

    public function test_dashboard_displays_member_information()
    {
        $response = $this->actingAs($this->user)->get('/member/dashboard');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => 
            $page->component('member/dashboard')
                ->has('member')
                ->where('member.id', $this->member->id)
                ->where('member.first_name', $this->member->first_name)
                ->where('member.last_name', $this->member->last_name)
        );
    }

    public function test_dashboard_shows_recent_invoices()
    {
        Invoice::factory()->count(3)->create(['member_id' => $this->member->id]);

        $response = $this->actingAs($this->user)->get('/member/dashboard');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => 
            $page->has('invoices', 3)
        );
    }

    public function test_dashboard_limits_invoices_to_ten()
    {
        Invoice::factory()->count(15)->create(['member_id' => $this->member->id]);

        $response = $this->actingAs($this->user)->get('/member/dashboard');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => 
            $page->has('invoices', 10)
        );
    }

    public function test_dashboard_shows_upcoming_yahrzeits()
    {
        $yahrzeit = Yahrzeit::factory()->create([
            'date_of_death' => now()->addDays(30)->format('Y-m-d'),
        ]);
        
        $this->member->yahrzeits()->attach($yahrzeit, ['relationship' => 'Father']);

        $response = $this->actingAs($this->user)->get('/member/dashboard');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => 
            $page->has('yahrzeits')
        );
    }

    public function test_dashboard_shows_gabbai_assignments()
    {
        GabbaiAssignment::factory()->count(2)->create([
            'member_id' => $this->member->id,
            'date' => now()->addDays(10),
        ]);

        $response = $this->actingAs($this->user)->get('/member/dashboard');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => 
            $page->has('assignments', 2)
        );
    }

    public function test_dashboard_shows_upcoming_events()
    {
        Event::factory()->count(5)->create([
            'event_start' => now()->addDays(20),
            'public' => true,
        ]);

        $response = $this->actingAs($this->user)->get('/member/dashboard');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => 
            $page->has('events', 5)
        );
    }

    public function test_dashboard_detects_birthday()
    {
        $this->member->update([
            'dob' => now()->setYear(1990),
        ]);

        $response = $this->actingAs($this->user)->get('/member/dashboard');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => 
            $page->where('isBirthday', true)
        );
    }

    public function test_dashboard_detects_anniversary()
    {
        $this->member->update([
            'anniversary_date' => now()->setYear(2010),
        ]);

        $response = $this->actingAs($this->user)->get('/member/dashboard');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => 
            $page->where('isAnniversary', true)
        );
    }

    public function test_profile_page_loads_correctly()
    {
        $response = $this->actingAs($this->user)->get('/member/profile');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => 
            $page->component('member/profile')
                ->has('member')
        );
    }

    public function test_member_can_update_profile()
    {
        $data = [
            'first_name' => 'Updated',
            'last_name' => 'Name',
            'email' => 'updated@example.com',
            'phone1' => '555-1234',
            'city' => 'New York',
        ];

        $response = $this->actingAs($this->user)
            ->put('/member/profile', $data);

        $response->assertRedirect('/member/profile');
        $response->assertSessionHas('success');

        $this->member->refresh();
        $this->assertEquals('Updated', $this->member->first_name);
        $this->assertEquals('Name', $this->member->last_name);
        $this->assertEquals('updated@example.com', $this->member->email);
    }

    public function test_invoices_page_shows_all_invoices()
    {
        Invoice::factory()->count(12)->create(['member_id' => $this->member->id]);

        $response = $this->actingAs($this->user)->get('/member/invoices');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => 
            $page->component('member/invoices')
                ->has('invoices', 12)
        );
    }

    public function test_member_can_view_single_invoice()
    {
        $invoice = Invoice::factory()->create(['member_id' => $this->member->id]);

        $response = $this->actingAs($this->user)
            ->get("/member/invoices/{$invoice->id}");

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => 
            $page->component('member/invoice')
                ->where('invoice.id', $invoice->id)
        );
    }

    public function test_member_cannot_view_another_members_invoice()
    {
        $otherMember = Member::factory()->create();
        $invoice = Invoice::factory()->create(['member_id' => $otherMember->id]);

        $response = $this->actingAs($this->user)
            ->get("/member/invoices/{$invoice->id}");

        $response->assertForbidden();
    }

    public function test_events_page_shows_upcoming_rsvps()
    {
        $event = Event::factory()->create([
            'event_start' => now()->addDays(10),
        ]);
        
        EventRSVP::factory()->create([
            'member_id' => $this->member->id,
            'event_id' => $event->id,
        ]);

        $response = $this->actingAs($this->user)->get('/member/events');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => 
            $page->has('upcomingRsvps', 1)
        );
    }

    public function test_member_can_register_for_event()
    {
        $event = Event::factory()->create([
            'registration_required' => true,
            'public' => true,
            'event_start' => now()->addDays(30),
        ]);

        $ticketType = EventTicketType::factory()->create([
            'event_id' => $event->id,
            'price' => 25.00,
            'active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->post("/member/events/{$event->id}/register", [
                'ticket_type_id' => $ticketType->id,
                'quantity' => 2,
                'payment_option' => 'invoice',
            ]);

        $response->assertRedirect('/member/events');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('event_r_s_v_p_s', [
            'member_id' => $this->member->id,
            'event_id' => $event->id,
            'quantity' => 2,
        ]);
    }

    public function test_yahrzeits_page_displays_all_yahrzeits()
    {
        $yahrzeits = Yahrzeit::factory()->count(3)->create();
        
        foreach ($yahrzeits as $yahrzeit) {
            $this->member->yahrzeits()->attach($yahrzeit, ['relationship' => 'Family']);
        }

        $response = $this->actingAs($this->user)->get('/member/yahrzeits');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => 
            $page->has('yahrzeits', 3)
        );
    }

    public function test_api_dashboard_returns_json()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/member/dashboard');

        $response->assertSuccessful();
        $response->assertJsonStructure([
            'member',
            'invoices',
            'students',
            'yahrzeits',
            'assignments',
            'events',
            'isBirthday',
            'isAnniversary',
        ]);
    }

    public function test_api_profile_returns_member_data()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/member/profile');

        $response->assertSuccessful();
        $response->assertJsonStructure([
            'member' => [
                'id',
                'first_name',
                'last_name',
                'email',
            ],
        ]);
    }

    public function test_api_profile_update_modifies_member()
    {
        $response = $this->actingAs($this->user)
            ->putJson('/api/member/profile', [
                'first_name' => 'API',
                'last_name' => 'Updated',
                'email' => 'api@example.com',
            ]);

        $response->assertSuccessful();
        $response->assertJsonPath('member.first_name', 'API');

        $this->member->refresh();
        $this->assertEquals('API', $this->member->first_name);
    }
}
