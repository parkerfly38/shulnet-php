<?php

namespace Tests\Feature\Member;

use App\Models\Member;
use App\Models\RideRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RideRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_can_post_a_ride_request(): void
    {
        [$user, $member] = $this->memberUser();

        $response = $this->actingAs($user)->post('/member/rides', [
            'service_at' => now()->addDays(2)->format('Y-m-d H:i:s'),
            'pickup_location' => '123 Main Street',
            'passenger_count' => 2,
            'notes' => 'Needs an accessible vehicle.',
        ]);

        $response->assertRedirect('/member/rides');
        $this->assertDatabaseHas('ride_requests', [
            'requester_id' => $member->id,
            'pickup_location' => '123 Main Street',
            'passenger_count' => 2,
        ]);
    }

    public function test_another_member_can_claim_a_ride_request(): void
    {
        [, $requester] = $this->memberUser();
        [, $driver] = $this->memberUser();
        $rideRequest = RideRequest::create([
            'requester_id' => $requester->id,
            'service_at' => now()->addDays(2),
            'pickup_location' => '123 Main Street',
            'passenger_count' => 1,
        ]);

        $response = $this->actingAs($driver->user)->post("/member/rides/{$rideRequest->id}/claim");

        $response->assertRedirect('/member/rides');
        $this->assertDatabaseHas('ride_requests', ['id' => $rideRequest->id, 'driver_id' => $driver->id]);
    }

    public function test_member_cannot_claim_their_own_ride_request(): void
    {
        [$user, $member] = $this->memberUser();
        $rideRequest = RideRequest::create([
            'requester_id' => $member->id,
            'service_at' => now()->addDays(2),
            'pickup_location' => '123 Main Street',
            'passenger_count' => 1,
        ]);

        $response = $this->actingAs($user)->post("/member/rides/{$rideRequest->id}/claim");

        $response->assertSessionHas('error', 'You cannot claim your own ride request.');
        $this->assertDatabaseHas('ride_requests', ['id' => $rideRequest->id, 'driver_id' => null]);
    }

    private function memberUser(): array
    {
        $user = User::factory()->create();
        $member = Member::factory()->create(['user_id' => $user->id]);
        $user->refresh();

        return [$user, $member];
    }
}
