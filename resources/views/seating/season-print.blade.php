@inject('settingsService', 'App\Services\SettingsService')
@php
    $status = function ($assignment) {
        if ($assignment->status === \App\Models\SeatAssignment::STATUS_RENEWAL) return ['renewal', __('Renewal held')];
        $invoice = $assignment->invoice;
        if (! $invoice) return (float) $assignment->price === 0.0 ? ['paid', __('Paid')] : ['unpaid', __('Not invoiced')];
        if ($invoice->status === 'paid') return ['paid', __('Paid')];
        return ['unpaid', (float) $invoice->amount_paid > 0 ? __('Partially paid') : __('Invoiced')];
    };
    $holder = fn ($a) => trim(($a->member->first_name ?? '').' '.($a->member->last_name ?? ''));
    $seatName = fn ($seat) => $seat->section ? "{$seat->label} ({$seat->section->name})" : $seat->label;
    $assigned = $seats->filter(fn ($seat) => $assignments->has($seat->id));
    $bySection = $assigned->groupBy(fn ($seat) => $seat->section->name ?? __('No section'));
    $byMember = $assigned->sortBy(fn ($seat) => mb_strtolower(($assignments[$seat->id]->member->last_name ?? '').' '.($assignments[$seat->id]->member->first_name ?? '')), SORT_NATURAL);
    $activeCount = $seats->where('is_active', true)->count();
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $season->name }} - {{ __('Seating') }}</title>
    <style>
        @page { margin: 0.5in; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 9pt; color: #1e293b; margin: 0; }
        h1 { font-size: 16pt; margin: 0; }
        h2 { font-size: 12pt; margin: 0 0 6pt; }
        .muted { color: #64748b; }
        .header { margin-bottom: 8pt; }
        .map { position: relative; margin: 0 auto; border: 1px solid #cbd5e1; background: #f8fafc; }
        .map img { position: absolute; left: 0; top: 0; }
        .seat { position: absolute; border: 1.5pt solid; border-radius: 2pt; text-align: center; font-weight: bold; color: #fff; overflow: hidden; }
        .seat.accessible { border-radius: 50%; }
        .seat.available { background: #fff; }
        .seat.inactive { background: #fff; border-color: #cbd5e1; border-style: dashed; color: #94a3b8; }
        .seat.paid { background: #334155; border-color: #334155; }
        .seat.unpaid { background: #94a3b8; border-color: #94a3b8; }
        .seat.renewal { background: #f59e0b; border-color: #f59e0b; }
        .legend { margin-top: 8pt; text-align: center; }
        .legend span { margin: 0 6pt; white-space: nowrap; }
        .swatch { display: inline-block; width: 8pt; height: 8pt; border: 1.5pt solid; vertical-align: middle; margin-right: 2pt; }
        .page-break { page-break-before: always; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; }
        th { text-align: left; font-size: 8pt; text-transform: uppercase; color: #64748b; border-bottom: 1pt solid #94a3b8; padding: 3pt 4pt; }
        td { border-bottom: 0.5pt solid #e2e8f0; padding: 1.5pt 4pt; vertical-align: top; line-height: 1.15; }
        tr { page-break-inside: avoid; }
        .section-row td { background: #f1f5f9; font-weight: bold; border-bottom: 1pt solid #cbd5e1; }
        .num { text-align: right; white-space: nowrap; }
        .footer { position: fixed; bottom: -0.3in; left: 0; right: 0; font-size: 7pt; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="footer">{{ $settingsService->organizationName() }} · {{ $season->name }} · {{ __('Printed :date', ['date' => now()->format('F j, Y g:i A')]) }}</div>

    <div class="header">
        <h1>{{ $season->name }}</h1>
        <div class="muted">
            {{ $chart->name }}
            @if($season->first_service_date) · {{ $season->first_service_date->format('F j, Y') }} @endif
            · {{ __(':reserved of :total seats assigned', ['reserved' => $assigned->count(), 'total' => $activeCount]) }}
        </div>
    </div>

    <div class="map" style="width: {{ $mapWidth }}pt; height: {{ $mapHeight }}pt;">
        @if($image)
            <img src="{{ $image }}" style="width: {{ $mapWidth }}pt; height: {{ $mapHeight }}pt;">
        @endif
        @foreach($seats as $seat)
            @php
                $assignment = $assignments[$seat->id] ?? null;
                $class = $assignment ? $status($assignment)[0] : ($seat->is_active ? 'available' : 'inactive');
                $color = $seat->section->color ?? '#64748b';
            @endphp
            <div class="seat {{ $class }} {{ $seat->is_accessible ? 'accessible' : '' }}"
                style="left: {{ $seat->x / 100 * $mapWidth - $seatSize / 2 }}pt; top: {{ $seat->y / 100 * $mapHeight - $seatSize / 2 }}pt;
                    width: {{ $seatSize - 3 }}pt; height: {{ $seatSize - 3 }}pt; line-height: {{ $seatSize - 3 }}pt; font-size: {{ max(4, $seatSize * 0.32) }}pt;
                    @if($class === 'available') border-color: {{ $color }}; color: {{ $color }}; @endif">{{ $seat->label }}</div>
        @endforeach
    </div>

    <div class="legend">
        <span><i class="swatch" style="background:#334155;border-color:#334155"></i>{{ __('Paid') }}</span>
        <span><i class="swatch" style="background:#94a3b8;border-color:#94a3b8"></i>{{ __('Unpaid') }}</span>
        <span><i class="swatch" style="background:#f59e0b;border-color:#f59e0b"></i>{{ __('Renewal held') }}</span>
        @foreach($chart->sections as $section)
            <span><i class="swatch" style="background:#fff;border-color:{{ $section->color }}"></i>{{ __(':section (available)', ['section' => $section->name]) }}</span>
        @endforeach
        <span><i class="swatch" style="background:#fff;border-color:#cbd5e1;border-style:dashed"></i>{{ __('Unavailable') }}</span>
    </div>

    <div class="page-break"></div>
    <h2>{{ __('Assignments by Seat') }}</h2>
    @if($assigned->isEmpty())
        <p class="muted">{{ __('No seats assigned yet.') }}</p>
    @else
        <table>
            <thead>
                <tr>
                    <th>{{ __('Seat') }}</th><th>{{ __('Member') }}</th><th>{{ __('Occupant') }}</th>
                    <th>{{ __('Status') }}</th><th class="num">{{ __('Price') }}</th><th>{{ __('Invoice') }}</th>
                </tr>
            </thead>
            <tbody>
                @foreach($bySection as $sectionName => $sectionSeats)
                    <tr class="section-row"><td colspan="6">{{ $sectionName }} <span class="muted">({{ $sectionSeats->count() }})</span></td></tr>
                    @foreach($sectionSeats as $seat)
                        @php $a = $assignments[$seat->id]; @endphp
                        <tr>
                            <td>{{ $seat->label }}</td>
                            <td>{{ $holder($a) }}</td>
                            <td>{{ $a->occupant_name ?? '' }}</td>
                            <td>{{ $status($a)[1] }}</td>
                            <td class="num">{{ $money($a->price) }}</td>
                            <td>{{ $a->invoice->invoice_number ?? '' }}</td>
                        </tr>
                    @endforeach
                @endforeach
            </tbody>
        </table>

        <div class="page-break"></div>
        <h2>{{ __('Assignments by Member') }}</h2>
        <table>
            <thead>
                <tr><th>{{ __('Member') }}</th><th>{{ __('Occupant') }}</th><th>{{ __('Seat') }}</th><th>{{ __('Status') }}</th></tr>
            </thead>
            <tbody>
                @foreach($byMember as $seat)
                    @php $a = $assignments[$seat->id]; @endphp
                    <tr>
                        <td>{{ $holder($a) }}</td>
                        <td>{{ $a->occupant_name ?? '' }}</td>
                        <td>{{ $seatName($seat) }}</td>
                        <td>{{ $status($a)[1] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif
</body>
</html>
