<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $invoice->invoice_number }} - {{ config('app.name') }}</title>
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <style>
        @media print {
            @page {
                margin: 0.5in;
            }
            .no-print {
                display: none;
            }
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .company-info h1 {
            color: #4F46E5;
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        
        .company-info p {
            margin: 2px 0;
            color: #6B7280;
        }
        
        .invoice-title {
            text-align: right;
        }
        
        .invoice-title h2 {
            margin: 0;
            font-size: 36px;
            color: #4F46E5;
        }
        
        .invoice-title p {
            margin: 5px 0;
            color: #6B7280;
        }
        
        .details-section {
            display: flex;
            justify-content: space-between;
            margin: 30px 0;
        }
        
        .bill-to, .invoice-details {
            flex: 1;
        }
        
        .bill-to {
            margin-right: 40px;
        }
        
        .section-title {
            font-weight: 600;
            color: #4F46E5;
            margin-bottom: 10px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .detail-label {
            font-weight: 600;
            color: #6B7280;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        
        .items-table thead {
            background-color: #F3F4F6;
        }
        
        .items-table th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #4B5563;
            border-bottom: 2px solid #E5E7EB;
        }
        
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #E5E7EB;
        }
        
        .items-table th:last-child,
        .items-table td:last-child {
            text-align: right;
        }
        
        .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
        }
        
        .totals {
            width: 300px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 12px;
        }
        
        .total-row.subtotal {
            color: #6B7280;
        }
        
        .total-row.tax {
            color: #6B7280;
            border-bottom: 1px solid #E5E7EB;
        }
        
        .total-row.total {
            background-color: #F3F4F6;
            font-weight: 700;
            font-size: 18px;
            color: #1F2937;
            border-top: 2px solid #4F46E5;
        }
        
        .notes-section {
            margin-top: 40px;
            padding: 20px;
            background-color: #F9FAFB;
            border-radius: 8px;
        }
        
        .notes-section h3 {
            margin: 0 0 10px 0;
            color: #4B5563;
            font-size: 16px;
        }
        
        .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 14px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-draft { background-color: #F3F4F6; color: #4B5563; }
        .status-open { background-color: #DBEAFE; color: #1E40AF; }
        .status-paid { background-color: #D1FAE5; color: #065F46; }
        .status-overdue { background-color: #FEE2E2; color: #991B1B; }
        .status-cancelled { background-color: #F3F4F6; color: #6B7280; }
        
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #4F46E5;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .print-button:hover {
            background-color: #4338CA;
        }
    </style>
</head>
<body>
    <button onclick="window.print()" class="print-button no-print">Print Invoice</button>
    
    <div class="header">
        <div class="company-info">
            <h1>{{ config('app.name') }}</h1>
            <p>{{ config('app.address', '') }}</p>
            <p>{{ config('app.phone', '') }}</p>
            <p>{{ config('app.email', '') }}</p>
        </div>
        <div class="invoice-title">
            <h2>INVOICE</h2>
            <p><strong>{{ $invoice->invoice_number }}</strong></p>
            <span class="status-badge status-{{ $invoice->status }}">{{ ucfirst($invoice->status) }}</span>
        </div>
    </div>
    
    <div class="details-section">
        <div class="bill-to">
            <div class="section-title">Bill To</div>
            @if($member)
                <div><strong>{{ $member->first_name }} {{ $member->last_name }}</strong></div>
                @if($member->email)
                    <div>{{ $member->email }}</div>
                @endif
                @if($member->phone1)
                    <div>{{ $member->phone1 }}</div>
                @endif
                @if($member->address_line_1)
                    <div>{{ $member->address_line_1 }}</div>
                    @if($member->address_line_2)
                        <div>{{ $member->address_line_2 }}</div>
                    @endif
                    <div>{{ $member->city }}, {{ $member->state }} {{ $member->zip }}</div>
                @endif
            @else
                <div>No member information available</div>
            @endif
        </div>
        
        <div class="invoice-details">
            <div class="section-title">Invoice Details</div>
            <div class="detail-row">
                <span class="detail-label">Invoice Date:</span>
                <span>{{ \Carbon\Carbon::parse($invoice->invoice_date)->format('F j, Y') }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Due Date:</span>
                <span>{{ \Carbon\Carbon::parse($invoice->due_date)->format('F j, Y') }}</span>
            </div>
            @if($invoice->recurring)
                <div class="detail-row">
                    <span class="detail-label">Recurring:</span>
                    <span>Every {{ $invoice->recurring_interval_count > 1 ? $invoice->recurring_interval_count . ' ' : '' }}{{ $invoice->recurring_interval }}</span>
                </div>
            @endif
        </div>
    </div>
    
    @if($invoice->items && count($invoice->items) > 0)
        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Unit Price</th>
                    <th style="text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->items as $item)
                    <tr>
                        <td>{{ $item->description }}</td>
                        <td style="text-align: center;">{{ $item->quantity }}</td>
                        <td style="text-align: right;">${{ number_format($item->unit_price, 2) }}</td>
                        <td style="text-align: right;">${{ number_format($item->total, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif
    
    <div class="totals-section">
        <div class="totals">
            <div class="total-row subtotal">
                <span>Subtotal:</span>
                <span>${{ number_format($invoice->subtotal, 2) }}</span>
            </div>
            <div class="total-row tax">
                <span>Tax:</span>
                <span>${{ number_format($invoice->tax_amount, 2) }}</span>
            </div>
            <div class="total-row total">
                <span>Total:</span>
                <span>${{ number_format($invoice->total, 2) }}</span>
            </div>
        </div>
    </div>
    
    @if($invoice->notes)
        <div class="notes-section">
            <h3>Notes</h3>
            <p>{{ $invoice->notes }}</p>
        </div>
    @endif
    
    <div class="footer">
        <p>Thank you for your business!</p>
        <p>If you have any questions about this invoice, please contact us.</p>
    </div>
</body>
</html>
