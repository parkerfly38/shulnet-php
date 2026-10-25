<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Member;
use App\Models\Seat;
use App\Models\SeatAssignment;
use App\Models\SeatingChart;
use App\Models\SeatingSeason;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SeatingTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['roles' => ['admin']]);
    }

    private function memberUser(array $attrs = []): array
    {
        $user = User::factory()->create();
        $member = Member::factory()->create(array_merge(['user_id' => $user->id, 'member_type' => 'member'], $attrs));
        $user->refresh();

        return [$user, $member];
    }

    private function chart(int $seats = 4): SeatingChart
    {
        $chart = SeatingChart::create(['name' => 'Main Sanctuary']);
        $section = $chart->sections()->create(['name' => 'Main Floor', 'color' => '#2563eb']);

        for ($i = 1; $i <= $seats; $i++) {
            $chart->seats()->create([
                'seating_section_id' => $section->id,
                'label' => "A{$i}",
                'x' => $i * 10,
                'y' => 20,
                'member_price' => 180,
                'nonmember_price' => 300,
            ]);
        }

        return $chart;
    }

    private function season(SeatingChart $chart, array $attrs = []): SeatingSeason
    {
        return SeatingSeason::create(array_merge([
            'seating_chart_id' => $chart->id,
            'name' => 'High Holy Days 5787',
            'first_service_date' => now()->addMonth(),
            'member_sales_enabled' => true,
        ], $attrs));
    }

    public function test_non_admins_cannot_manage_seating(): void
    {
        [$user] = $this->memberUser();

        $this->actingAs($user)->getJson('/admin/seating-charts')->assertForbidden();
        $this->actingAs($user)->getJson('/admin/seating-seasons')->assertForbidden();
    }

    public function test_admin_can_create_chart_with_image(): void
    {
        Storage::fake('public');

        $this->actingAs($this->admin())->post('/admin/seating-charts', [
            'name' => 'Main Sanctuary',
            'image' => UploadedFile::fake()->image('sanctuary.png', 1200, 800),
        ])->assertRedirect();

        $chart = SeatingChart::sole();
        $this->assertSame(1200, $chart->image_width);
        $this->assertSame(800, $chart->image_height);
        Storage::disk('public')->assertExists($chart->image_path);
    }

    public function test_layout_save_creates_updates_and_deletes_seats(): void
    {
        $chart = $this->chart(2);
        [$a1, $a2] = $chart->seats()->orderBy('label')->get()->all();
        $section = $chart->sections()->first();

        $this->actingAs($this->admin())->put("/admin/seating-charts/{$chart->id}/layout", [
            'sections' => [
                ['id' => $section->id, 'key' => (string) $section->id, 'name' => 'Main Floor', 'color' => '#2563eb'],
                ['key' => 'new-1', 'name' => 'Balcony', 'color' => '#16a34a'],
            ],
            'seats' => [
                // A1 and a new seat swap labels to prove the unique index doesn't trip.
                ['id' => $a1->id, 'label' => 'B1', 'x' => 15, 'y' => 25, 'section_key' => (string) $section->id, 'member_price' => 200, 'nonmember_price' => 350],
                ['label' => 'A1', 'x' => 50, 'y' => 60, 'section_key' => 'new-1', 'member_price' => 100, 'nonmember_price' => 150, 'is_accessible' => true],
            ],
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertDatabaseMissing('seats', ['id' => $a2->id]);
        $this->assertDatabaseHas('seats', ['id' => $a1->id, 'label' => 'B1', 'member_price' => 200]);
        $balcony = $chart->sections()->where('name', 'Balcony')->sole();
        $this->assertDatabaseHas('seats', ['label' => 'A1', 'seating_section_id' => $balcony->id, 'is_accessible' => true]);
    }

    public function test_layout_save_refuses_to_delete_assigned_seats(): void
    {
        $chart = $this->chart(1);
        $seat = $chart->seats()->sole();
        [, $member] = $this->memberUser();
        $this->season($chart)->assignments()->create([
            'seat_id' => $seat->id, 'member_id' => $member->id, 'status' => SeatAssignment::STATUS_RESERVED,
        ]);

        $this->actingAs($this->admin())
            ->put("/admin/seating-charts/{$chart->id}/layout", ['sections' => [], 'seats' => []])
            ->assertSessionHasErrors('seats');

        $this->assertDatabaseHas('seats', ['id' => $seat->id]);
    }

    public function test_admin_assigns_seats_and_creates_one_invoice(): void
    {
        $chart = $this->chart();
        $season = $this->season($chart);
        [, $member] = $this->memberUser(['member_type' => 'contact']);
        $seatIds = $chart->seats()->orderBy('label')->limit(2)->pluck('id')->all();

        $this->actingAs($this->admin())->post("/admin/seating-seasons/{$season->id}/assignments", [
            'member_id' => $member->id,
            'seat_ids' => $seatIds,
            'pricing' => 'nonmember',
            'create_invoice' => true,
        ])->assertRedirect()->assertSessionHas('success');

        $invoice = Invoice::with('items')->sole();
        $this->assertSame($member->id, $invoice->member_id);
        $this->assertSame(SeatingSeason::class, $invoice->invoiceable_type);
        $this->assertEquals(600, $invoice->total);
        $this->assertCount(2, $invoice->items);
        $this->assertStringContainsString('Seat A1 (Main Floor)', $invoice->items[0]->description);
        $this->assertSame(2, SeatAssignment::where('invoice_id', $invoice->id)->where('price', 300)->count());
    }

    public function test_a_seat_cannot_be_assigned_twice(): void
    {
        $chart = $this->chart();
        $season = $this->season($chart);
        $seat = $chart->seats()->first();
        [, $first] = $this->memberUser();
        [, $second] = $this->memberUser();
        $admin = $this->admin();

        $this->actingAs($admin)->post("/admin/seating-seasons/{$season->id}/assignments", [
            'member_id' => $first->id, 'seat_ids' => [$seat->id], 'pricing' => 'member',
        ])->assertSessionHas('success');

        $this->actingAs($admin)->post("/admin/seating-seasons/{$season->id}/assignments", [
            'member_id' => $second->id, 'seat_ids' => [$seat->id], 'pricing' => 'member',
        ])->assertSessionHas('error');

        $this->assertSame($first->id, SeatAssignment::sole()->member_id);
    }

    public function test_seats_from_another_chart_are_rejected(): void
    {
        $season = $this->season($this->chart());
        $foreignSeat = $this->chartNamed('Chapel')->seats()->first();
        [, $member] = $this->memberUser();

        $this->actingAs($this->admin())->post("/admin/seating-seasons/{$season->id}/assignments", [
            'member_id' => $member->id, 'seat_ids' => [$foreignSeat->id], 'pricing' => 'member',
        ])->assertSessionHas('error');

        $this->assertDatabaseCount('seat_assignments', 0);
    }

    public function test_releasing_a_seat_removes_it_from_the_invoice(): void
    {
        $chart = $this->chart();
        $season = $this->season($chart);
        [, $member] = $this->memberUser();
        $admin = $this->admin();

        $this->actingAs($admin)->post("/admin/seating-seasons/{$season->id}/assignments", [
            'member_id' => $member->id, 'seat_ids' => $chart->seats()->limit(2)->pluck('id')->all(), 'pricing' => 'member',
        ]);

        [$first, $second] = SeatAssignment::orderBy('id')->get()->all();

        $this->actingAs($admin)->delete("/admin/seating-seasons/{$season->id}/assignments/{$first->id}")
            ->assertSessionHas('success');
        $this->assertEquals(180, Invoice::sole()->total);

        $this->actingAs($admin)->delete("/admin/seating-seasons/{$season->id}/assignments/{$second->id}");
        $this->assertSame('cancelled', Invoice::sole()->status);
        $this->assertDatabaseCount('seat_assignments', 0);
    }

    public function test_seat_on_a_paid_invoice_cannot_be_released(): void
    {
        $chart = $this->chart();
        $season = $this->season($chart);
        [, $member] = $this->memberUser();
        $admin = $this->admin();

        $this->actingAs($admin)->post("/admin/seating-seasons/{$season->id}/assignments", [
            'member_id' => $member->id, 'seat_ids' => [$chart->seats()->first()->id], 'pricing' => 'member',
        ]);
        Invoice::sole()->update(['amount_paid' => 50, 'status' => 'partial']);
        $assignment = SeatAssignment::sole();

        $this->actingAs($admin)->delete("/admin/seating-seasons/{$season->id}/assignments/{$assignment->id}")
            ->assertSessionHas('error');

        $this->assertDatabaseHas('seat_assignments', ['id' => $assignment->id]);
    }

    public function test_admin_season_page_shows_assignments_and_stats(): void
    {
        $chart = $this->chart();
        $season = $this->season($chart);
        [, $member] = $this->memberUser();
        $season->assignments()->create([
            'seat_id' => $chart->seats()->first()->id, 'member_id' => $member->id,
            'status' => SeatAssignment::STATUS_RESERVED, 'price' => 180,
        ]);

        $this->actingAs($this->admin())->get("/admin/seating-seasons/{$season->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/seating/seasons/show')
                ->has('season.chart.seats', 4)
                ->has('assignments', 1)
                ->where('stats.seats', 4)
                ->where('stats.reserved', 1)
                ->where('stats.invoiced', 180));
    }

    public function test_member_reserves_seats_at_member_price_and_pays_now(): void
    {
        $chart = $this->chart();
        $season = $this->season($chart);
        [$user, $member] = $this->memberUser();
        $seat = $chart->seats()->first();

        $response = $this->actingAs($user)->post("/member/seating/{$season->id}/reserve", [
            'seat_ids' => [$seat->id],
            'payment_option' => 'pay_now',
        ]);

        $invoice = Invoice::sole();
        $response->assertRedirect(route('member.invoices.pay', $invoice->id));
        $this->assertEquals(180, $invoice->total);
        $this->assertDatabaseHas('seat_assignments', [
            'seat_id' => $seat->id, 'member_id' => $member->id, 'pricing' => 'member', 'source' => 'member',
        ]);
    }

    public function test_non_members_pay_the_non_member_price(): void
    {
        $chart = $this->chart();
        $season = $this->season($chart);
        [$user] = $this->memberUser(['member_type' => 'contact']);

        $this->actingAs($user)->post("/member/seating/{$season->id}/reserve", [
            'seat_ids' => [$chart->seats()->first()->id],
            'payment_option' => 'invoice',
        ])->assertRedirect(route('member.seating.show', $season));

        $this->assertEquals(300, Invoice::sole()->total);
    }

    public function test_member_cannot_reserve_when_sales_are_closed(): void
    {
        $chart = $this->chart();
        $season = $this->season($chart, ['sale_starts_at' => now()->addWeek()]);
        [$user] = $this->memberUser();

        $this->actingAs($user)->post("/member/seating/{$season->id}/reserve", [
            'seat_ids' => [$chart->seats()->first()->id],
            'payment_option' => 'invoice',
        ])->assertSessionHas('error');

        $this->assertDatabaseCount('seat_assignments', 0);
    }

    public function test_member_seat_limit_is_enforced(): void
    {
        $chart = $this->chart();
        $season = $this->season($chart, ['max_seats_per_member' => 2]);
        [$user] = $this->memberUser();

        $this->actingAs($user)->post("/member/seating/{$season->id}/reserve", [
            'seat_ids' => $chart->seats()->limit(3)->pluck('id')->all(),
            'payment_option' => 'invoice',
        ])->assertSessionHas('error');

        $this->assertDatabaseCount('seat_assignments', 0);
        $this->assertDatabaseCount('invoices', 0);
    }

    public function test_member_page_hides_who_holds_other_seats(): void
    {
        $chart = $this->chart();
        $season = $this->season($chart);
        [$user] = $this->memberUser();
        [, $other] = $this->memberUser();
        $taken = $chart->seats()->first();
        $season->assignments()->create([
            'seat_id' => $taken->id, 'member_id' => $other->id, 'status' => SeatAssignment::STATUS_RESERVED,
        ]);

        $this->actingAs($user)->get("/member/seating/{$season->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('member/seating/show')
                ->where('takenSeatIds', [$taken->id])
                ->has('myAssignments', 0)
                ->where('pricing', 'member'));
    }

    public function test_renewals_are_offered_and_block_other_members_during_the_window(): void
    {
        $chart = $this->chart();
        $lastYear = $this->season($chart, ['name' => '5786', 'member_sales_enabled' => false]);
        $thisYear = $this->season($chart, ['renewal_ends_at' => now()->addWeek()]);
        [$holderUser, $holder] = $this->memberUser();
        [$otherUser] = $this->memberUser();
        $seat = $chart->seats()->first();
        $lastYear->assignments()->create([
            'seat_id' => $seat->id, 'member_id' => $holder->id, 'status' => SeatAssignment::STATUS_RESERVED, 'occupant_name' => 'Grandma Rose',
        ]);

        $this->actingAs($this->admin())->post("/admin/seating-seasons/{$thisYear->id}/renewals", [
            'from_season_id' => $lastYear->id,
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('seat_assignments', [
            'seating_season_id' => $thisYear->id, 'seat_id' => $seat->id, 'member_id' => $holder->id,
            'status' => SeatAssignment::STATUS_RENEWAL, 'price' => 180, 'occupant_name' => 'Grandma Rose',
        ]);

        // Another member cannot take the held seat.
        $this->actingAs($otherUser)->post("/member/seating/{$thisYear->id}/reserve", [
            'seat_ids' => [$seat->id], 'payment_option' => 'invoice',
        ])->assertSessionHas('error');

        // The holder confirms it.
        $this->actingAs($holderUser)->post("/member/seating/{$thisYear->id}/reserve", [
            'seat_ids' => [$seat->id], 'payment_option' => 'invoice',
        ])->assertSessionHas('success');

        $renewal = $thisYear->assignments()->sole();
        $this->assertSame(SeatAssignment::STATUS_RESERVED, $renewal->status);
        $this->assertNotNull($renewal->invoice_id);
    }

    public function test_holder_can_confirm_renewal_before_general_sale_opens(): void
    {
        $chart = $this->chart();
        $season = $this->season($chart, ['sale_starts_at' => now()->addWeeks(2), 'renewal_ends_at' => now()->addWeek()]);
        [$user, $member] = $this->memberUser();
        $seat = $chart->seats()->first();
        $season->assignments()->create([
            'seat_id' => $seat->id, 'member_id' => $member->id, 'status' => SeatAssignment::STATUS_RENEWAL, 'price' => 180,
        ]);

        $this->actingAs($user)->post("/member/seating/{$season->id}/reserve", [
            'seat_ids' => [$seat->id], 'payment_option' => 'invoice',
        ])->assertSessionHas('success');

        // But cannot buy additional seats yet.
        $this->actingAs($user)->post("/member/seating/{$season->id}/reserve", [
            'seat_ids' => [$chart->seats()->where('id', '!=', $seat->id)->first()->id], 'payment_option' => 'invoice',
        ])->assertSessionHas('error');
    }

    public function test_lapsed_renewals_free_the_seat(): void
    {
        $chart = $this->chart();
        $season = $this->season($chart, ['renewal_ends_at' => now()->subDay()]);
        [, $holder] = $this->memberUser();
        [$otherUser, $other] = $this->memberUser();
        $seat = $chart->seats()->first();
        $season->assignments()->create([
            'seat_id' => $seat->id, 'member_id' => $holder->id, 'status' => SeatAssignment::STATUS_RENEWAL,
        ]);

        $this->actingAs($otherUser)->post("/member/seating/{$season->id}/reserve", [
            'seat_ids' => [$seat->id], 'payment_option' => 'invoice',
        ])->assertSessionHas('success');

        $this->assertSame($other->id, $season->assignments()->sole()->member_id);
    }

    public function test_renewals_require_the_same_chart(): void
    {
        $season = $this->season($this->chart());
        $other = $this->season($this->chartNamed('Chapel'));

        $this->actingAs($this->admin())->post("/admin/seating-seasons/{$season->id}/renewals", [
            'from_season_id' => $other->id,
        ])->assertSessionHas('error');
    }

    private function chartNamed(string $name): SeatingChart
    {
        $chart = SeatingChart::create(['name' => $name]);
        $chart->seats()->create(['label' => 'C1', 'x' => 1, 'y' => 1]);

        return $chart;
    }
}
