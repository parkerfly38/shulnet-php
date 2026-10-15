<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\RideRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RideRequestController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $member = $user->member;
        $isAdmin = $user->isAdmin();

        if (! $member && ! $isAdmin) {
            return redirect()->route('dashboard')->with('error', 'No member profile found.');
        }

        $rideRequests = RideRequest::query()
            ->with(['requester:id,first_name,last_name,email,phone1', 'driver:id,first_name,last_name'])
            ->where('service_at', '>=', now())
            ->orderBy('service_at')
            ->get()
            ->map(fn (RideRequest $rideRequest) => [
                'id' => $rideRequest->id,
                'service_at' => $rideRequest->service_at->toIso8601String(),
                'pickup_location' => $rideRequest->pickup_location,
                'passenger_count' => $rideRequest->passenger_count,
                'notes' => $rideRequest->notes,
                'requester_name' => trim($rideRequest->requester->first_name.' '.$rideRequest->requester->last_name),
                'is_mine' => $member !== null && $rideRequest->requester_id === $member->id,
                'is_claimed_by_me' => $member !== null && $rideRequest->driver_id === $member->id,
                'driver_name' => $rideRequest->driver ? trim($rideRequest->driver->first_name.' '.$rideRequest->driver->last_name) : null,
                'contact' => ($isAdmin || ($member !== null && $rideRequest->driver_id === $member->id)) ? [
                    'email' => $rideRequest->requester->email,
                    'phone' => $rideRequest->requester->phone1,
                ] : null,
            ]);

        return Inertia::render('member/rides', [
            'rideRequests' => $rideRequests,
            'isAdmin' => $isAdmin,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $member = $user->member;
        $isAdmin = $user->isAdmin();

        if (! $member && ! $isAdmin) {
            return redirect()->route('dashboard')->with('error', 'No member profile found.');
        }

        $rules = [
            'service_at' => ['required', 'date', 'after:now'],
            'pickup_location' => ['required', 'string', 'max:255'],
            'passenger_count' => ['required', 'integer', 'min:1', 'max:8'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];

        // Admins may create a request on behalf of any member; regular members always use their own profile.
        if ($isAdmin) {
            $rules['member_id'] = [$member ? 'nullable' : 'required', 'integer', 'exists:members,id'];
        }

        $validated = $request->validate($rules);

        $requester = ($isAdmin && ! empty($validated['member_id']))
            ? Member::findOrFail($validated['member_id'])
            : $member;

        unset($validated['member_id']);

        $requester->rideRequests()->create($validated);

        return redirect()->route('member.rides.index')->with('success', 'Ride request posted.');
    }

    public function claim(Request $request, RideRequest $rideRequest): RedirectResponse
    {
        $member = $request->user()->member;

        if (! $member) {
            return back()->with('error', 'You need a member profile to volunteer to drive.');
        }

        $claimed = $rideRequest->requester_id !== $member->id && RideRequest::query()
            ->whereKey($rideRequest->id)
            ->whereNull('driver_id')
            ->where('service_at', '>=', now())
            ->update([
                'driver_id' => $member->id,
                'claimed_at' => now(),
                'updated_at' => now(),
            ]);

        if (! $claimed) {
            $error = $rideRequest->requester_id === $member->id
                ? 'You cannot claim your own ride request.'
                : 'This ride request is no longer available.';

            return back()->with('error', $error);
        }

        return redirect()->route('member.rides.index')->with('success', 'You have signed up to provide this ride.');
    }
}
