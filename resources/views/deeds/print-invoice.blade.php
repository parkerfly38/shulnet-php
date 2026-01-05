<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 2rem;
            max-width: 8.5in;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #333;
        }
        
        .header h1 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .header p {
            color: #666;
        }
        
        .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .info-section h2 {
            font-size: 1rem;
            margin-bottom: 0.5rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .info-section p {
            margin-bottom: 0.25rem;
        }
        
        .deed-details {
            background: #f9f9f9;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 2rem;
        }
        
        .deed-details h2 {
            font-size: 1.1rem;
            margin-bottom: 0.75rem;
            color: #333;
        }
        
        .deed-details dl {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 0.5rem 1rem;
        }
        
        .deed-details dt {
            font-weight: 600;
            color: #666;
        }
        
        .deed-details dd {
            color: #333;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2rem;
        }
        
        thead {
            background: #333;
            color: white;
        }
        
        th, td {
            padding: 0.75rem;
            text-align: left;
        }
        
        th {
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.875rem;
            letter-spacing: 0.05em;
        }
        
        tbody tr {
            border-bottom: 1px solid #ddd;
        }
        
        tbody tr:hover {
            background: #f9f9f9;
        }
        
        .text-right {
            text-align: right;
        }
        
        .totals {
            margin-left: auto;
            width: 300px;
            border-top: 2px solid #333;
            padding-top: 1rem;
        }
        
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
        }
        
        .totals-row.total {
            font-size: 1.25rem;
            font-weight: bold;
            border-top: 2px solid #333;
            padding-top: 0.75rem;
            margin-top: 0.5rem;
        }
        
        .notes {
            margin-top: 2rem;
            padding: 1rem;
            background: #f9f9f9;
            border-left: 4px solid #333;
        }
        
        .notes h3 {
            font-size: 1rem;
            margin-bottom: 0.5rem;
        }
        
        .footer {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 0.875rem;
        }
        
        .actions {
            position: fixed;
            top: 1rem;
            right: 1rem;
            display: flex;
            gap: 0.5rem;
        }
        
        .btn {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            cursor: pointer;
            font-weight: 600;
        }
        
        .btn-primary {
            background: #333;
            color: white;
        }
        
        .btn-secondary {
            background: #f3f4f6;
            color: #333;
        }
        
        .btn:hover {
            opacity: 0.9;
        }
        
        @media print {
            .actions {
                display: none;
            }
            
            body {
                padding: 0;
            }
        }
        
        .status-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .status-draft { background: #e5e7eb; color: #374151; }
        .status-open { background: #dbeafe; color: #1e40af; }
        .status-paid { background: #d1fae5; color: #065f46; }
        .status-overdue { background: #fee2e2; color: #991b1b; }
        .status-cancelled { background: #f3f4f6; color: #6b7280; }
    </style>
</head>
<body>
    <div class="actions">
        <button class="btn btn-primary" onclick="window.print()">Print</button>
        <button class="btn btn-secondary" onclick="window.close()">Close</button>
    </div>

    <div class="header">
        <h1>INVOICE</h1>
        <p>{{ config('app.name') }}</p>
    </div>

    <div class="invoice-info">
        <div class="info-section">
            <h2>Bill To</h2>
            @if($invoice->member)
                <p><strong>{{ $invoice->member->first_name }} {{ $invoice->member->last_name }}</strong></p>
                @if($invoice->member->email)
                    <p>{{ $invoice->member->email }}</p>
                @endif
                @if($invoice->member->phone)
                    <p>{{ $invoice->member->phone }}</p>
                @endif
                @if($invoice->member->street_address)
                    <p>{{ $invoice->member->street_address }}</p>
                    @if($invoice->member->city || $invoice->member->state || $invoice->member->zip_code)
                        <p>
                            {{ $invoice->member->city }}{{ $invoice->member->city && ($invoice->member->state || $invoice->member->zip_code) ? ',' : '' }}
                            {{ $invoice->member->state }} {{ $invoice->member->zip_code }}
                        </p>
                    @endif
                @endif
            @endif
        </div>
        
        <div class="info-section">
            <h2>Invoice Details</h2>
            <p><strong>Invoice #:</strong> {{ $invoice->invoice_number }}</p>
            <p><strong>Date:</strong> {{ $invoice->invoice_date->format('F j, Y') }}</p>
            <p><strong>Due Date:</strong> {{ $invoice->due_date->format('F j, Y') }}</p>
            <p>
                <strong>Status:</strong> 
                <span class="status-badge status-{{ $invoice->status }}">{{ ucfirst($invoice->status) }}</span>
            </p>
        </div>
    </div>

    <div class="deed-details">
        <h2>Cemetery Deed Information</h2>
        <dl>
            <dt>Deed Number:</dt>
            <dd>{{ $deed->deed_number }}</dd>
            
            <dt>Plot Location:</dt>
            <dd>{{ $deed->plot_location }}</dd>
            
            @if($deed->section)
                <dt>Section:</dt>
                <dd>{{ $deed->section }}</dd>
            @endif
            
            @if($deed->row)
                <dt>Row:</dt>
                <dd>{{ $deed->row }}</dd>
            @endif
            
            <dt>Plot Number:</dt>
            <dd>{{ $deed->plot_number }}</dd>
            
            <dt>Plot Type:</dt>
            <dd>{{ ucfirst($deed->plot_type) }}</dd>
            
            <dt>Capacity:</dt>
            <dd>{{ $deed->capacity }} {{ $deed->capacity == 1 ? 'plot' : 'plots' }}</dd>
            
            <dt>Purchase Date:</dt>
            <dd>{{ $deed->purchase_date->format('F j, Y') }}</dd>
        </dl>
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th class="text-right">Quantity</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->items as $item)
                <tr>
                    <td>{{ $item->description }}</td>
                    <td class="text-right">{{ $item->quantity }}</td>
                    <td class="text-right">${{ number_format($item->unit_price, 2) }}</td>
                    <td class="text-right">${{ number_format($item->total, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-row">
            <span>Subtotal:</span>
            <span>${{ number_format($invoice->subtotal, 2) }}</span>
        </div>
        @if($invoice->tax_amount > 0)
            <div class="totals-row">
                <span>Tax:</span>
                <span>${{ number_format($invoice->tax_amount, 2) }}</span>
            </div>
        @endif
        <div class="totals-row total">
            <span>Total:</span>
            <span>${{ number_format($invoice->total, 2) }}</span>
        </div>
    </div>

    @if($invoice->notes)
        <div class="notes">
            <h3>Notes</h3>
            <p>{{ $invoice->notes }}</p>
        </div>
    @endif

    <div class="footer">
        <p>Thank you for your business</p>
        <p>{{ config('app.name') }}</p>
    </div>
</body>
</html>
