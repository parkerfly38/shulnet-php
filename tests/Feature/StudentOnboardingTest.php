<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Member;
use App\Models\ParentModel;
use App\Models\SchoolTuitionTier;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentOnboardingTest extends TestCase
{
    use RefreshDatabase;

    private function tier(): SchoolTuitionTier
    {
        return SchoolTuitionTier::create([
            'name' => 'Full Tuition', 'slug' => 'full-tuition', 'price' => 1200,
            'billing_period' => 'annual', 'is_active' => true, 'sort_order' => 1,
        ]);
    }

    /**
     * What the dialog sends: every field of the form, with blank strings for the ones not in use.
     */
    private function payload(array $parent, SchoolTuitionTier $tier): array
    {
        return [
            'students' => [
                ['first_name' => 'Noah', 'last_name' => 'Morgan', 'middle_name' => '', 'gender' => '', 'date_of_birth' => '', 'address' => '', 'email' => '', 'is_parent_email' => false],
                ['first_name' => 'Ava', 'last_name' => 'Morgan', 'middle_name' => '', 'gender' => 'female', 'date_of_birth' => '2016-04-02', 'address' => '', 'email' => '', 'is_parent_email' => false],
            ],
            'parent_data' => $parent + [
                'selection_type' => 'existing_parent', 'parent_id' => '', 'member_id' => '',
                'first_name' => '', 'last_name' => '', 'date_of_birth' => '', 'address' => '', 'email' => '',
            ],
            'tuition_data' => [
                'tuition_tier_id' => (string) $tier->id, 'quantity' => 2, 'start_date' => '2026-11-14',
                'create_invoice' => true, 'email_invoice' => false,
            ],
        ];
    }

    public function test_onboarding_with_an_existing_parent(): void
    {
        $tier = $this->tier();
        $parent = ParentModel::create(['first_name' => 'Jamie', 'last_name' => 'Morgan', 'email' => 'jamie@example.com']);

        $this->actingAs(User::factory()->admin()->create())
            ->post('/onboarding/student', $this->payload(['selection_type' => 'existing_parent', 'parent_id' => (string) $parent->id], $tier))
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $this->assertSame(2, $parent->students()->count());
        $this->assertEquals(2400, Invoice::sole()->total);
    }

    public function test_onboarding_with_an_existing_member(): void
    {
        $tier = $this->tier();
        $member = Member::factory()->create();

        $this->actingAs(User::factory()->admin()->create())
            ->post('/onboarding/student', $this->payload(['selection_type' => 'existing_member', 'member_id' => (string) $member->id], $tier))
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $parent = ParentModel::sole();
        $this->assertSame($parent->id, $member->fresh()->parent_id);
        $this->assertSame(2, $parent->students()->count());
        $this->assertSame($member->id, Invoice::sole()->member_id);
    }

    public function test_a_member_who_is_already_a_parent_keeps_one_parent_record(): void
    {
        $tier = $this->tier();
        $parent = ParentModel::create(['first_name' => 'Jamie', 'last_name' => 'Morgan', 'email' => 'jamie@example.com']);
        $member = Member::factory()->create(['parent_id' => $parent->id]);

        $this->actingAs(User::factory()->admin()->create())
            ->post('/onboarding/student', $this->payload(['selection_type' => 'existing_member', 'member_id' => (string) $member->id], $tier))
            ->assertSessionHasNoErrors();

        $this->assertSame(1, ParentModel::count());
        $this->assertSame(2, $parent->students()->count());
    }

    public function test_onboarding_with_a_new_parent(): void
    {
        $tier = $this->tier();

        $this->actingAs(User::factory()->admin()->create())
            ->post('/onboarding/student', $this->payload([
                'selection_type' => 'new_parent', 'first_name' => 'Jamie', 'last_name' => 'Morgan', 'email' => 'jamie@example.com',
            ], $tier))
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $parent = ParentModel::sole();
        $this->assertSame('jamie@example.com', $parent->email);
        $this->assertSame(['Ava', 'Noah'], $parent->students()->orderBy('first_name')->pluck('first_name')->all());
    }

    // Invoices show the member's name, so a parent who isn't a member is billed through a contact record.
    public function test_tuition_invoice_for_a_non_member_parent_carries_their_name(): void
    {
        $tier = $this->tier();
        $parent = ParentModel::create([
            'first_name' => 'Jamie', 'last_name' => 'Morgan', 'email' => 'jamie@example.com',
            'phone' => '207-555-0102', 'address' => "12 Elm St\nBangor, ME 04401",
        ]);

        $this->actingAs(User::factory()->admin()->create())
            ->post('/onboarding/student', $this->payload(['selection_type' => 'existing_parent', 'parent_id' => (string) $parent->id], $tier))
            ->assertSessionHasNoErrors();

        $billed = Invoice::sole()->member;
        $this->assertSame(['Jamie', 'Morgan', 'jamie@example.com', 'contact', '12 Elm St', 'Bangor, ME 04401'],
            [$billed->first_name, $billed->last_name, $billed->email, $billed->member_type, $billed->address_line_1, $billed->address_line_2]);
        $this->assertSame($parent->id, $billed->parent_id);

        // A second onboarding for the same parent reuses that record.
        $this->actingAs(User::factory()->admin()->create())
            ->post('/onboarding/student', $this->payload(['selection_type' => 'existing_parent', 'parent_id' => (string) $parent->id], $tier));
        $this->assertSame(1, Member::count());
        $this->assertSame([$billed->id], Invoice::pluck('member_id')->unique()->values()->all());
    }

    public function test_the_migration_names_existing_parent_invoices(): void
    {
        $parent = ParentModel::create(['first_name' => 'Casey', 'last_name' => 'Bennett']);
        $invoice = Invoice::create([
            'invoiceable_type' => ParentModel::class, 'invoiceable_id' => $parent->id,
            'invoice_number' => 'INV-OLD-1', 'invoice_date' => now(), 'due_date' => now(), 'total' => 100, 'status' => 'open',
        ]);

        (require database_path('migrations/2026_11_16_000001_bill_parent_tuition_invoices_to_a_member.php'))->up();

        $this->assertSame('Casey', $invoice->fresh()->member->first_name);
    }

    public function test_new_parent_still_needs_a_name_and_email(): void
    {
        $tier = $this->tier();

        $this->actingAs(User::factory()->admin()->create())
            ->post('/onboarding/student', $this->payload(['selection_type' => 'new_parent'], $tier))
            ->assertSessionHasErrors(['parent_data.first_name', 'parent_data.last_name', 'parent_data.email']);

        $this->assertSame(0, Student::count());
    }

    // The students page deletes through the API and gets an empty 204 back.
    public function test_an_onboarded_student_can_be_deleted(): void
    {
        $tier = $this->tier();
        $parent = ParentModel::create(['first_name' => 'Jamie', 'last_name' => 'Morgan', 'email' => 'jamie@example.com']);
        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->post('/onboarding/student', $this->payload(['selection_type' => 'existing_parent', 'parent_id' => (string) $parent->id], $tier));
        $student = $parent->students()->firstOrFail();

        $this->actingAs($admin)->deleteJson("/api/admin/students/{$student->id}")->assertNoContent();

        $this->assertModelMissing($student);
        $this->assertSame(1, $parent->students()->count());
    }
}
