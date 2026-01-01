<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            border-bottom: 2px solid #4F46E5;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #4F46E5;
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .info-box {
            background-color: #F3F4F6;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .info-label {
            font-weight: 600;
            color: #6B7280;
        }
        .button {
            display: inline-block;
            background-color: #4F46E5;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            color: #6B7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ config('app.name') }}</h1>
        <p>Invoice {{ $invoice->invoice_number }}</p>
    </div>

    <p>Dear {{ $member->first_name }} {{ $member->last_name }},</p>

    <p>Please find your invoice attached to this email.</p>

    <div class="info-box">
        <div class="info-row">
            <span class="info-label">Invoice Number:</span>
            <span>{{ $invoice->invoice_number }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Invoice Date:</span>
            <span>{{ $invoice->invoice_date->format('F j, Y') }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Due Date:</span>
            <span>{{ $invoice->due_date->format('F j, Y') }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Total Amount:</span>
            <span><strong>${{ number_format($invoice->total, 2) }}</strong></span>
        </div>
        <div class="info-row">
            <span class="info-label">Status:</span>
            <span style="text-transform: capitalize;">{{ $invoice->status }}</span>
        </div>
    </div>

    @if($invoice->notes)
    <div class="info-box">
        <p class="info-label">Notes:</p>
        <p>{{ $invoice->notes }}</p>
    </div>
    @endif

    <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>

    <div class="footer">
        <p>Thank you for your business!</p>
        <p>{{ config('app.name') }}</p>
    </div>
</body>
</html>
