<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\RideRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get(route('dashboard'))->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $this->actingAs($user = User::factory()->create());

        $this->get(route('dashboard'))->assertOk();
    }

    public function test_admin_dashboard_includes_upcoming_ride_requests(): void
    {
        $admin = User::factory()->admin()->create();
        $requester = Member::factory()->create(['first_name' => 'Rider', 'last_name' => 'Member']);
        $driver = Member::factory()->create(['first_name' => 'Driver', 'last_name' => 'Member']);
        $rideRequest = RideRequest::create([
            'requester_id' => $requester->id,
            'driver_id' => $driver->id,
            'service_at' => now()->addDays(2),
            'pickup_location' => '123 Main Street',
            'passenger_count' => 1,
        ]);

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertSuccessful()
            ->assertInertia(fn ($page) => $page
                ->component('admin/dashboard')
                ->has('upcomingRideRequests', 1)
                ->where('upcomingRideRequests.0.id', $rideRequest->id)
                ->where('upcomingRideRequests.0.requester.name', 'Rider Member')
                ->where('upcomingRideRequests.0.driver.name', 'Driver Member')
            );
    }
}
