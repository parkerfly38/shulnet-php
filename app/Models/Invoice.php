<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Carbon\Carbon;

class Invoice extends Model
{
    protected $fillable = [
        'member_id',
        'invoiceable_type',
        'invoiceable_id',
        'invoice_number',
        'invoice_date',
        'due_date',
        'status',
        'subtotal',
        'tax_amount',
        'total',
        'amount_paid',
        'notes',
        'recurring',
        'recurring_interval',
        'recurring_interval_count',
        'next_invoice_date',
        'last_invoice_date',
        'recurring_end_date',
        'parent_invoice_id',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'due_date' => 'date',
        'next_invoice_date' => 'date',
        'last_invoice_date' => 'date',
        'recurring_end_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'recurring' => 'boolean',
        'recurring_interval_count' => 'integer',
    ];

    /**
     * Get the remaining balance on the invoice
     */
    public function getBalanceAttribute(): float
    {
        return (float) ($this->total - $this->amount_paid);
    }

    /**
     * Check if invoice is fully paid
     */
    public function isFullyPaid(): bool
    {
        return $this->balance <= 0;
    }

    /**
     * Check if invoice has partial payment
     */
    public function hasPartialPayment(): bool
    {
        return $this->amount_paid > 0 && $this->balance > 0;
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function invoiceable(): MorphTo
    {
        return $this->morphTo();
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class)->orderBy('sort_order');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function parentInvoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'parent_invoice_id');
    }

    public function childInvoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'parent_invoice_id');
    }

    public function membershipPeriods(): HasMany
    {
        return $this->hasMany(MembershipPeriod::class);
    }

    /**
     * Calculate totals from items
     */
    public function calculateTotals(): void
    {
        $this->subtotal = $this->items->sum('total');
        $this->total = $this->subtotal + $this->tax_amount;
    }

    /**
     * Generate the next invoice number
     */
    public static function generateInvoiceNumber(): string
    {
        $lastInvoice = self::orderBy('id', 'desc')->first();
        $number = $lastInvoice ? intval(substr($lastInvoice->invoice_number, 4)) + 1 : 1;
        return 'INV-' . str_pad($number, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Check if invoice is overdue
     */
    public function isOverdue(): bool
    {
        return $this->status !== 'paid' && $this->due_date->isPast();
    }

    /**
     * Create next recurring invoice
     */
    public function createNextRecurringInvoice(): ?Invoice
    {
        if (!$this->recurring || !$this->next_invoice_date) {
            return null;
        }

        // Check if recurring has ended
        if ($this->recurring_end_date && $this->next_invoice_date->isAfter($this->recurring_end_date)) {
            return null;
        }

        // Create new invoice
        $newInvoice = $this->replicate(['invoice_number', 'invoice_date', 'due_date', 'status']);
        $newInvoice->invoice_number = self::generateInvoiceNumber();
        $newInvoice->invoice_date = $this->next_invoice_date;
        $newInvoice->due_date = $this->next_invoice_date->copy()->addDays(30);
        $newInvoice->status = 'draft';
        $newInvoice->parent_invoice_id = $this->id;
        $newInvoice->last_invoice_date = null;
        
        // Calculate next invoice date
        $newInvoice->next_invoice_date = $this->calculateNextDate($this->next_invoice_date);
        
        $newInvoice->save();

        // Copy items
        foreach ($this->items as $item) {
            $newItem = $item->replicate();
            $newItem->invoice_id = $newInvoice->id;
            $newItem->save();
        }

        // Update this invoice's last invoice date
        $this->last_invoice_date = $this->next_invoice_date;
        $this->next_invoice_date = $newInvoice->next_invoice_date;
        $this->save();

        return $newInvoice;
    }

    /**
     * Calculate next date based on interval
     */
    protected function calculateNextDate(Carbon $fromDate): Carbon
    {
        $date = $fromDate->copy();
        
        switch ($this->recurring_interval) {
            case 'daily':
                return $date->addDays($this->recurring_interval_count);
            case 'weekly':
                return $date->addWeeks($this->recurring_interval_count);
            case 'monthly':
                return $date->addMonths($this->recurring_interval_count);
            case 'yearly':
                return $date->addYears($this->recurring_interval_count);
            default:
                return $date;
        }
    }
}
