<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventTicketType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventTicketTypeController extends Controller
{
    /**
     * Display a listing of ticket types for an event.
     */
    public function index(Event $event)
    {
        $ticketTypes = $event->ticketTypes()->get();

        return Inertia::render('events/ticket-types/index', [
            'event' => $event,
            'ticketTypes' => $ticketTypes,
        ]);
    }

    /**
     * Show the form for creating a new ticket type.
     */
    public function create(Event $event)
    {
        return Inertia::render('events/ticket-types/create', [
            'event' => $event,
        ]);
    }

    /**
     * Store a newly created ticket type.
     */
    public function store(Request $request, Event $event)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:early_bird,adult,child,member,nonmember,general,vip',
            'price' => 'required|numeric|min:0',
            'quantity_available' => 'nullable|integer|min:0',
            'sale_starts' => 'nullable|date',
            'sale_ends' => 'nullable|date|after_or_equal:sale_starts',
            'active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $event->ticketTypes()->create($validated);

        return redirect()->route('events.ticket-types.index', $event)
            ->with('success', 'Ticket type created successfully.');
    }

    /**
     * Show the form for editing a ticket type.
     */
    public function edit(Event $event, EventTicketType $ticketType)
    {
        return Inertia::render('events/ticket-types/edit', [
            'event' => $event,
            'ticketType' => $ticketType,
        ]);
    }

    /**
     * Update the specified ticket type.
     */
    public function update(Request $request, Event $event, EventTicketType $ticketType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:early_bird,adult,child,member,nonmember,general,vip',
            'price' => 'required|numeric|min:0',
            'quantity_available' => 'nullable|integer|min:0',
            'sale_starts' => 'nullable|date',
            'sale_ends' => 'nullable|date|after_or_equal:sale_starts',
            'active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $ticketType->update($validated);

        return redirect()->route('events.ticket-types.index', $event)
            ->with('success', 'Ticket type updated successfully.');
    }

    /**
     * Remove the specified ticket type.
     */
    public function destroy(Event $event, EventTicketType $ticketType)
    {
        $ticketType->delete();

        return redirect()->route('events.ticket-types.index', $event)
            ->with('success', 'Ticket type deleted successfully.');
    }
}
