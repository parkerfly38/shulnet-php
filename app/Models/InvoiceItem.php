<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    protected $fillable = [
        'invoice_id',
        'description',
        'quantity',
        'unit_price',
        'total',
        'amount_paid',
        'sort_order',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'sort_order' => 'integer',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Calculate total from quantity and unit price
     */
    public function calculateTotal(): void
    {
        $this->total = $this->quantity * $this->unit_price;
    }

    /**
     * Get the remaining balance on the invoice item
     */
    public function getBalanceAttribute(): float
    {
        return (float) ($this->total - ($this->amount_paid ?? 0));
    }

    /**
     * Check if item is fully paid
     */
    public function isFullyPaid(): bool
    {
        return $this->balance <= 0;
    }

    /**
     * Check if item has partial payment
     */
    public function hasPartialPayment(): bool
    {
        return ($this->amount_paid ?? 0) > 0 && $this->balance > 0;
    }
}
