<?php

namespace App\Exports;

use App\Models\EventRSVP;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EventRSVPExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    protected $eventId;

    public function __construct($eventId)
    {
        $this->eventId = $eventId;
    }

    public function collection()
    {
        return EventRSVP::with(['member', 'ticketType', 'event'])
            ->where('event_id', $this->eventId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'RSVP ID',
            'Name',
            'Email',
            'Phone',
            'Member ID',
            'Member Name',
            'Ticket Type',
            'Quantity',
            'Ticket Price',
            'Total Amount',
            'Guests',
            'Status',
            'Notes',
            'Registration Date',
            'Event Name',
        ];
    }

    public function map($rsvp): array
    {
        return [
            $rsvp->id,
            $rsvp->name,
            $rsvp->email,
            $rsvp->phone ?: '',
            $rsvp->member_id ?: '',
            $rsvp->member ? $rsvp->member->first_name . ' ' . $rsvp->member->last_name : '',
            $rsvp->ticketType ? $rsvp->ticketType->name : '',
            $rsvp->quantity ?: '',
            $rsvp->ticket_price ? '$' . number_format($rsvp->ticket_price, 2) : '',
            $rsvp->total_amount ? '$' . number_format($rsvp->total_amount, 2) : '',
            $rsvp->guests ?: '0',
            ucfirst($rsvp->status),
            $rsvp->notes ?: '',
            $rsvp->created_at ? $rsvp->created_at->format('Y-m-d H:i:s') : '',
            $rsvp->event ? $rsvp->event->name : '',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold header
            1 => ['font' => ['bold' => true]],
        ];
    }
}
