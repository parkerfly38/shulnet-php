<?php

namespace Tests\Unit\Models;

use App\Models\Event;
use App\Models\EventTicketType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventTicketTypeTest extends TestCase
{
    use RefreshDatabase;

    public function test_is_available_returns_true_for_active_ticket()
    {
        $ticket = EventTicketType::factory()->create([
            'active' => true,
            'sale_starts' => null,
            'sale_ends' => null,
            'quantity_available' => null,
        ]);

        $this->assertTrue($ticket->isAvailable());
    }

    public function test_is_available_returns_false_when_inactive()
    {
        $ticket = EventTicketType::factory()->create([
            'active' => false,
        ]);

        $this->assertFalse($ticket->isAvailable());
    }

    public function test_is_available_returns_false_before_sale_starts()
    {
        $ticket = EventTicketType::factory()->create([
            'active' => true,
            'sale_starts' => now()->addDays(3),
        ]);

        $this->assertFalse($ticket->isAvailable());
    }

    public function test_is_available_returns_true_after_sale_starts()
    {
        $ticket = EventTicketType::factory()->create([
            'active' => true,
            'sale_starts' => now()->subDays(3),
            'sale_ends' => now()->addDays(3),
        ]);

        $this->assertTrue($ticket->isAvailable());
    }

    public function test_is_available_returns_false_after_sale_ends()
    {
        $ticket = EventTicketType::factory()->create([
            'active' => true,
            'sale_ends' => now()->subDays(1),
        ]);

        $this->assertFalse($ticket->isAvailable());
    }

    public function test_is_available_returns_false_when_sold_out()
    {
        $ticket = EventTicketType::factory()->create([
            'active' => true,
            'quantity_available' => 10,
            'quantity_sold' => 10,
        ]);

        $this->assertFalse($ticket->isAvailable());
    }

    public function test_is_available_returns_false_when_oversold()
    {
        $ticket = EventTicketType::factory()->create([
            'active' => true,
            'quantity_available' => 10,
            'quantity_sold' => 12,
        ]);

        $this->assertFalse($ticket->isAvailable());
    }

    public function test_is_available_returns_true_when_tickets_remaining()
    {
        $ticket = EventTicketType::factory()->create([
            'active' => true,
            'quantity_available' => 10,
            'quantity_sold' => 5,
        ]);

        $this->assertTrue($ticket->isAvailable());
    }

    public function test_remaining_quantity_returns_null_when_unlimited()
    {
        $ticket = EventTicketType::factory()->create([
            'quantity_available' => null,
            'quantity_sold' => 100,
        ]);

        $this->assertNull($ticket->remainingQuantity());
    }

    public function test_remaining_quantity_calculates_correctly()
    {
        $ticket = EventTicketType::factory()->create([
            'quantity_available' => 50,
            'quantity_sold' => 30,
        ]);

        $this->assertEquals(20, $ticket->remainingQuantity());
    }

    public function test_remaining_quantity_returns_zero_when_sold_out()
    {
        $ticket = EventTicketType::factory()->create([
            'quantity_available' => 50,
            'quantity_sold' => 50,
        ]);

        $this->assertEquals(0, $ticket->remainingQuantity());
    }

    public function test_remaining_quantity_returns_zero_when_oversold()
    {
        $ticket = EventTicketType::factory()->create([
            'quantity_available' => 50,
            'quantity_sold' => 60,
        ]);

        $this->assertEquals(0, $ticket->remainingQuantity());
    }

    public function test_ticket_belongs_to_event()
    {
        $event = Event::factory()->create();
        $ticket = EventTicketType::factory()->create(['event_id' => $event->id]);

        $this->assertInstanceOf(Event::class, $ticket->event);
        $this->assertEquals($event->id, $ticket->event->id);
    }
}
