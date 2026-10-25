<?php

namespace Database\Seeders;

use App\Models\ChartOfAccount;
use App\Models\Invoice;
use App\Models\Member;
use App\Models\Payment;
use App\Models\Seat;
use App\Models\SeatAssignment;
use App\Models\SeatingChart;
use App\Models\SeatingSeason;
use App\Services\SeatingService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

/**
 * Seeds a demo sanctuary seating chart with last year's season (sold and mostly paid)
 * and the upcoming season mid-sale: renewals offered, some confirmed, some still pending,
 * some declined, plus new buyers. Dates are computed from the Hebrew calendar, so the
 * upcoming season is always in the future.
 */
class SeatingSeeder extends Seeder
{
    public const IMAGE_PATH = 'seating-charts/demo-sanctuary.svg';

    public const PORTAL_MEMBER_EMAIL = 'david.cohen@test.com';

    private const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];

    // Seat geometry in the 1200x800 floor plan (assets/demo-sanctuary.svg).
    private const IMAGE_WIDTH = 1200;

    private const IMAGE_HEIGHT = 800;

    /** Household group sizes, cycled while filling rows front to back. */
    private const GROUP_SIZES = [3, 2, 4, 2, 2, 3, 1, 2, 5, 2, 3, 2, 4, 2];

    private const PAYMENT_METHODS = ['check', 'credit_card', 'stripe', 'cash'];

    public function __construct(protected SeatingService $seating) {}

    public function run(): void
    {
        if (SeatingChart::where('image_path', self::IMAGE_PATH)->exists()) {
            return;
        }

        $chart = $this->createChart();
        [$lastYear, $upcoming] = $this->createSeasons($chart);
        $households = $this->households();

        $this->sellLastYear($lastYear, $households);
        $this->sellUpcoming($upcoming, $lastYear);
    }

    protected function createChart(): SeatingChart
    {
        Storage::disk('public')->put(self::IMAGE_PATH, file_get_contents(__DIR__.'/assets/demo-sanctuary.svg'));

        $chart = SeatingChart::create([
            'name' => 'Main Sanctuary',
            'description' => 'Demo seating chart: 10 rows of pews on either side of the center aisle.',
            'image_path' => self::IMAGE_PATH,
            'image_width' => self::IMAGE_WIDTH,
            'image_height' => self::IMAGE_HEIGHT,
        ]);

        $sections = [
            'front' => ['name' => 'Front', 'color' => '#9333ea', 'rows' => ['A', 'B', 'C'], 'prices' => [450, 650]],
            'main' => ['name' => 'Main Floor', 'color' => '#2563eb', 'rows' => ['D', 'E', 'F', 'G', 'H'], 'prices' => [360, 540]],
            'rear' => ['name' => 'Rear', 'color' => '#0891b2', 'rows' => ['J', 'K'], 'prices' => [250, 400]],
        ];

        foreach (array_values($sections) as $order => $definition) {
            $section = $chart->sections()->create([
                'name' => $definition['name'],
                'color' => $definition['color'],
                'sort_order' => $order,
            ]);

            foreach ($definition['rows'] as $row) {
                $rowIndex = array_search($row, self::ROWS, true);

                for ($number = 1; $number <= 16; $number++) {
                    // Seats 1-8 are left of the center aisle, 9-16 right of it.
                    $x = $number <= 8 ? 230 + ($number - 1) * 44 : 662 + ($number - 9) * 44;
                    $y = 250 + $rowIndex * 44;

                    $chart->seats()->create([
                        'seating_section_id' => $section->id,
                        'label' => "{$row}{$number}",
                        'x' => round($x / self::IMAGE_WIDTH * 100, 3),
                        'y' => round($y / self::IMAGE_HEIGHT * 100, 3),
                        'member_price' => $definition['prices'][0],
                        'nonmember_price' => $definition['prices'][1],
                        // Aisle ends of the back row leave room for wheelchairs.
                        'is_accessible' => $row === 'K' && in_array($number, [1, 8, 9, 16], true),
                        // A broken seat, to show an out-of-service seat on the map.
                        'is_active' => "{$row}{$number}" !== 'G16',
                    ]);
                }
            }
        }

        return $chart;
    }

    /**
     * @return array{0: SeatingSeason, 1: SeatingSeason}
     */
    protected function createSeasons(SeatingChart $chart): array
    {
        $currentYear = (int) explode('/', jdtojewish(gregoriantojd(now()->month, now()->day, now()->year)))[2];
        $glAccountId = ChartOfAccount::where('account_code', '4500')->value('id');

        $lastErev = $this->erevRoshHashanah($currentYear);
        $nextErev = $this->erevRoshHashanah($currentYear + 1);

        $lastYear = SeatingSeason::create([
            'seating_chart_id' => $chart->id,
            'name' => "High Holy Days {$currentYear}",
            'first_service_date' => $lastErev,
            'member_sales_enabled' => true,
            'sale_starts_at' => $lastErev->copy()->subDays(75),
            'sale_ends_at' => $lastErev->copy()->subDays(2)->endOfDay(),
            'max_seats_per_member' => 8,
            'gl_account_id' => $glAccountId,
        ]);

        $upcoming = SeatingSeason::create([
            'seating_chart_id' => $chart->id,
            'name' => 'High Holy Days '.($currentYear + 1),
            'first_service_date' => $nextErev,
            'member_sales_enabled' => true,
            // Open now (alongside the renewal window) so every member flow can be tried.
            'sale_starts_at' => now()->subDays(7)->startOfDay(),
            'sale_ends_at' => $nextErev->copy()->subDays(2)->endOfDay(),
            'renewal_ends_at' => now()->addWeeks(3)->endOfDay(),
            'max_seats_per_member' => 8,
            'gl_account_id' => $glAccountId,
            'notes' => 'Demo season seeded with renewals in progress.',
        ]);

        return [$lastYear, $upcoming];
    }

    /**
     * Members who buy seats, with the member portal demo account first.
     *
     * @return Collection<int, Member>
     */
    protected function households(): Collection
    {
        if (Member::where('member_type', 'member')->count() < 12) {
            Member::factory()->count(12)->create(['member_type' => 'member']);
        }

        $portalMember = Member::where('email', self::PORTAL_MEMBER_EMAIL)->first();

        return Member::where('member_type', 'member')
            ->where(fn ($q) => $q->whereNull('deceased')->orWhere('deceased', false))
            ->when($portalMember, fn ($q) => $q->whereKeyNot($portalMember->id))
            ->orderBy('id')
            ->limit(39)
            ->get()
            ->when($portalMember, fn ($members) => $members->prepend($portalMember))
            ->values();
    }

    /**
     * Fill last year's season front to back in household groups; nearly everyone paid.
     */
    protected function sellLastYear(SeatingSeason $season, Collection $households): void
    {
        $blocks = $season->chart->seats()->where('is_active', true)->get()
            ->sortBy(fn (Seat $seat) => [array_search($seat->label[0], self::ROWS, true), (int) substr($seat->label, 1)])
            // One block per row and side of the center aisle.
            ->groupBy(fn (Seat $seat) => $seat->label[0].((int) substr($seat->label, 1) <= 8 ? 'L' : 'R'))
            ->map(fn (Collection $seats) => $seats->values())
            ->values();

        $invoiceDate = Carbon::parse($season->first_service_date)->subDays(45);
        $blockIndex = 0;
        $position = 0;

        foreach ($households as $index => $member) {
            $size = self::GROUP_SIZES[$index % count(self::GROUP_SIZES)];

            while ($blockIndex < $blocks->count() && $position + $size > $blocks[$blockIndex]->count()) {
                $blockIndex++;
                $position = 0;
            }

            if ($blockIndex >= $blocks->count()) {
                break;
            }

            $seats = $blocks[$blockIndex]->slice($position, $size);
            // Leave an occasional empty seat between families.
            $position += $size + ($index % 4 === 3 ? 1 : 0);

            $result = $this->seating->reserve($season, $member, $seats->pluck('id')->all(), ['source' => 'admin']);
            $result['assignments']->first()->update(['occupant_name' => "{$member->first_name} {$member->last_name}"]);

            $invoice = $result['invoice'];
            if (! $invoice) {
                continue;
            }

            $date = $invoiceDate->copy()->addDays($index % 30);
            $invoice->update(['invoice_date' => $date, 'due_date' => $season->first_service_date]);

            // Two families still owe for last year; one paid half.
            if (in_array($index, [7, 23], true)) {
                continue;
            }

            $amount = $index === 15 ? round((float) $invoice->total / 2, 2) : (float) $invoice->total;
            $this->recordPayment($invoice, $amount, self::PAYMENT_METHODS[$index % 4], $date->copy()->addDays(3));
        }
    }

    /**
     * Offer last year's holders their seats, then play out part of the renewal period.
     */
    protected function sellUpcoming(SeatingSeason $season, SeatingSeason $lastYear): void
    {
        $this->seating->offerRenewals($season, $lastYear);

        $renewals = $season->assignments()
            ->with('member')
            ->where('status', SeatAssignment::STATUS_RENEWAL)
            ->orderBy('id')
            ->get()
            ->groupBy('member_id')
            ->values();

        foreach ($renewals as $index => $held) {
            $member = $held->first()->member;

            // The portal demo member's seats stay held so the renewal banner shows.
            if ($member->email === self::PORTAL_MEMBER_EMAIL || $index % 6 === 5) {
                continue;
            }

            // Some families declined, freeing their seats.
            if ($index % 6 === 4) {
                $held->each(fn (SeatAssignment $assignment) => $this->seating->release($assignment));

                continue;
            }

            $result = $this->seating->reserve($season, $member, $held->pluck('seat_id')->all(), [
                'source' => $index % 2 === 0 ? 'member' : 'admin',
            ]);

            if ($invoice = $result['invoice']) {
                $date = now()->subDays(20 - ($index % 20));
                $invoice->update(['invoice_date' => $date]);

                if ($index % 3 === 0) {
                    $this->recordPayment($invoice, (float) $invoice->total, 'stripe', $date->copy()->addHour());
                }
            }
        }

        $this->sellToNewcomers($season);
    }

    /**
     * New buyers this year: members without last year's seats, plus non-members at non-member prices.
     */
    protected function sellToNewcomers(SeatingSeason $season): void
    {
        $seatedMemberIds = SeatAssignment::pluck('member_id')->unique();

        $buyers = Member::whereNotIn('id', $seatedMemberIds)
            ->where(fn ($q) => $q->whereNull('deceased')->orWhere('deceased', false))
            ->where('member_type', 'member')
            ->orderBy('id')
            ->limit(3)
            ->get()
            ->concat(Member::whereIn('member_type', ['contact', 'prospect'])->orderBy('id')->limit(3)->get());

        foreach ($buyers as $index => $buyer) {
            $taken = $season->assignments()->pluck('seat_id');
            $seats = $season->chart->seats()
                ->where('is_active', true)
                ->whereNotIn('id', $taken)
                ->get()
                // Back rows first, as late buyers would find them.
                ->sortByDesc(fn (Seat $seat) => [array_search($seat->label[0], self::ROWS, true), -(int) substr($seat->label, 1)])
                ->take(2);

            if ($seats->count() < 2) {
                return;
            }

            $result = $this->seating->reserve($season, $buyer, $seats->pluck('id')->all(), ['source' => 'member']);

            if ($result['invoice'] && $index % 2 === 0) {
                $this->recordPayment($result['invoice'], (float) $result['invoice']->total, 'credit_card', now()->subDays(2));
            }
        }
    }

    protected function recordPayment(Invoice $invoice, float $amount, string $method, Carbon $paidAt): void
    {
        Payment::create([
            'invoice_id' => $invoice->id,
            'member_id' => $invoice->member_id,
            'amount' => $amount,
            'payment_method' => $method,
            'transaction_id' => "DEMO-SEAT-{$invoice->invoice_number}",
            'status' => 'completed',
            'payment_details' => ['demo' => true, 'note' => 'Simulated payment; no external gateway was contacted.'],
            'paid_at' => $paidAt,
        ]);

        $paid = (float) $invoice->amount_paid + $amount;
        $invoice->update([
            'amount_paid' => $paid,
            'status' => $paid >= (float) $invoice->total ? 'paid' : 'partial',
        ]);
    }

    protected function erevRoshHashanah(int $hebrewYear): Carbon
    {
        [$month, $day, $year] = explode('/', jdtogregorian(jewishtojd(1, 1, $hebrewYear)));

        return Carbon::create((int) $year, (int) $month, (int) $day)->subDay();
    }
}
