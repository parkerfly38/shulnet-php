# GL Batch Export Feature

This feature provides General Ledger batch export functionality that allows you to export transactions with mapped Chart of Accounts for integration with accounting software like QuickBooks.

## Features

### 1. Chart of Accounts Management
- Create and manage GL account codes
- Support for 5 account types: Revenue, Expense, Asset, Liability, Equity
- Active/inactive status for accounts
- Sortable accounts for organized reporting
- Pre-seeded with common synagogue revenue accounts

### 2. GL Account Assignment
- Invoice items can be assigned to specific GL accounts
- Allows for accurate revenue categorization
- Required for GL batch exports

### 3. GL Batch Export
- Export transactions by date range
- Automatically allocates payment amounts proportionally across invoice items
- Generates Excel spreadsheet with:
  - Batch number (auto-generated or custom)
  - Transaction date
  - GL account code and name
  - Debit/credit amounts
  - Reference information (invoice number)
  - Member information
  - Payment method and transaction ID

## Installation & Setup

### 1. Run Migrations
```bash
php artisan migrate
```

This creates:
- `chart_of_accounts` table
- Adds `gl_account_id` to `invoice_items` table

### 2. Seed Default Accounts (Optional)
```bash
php artisan db:seed --class=ChartOfAccountsSeeder
```

This populates default GL accounts including:
- Membership Dues Revenue (4000)
- Hebrew School Tuition (4100)
- Donations - General (4200)
- Donations - Building Fund (4210)
- Donations - Memorial (4220)
- Event Revenue (4300)
- Cemetery Plot Sales (4400)
- Cemetery Services (4410)
- High Holiday Seats (4500)
- Religious Services Fees (4600)
- Gift Shop Sales (4700)
- Facility Rental Income (4800)
- Fundraising Revenue (4900)
- Other Income (4950)
- Accounts Receivable (1200)
- Common expense accounts for reference

## Usage

### Managing Chart of Accounts

1. Navigate to **Settings → Chart of Accounts** (or `/admin/chart-of-accounts`)
2. Click **New GL Account** to create a new account
3. Enter:
   - Account Code (e.g., 4000)
   - Account Name (e.g., Membership Dues Revenue)
   - Account Type (Revenue, Expense, Asset, Liability, or Equity)
   - Description (optional)
   - Sort Order (for organizing accounts)
   - Active status checkbox

### Assigning GL Accounts to Invoice Items

When creating or editing invoices, you can assign GL accounts to individual line items. This mapping is used during the GL batch export to categorize transactions properly.

*(Note: UI for assigning GL accounts to invoice items will need to be added to the invoice create/edit forms)*

### Exporting GL Batches

1. Navigate to **Reports → Reports & Exports** (`/admin/reports`)
2. Scroll to the **GL Batch Export** section
3. Enter:
   - **Start Date** (required)
   - **End Date** (required)
   - **Batch Number** (optional, auto-generated if not provided)
4. Click **Export GL Batch**
5. Download the Excel file

The export includes only completed payments within the date range that have invoice items with assigned GL accounts.

### Export Format

The exported Excel file contains the following columns:

| Column | Description |
|--------|-------------|
| Batch Number | Unique batch identifier |
| Transaction Date | Date payment was received |
| GL Account Code | Account code from Chart of Accounts |
| GL Account Name | Account name |
| Description | Line item description |
| Debit Amount | Debit amount (typically 0 for revenue) |
| Credit Amount | Credit amount (payment allocated to this account) |
| Reference (Invoice #) | Invoice number for reference |
| Member ID | Member identifier |
| Member Name | Member name |
| Payment Method | How payment was received |
| Transaction ID | Payment processor transaction ID |

### Proportional Allocation

When a payment is made against an invoice with multiple line items mapped to different GL accounts, the payment is automatically allocated proportionally based on each line item's amount relative to the total invoice.

**Example:**
- Invoice Total: $1,000
  - Item 1: $600 → GL 4000 (Membership Dues)
  - Item 2: $400 → GL 4100 (Tuition)
- Payment Received: $500

Allocation:
- GL 4000: $300 (60% of payment)
- GL 4100: $200 (40% of payment)

## API Endpoints

### Get Chart of Accounts
```
GET /admin/chart-of-accounts/api
```

Query parameters:
- `active_only` (boolean): Only return active accounts
- `account_type` (string): Filter by account type

### Get GL Batch Summary
```
GET /admin/gl-batch/summary?start_date=2026-01-01&end_date=2026-03-31
```

Returns summary of transactions grouped by GL account for the specified date range.

## Database Schema

### chart_of_accounts
- `id` - Primary key
- `account_code` - Unique account code (e.g., "4000")
- `account_name` - Account name
- `account_type` - Enum: asset, liability, equity, revenue, expense
- `description` - Optional description
- `is_active` - Boolean for active status
- `sort_order` - Integer for sorting
- `timestamps`

### invoice_items (updated)
- Added `gl_account_id` - Foreign key to chart_of_accounts (nullable)

## Future Enhancements

Potential improvements for future versions:

1. **Default GL Account Mapping** - Allow setting default GL accounts based on invoice item keywords or categories
2. **Batch Import** - Import GL account configurations from CSV
3. **Multi-currency Support** - Handle foreign currency transactions
4. **Expense Tracking** - Expand to include expense tracking and categorization
5. **Budget Integration** - Compare actual vs. budgeted amounts by GL account
6. **QuickBooks Direct Integration** - API integration to push batches directly to QuickBooks
7. **Audit Trail** - Track which batches have been exported and when
8. **Reconciliation Report** - Compare exported batches with bank statements

## Notes

- Only completed payments are included in GL batch exports
- Invoice items without assigned GL accounts are skipped in the export
- Batch numbers are auto-generated using the format: YYYYMMDD-HHMMSS
- The seeder uses `updateOrCreate` so it can be run multiple times safely
- GL accounts can be deactivated instead of deleted if they're in use

## Support

For questions or issues with the GL batch export feature, refer to the main ShulNET documentation or contact your system administrator.
