<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
        }
        .header {
            margin-bottom: 30px;
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 32px;
            color: #4F46E5;
        }
        .header .invoice-number {
            font-size: 16px;
            color: #666;
            margin-top: 5px;
        }
        .company-info {
            margin-bottom: 20px;
        }
        .info-section {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        .info-column {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }
        .info-box {
            background-color: #F9FAFB;
            padding: 15px;
            border-radius: 5px;
        }
        .info-box h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #4F46E5;
            text-transform: uppercase;
        }
        .info-box p {
            margin: 5px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        table thead {
            background-color: #4F46E5;
            color: white;
        }
        table thead th {
            padding: 12px 10px;
            text-align: left;
            font-weight: 600;
        }
        table tbody td {
            padding: 10px;
            border-bottom: 1px solid #E5E7EB;
        }
        table tbody tr:last-child td {
            border-bottom: none;
        }
        .text-right {
            text-align: right;
        }
        .totals {
            margin-top: 20px;
            float: right;
            width: 300px;
        }
        .totals table {
            margin-top: 0;
        }
        .totals table td {
            padding: 8px 10px;
            border-bottom: none;
        }
        .totals .subtotal {
            font-weight: normal;
        }
        .totals .tax {
            font-weight: normal;
        }
        .totals .total {
            font-size: 16px;
            font-weight: bold;
            background-color: #F3F4F6;
        }
        .notes {
            clear: both;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
        }
        .notes h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #666;
        }
        .footer {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            text-align: center;
            color: #999;
            font-size: 10px;
            border-top: 1px solid #E5E7EB;
            padding-top: 10px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-draft { background-color: #E5E7EB; color: #6B7280; }
        .status-open { background-color: #DBEAFE; color: #1E40AF; }
        .status-paid { background-color: #D1FAE5; color: #065F46; }
        .status-overdue { background-color: #FEE2E2; color: #991B1B; }
        .status-cancelled { background-color: #F3F4F6; color: #4B5563; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ config('app.name') }}</h1>
        <div class="invoice-number">Invoice #{{ $invoice->invoice_number }}</div>
    </div>

    <div class="info-section">
        <div class="info-column">
            <div class="info-box">
                <h3>Bill To</h3>
                <p><strong>{{ $invoice->member->first_name }} {{ $invoice->member->last_name }}</strong></p>
                @if($invoice->member->address)
                    <p>{{ $invoice->member->address }}</p>
                @endif
                @if($invoice->member->city || $invoice->member->state || $invoice->member->zip)
                    <p>{{ $invoice->member->city }}@if($invoice->member->city && $invoice->member->state), @endif{{ $invoice->member->state }} {{ $invoice->member->zip }}</p>
                @endif
                @if($invoice->member->email)
                    <p>{{ $invoice->member->email }}</p>
                @endif
                @if($invoice->member->phone)
                    <p>{{ $invoice->member->phone }}</p>
                @endif
            </div>
        </div>
        <div class="info-column" style="padding-left: 20px;">
            <div class="info-box">
                <h3>Invoice Details</h3>
                <p><strong>Invoice Date:</strong> {{ $invoice->invoice_date->format('M d, Y') }}</p>
                <p><strong>Due Date:</strong> {{ $invoice->due_date->format('M d, Y') }}</p>
                <p>
                    <strong>Status:</strong> 
                    <span class="status-badge status-{{ $invoice->status }}">{{ $invoice->status }}</span>
                </p>
                @if($invoice->recurring)
                    <p><strong>Recurring:</strong> Every {{ $invoice->recurring_interval_count }} {{ $invoice->recurring_interval }}</p>
                @endif
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 50%;">Description</th>
                <th class="text-right" style="width: 15%;">Quantity</th>
                <th class="text-right" style="width: 15%;">Unit Price</th>
                <th class="text-right" style="width: 20%;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->items as $item)
            <tr>
                <td>{{ $item->description }}</td>
                <td class="text-right">{{ number_format($item->quantity, 2) }}</td>
                <td class="text-right">${{ number_format($item->unit_price, 2) }}</td>
                <td class="text-right">${{ number_format($item->total, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr class="subtotal">
                <td>Subtotal:</td>
                <td class="text-right">${{ number_format($invoice->subtotal, 2) }}</td>
            </tr>
            @if($invoice->tax_amount > 0)
            <tr class="tax">
                <td>Tax:</td>
                <td class="text-right">${{ number_format($invoice->tax_amount, 2) }}</td>
            </tr>
            @endif
            <tr class="total">
                <td>Total:</td>
                <td class="text-right">${{ number_format($invoice->total, 2) }}</td>
            </tr>
        </table>
    </div>

    @if($invoice->notes)
    <div class="notes">
        <h3>Notes</h3>
        <p>{{ $invoice->notes }}</p>
    </div>
    @endif

    <div class="footer">
        <p>Thank you for your business!</p>
        <p>{{ config('app.name') }} - Generated on {{ now()->format('F j, Y') }}</p>
    </div>
</body>
</html>
