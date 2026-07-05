# Membership Billing System

This system provides flexible membership dues billing with two configurable methods: anniversary-based billing and fixed-date billing.

## Features

- **Anniversary Billing**: Generate dues invoices based on each member's join date or last renewal date
- **Fixed Date Billing**: Generate dues invoices for all members on a specific date each year
- **Automated Generation**: Schedule automatic invoice generation via cron
- **Grace Period**: Configurable grace period to avoid duplicate invoices
- **Manual Triggers**: Run billing manually when needed
- **Preview Mode**: See which members are due for renewal without generating invoices

## Configuration

### Settings

All settings are stored in the `settings` table under the `membership` group:

| Setting | Description | Values |
|---------|-------------|--------|
| `membership_billing_method` | How dues are billed | `anniversary` or `fixed_date` |
| `membership_billing_fixed_month` | Month for fixed-date billing | 1-12 |
| `membership_billing_fixed_day` | Day for fixed-date billing | 1-31 |
| `membership_billing_grace_period_days` | Days before/after billing date to check | 0-365 (default: 30) |
| `membership_auto_generate_invoices` | Enable automatic generation | `true` or `false` |
| `membership_invoice_due_days` | Days until payment is due | 1-365 (default: 30) |

### Migration

Run the migration to add billing settings:

```bash
php artisan migrate
```

This will create the settings with default values:
- Billing method: `anniversary`
- Fixed date: January 1st
- Grace period: 30 days
- Auto-generate: enabled
- Invoice due: 30 days

## Usage

### Via Web Interface

Access the membership billing settings page (requires implementation of the frontend view):

```
/settings/membership-billing
```

Features:
- Update billing method and settings
- Preview members due for renewal
- Manually trigger invoice generation

### Via Artisan Commands

#### Generate Dues (Manual)

```bash
# Generate dues for today
php artisan membership:generate-dues

# Generate for a specific date
php artisan membership:generate-dues --date=2026-07-01

# Preview without creating invoices (dry run)
php artisan membership:generate-dues --dry-run

# Force generation even if auto-generate is disabled
php artisan membership:generate-dues --force
```

#### Scheduled Automatic Generation

The command is automatically scheduled to run daily at 1:00 AM (configured in `routes/console.php`):

```php
Schedule::command('membership:generate-dues')
    ->daily()
    ->at('01:00')
    ->withoutOverlapping()
    ->runInBackground();
```

Make sure your cron is configured:

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

## How It Works

### Anniversary Billing

When `membership_billing_method` is set to `anniversary`:

1. System checks each member's `lastrenewal` date (or membership period `begin_date` if no renewal)
2. Calculates anniversary date for current year
3. If today is within the grace period of the anniversary, generates invoice
4. Updates member's `lastrenewal` date
5. Creates new membership period with updated end date

**Example:**
- Member joined: 2024-03-15
- Grace period: 30 days
- Invoice generated between: 2026-02-13 and 2026-04-14
- New period: 2026-03-15 to 2027-03-14

### Fixed Date Billing

When `membership_billing_method` is set to `fixed_date`:

1. System calculates fixed billing date (e.g., January 1st)
2. Checks if today is within grace period of that date
3. If yes, generates invoices for ALL members with active memberships
4. Creates invoices with same billing date for everyone

**Example:**
- Fixed date: July 1st
- Grace period: 30 days
- Invoice generated between: June 1 and July 31
- All members billed on: 2026-07-01

### Grace Period

The grace period prevents duplicate invoices by:
- Only generating invoices when within X days of billing date
- Checking for existing invoices within the grace period
- Skipping members who already have recent invoices

## Invoice Details

Generated invoices include:

- **Invoice Number**: Auto-generated (INV-XXXXXX)
- **Status**: Draft (so you can review before sending)
- **Invoice Date**: The billing date (anniversary or fixed date)
- **Due Date**: Invoice date + configured due days (default: 30)
- **Items**: One line item for membership tier dues
- **Total**: Based on membership tier price
- **Notes**: Includes membership tier name and coverage period
- **Linked**: Invoice is linked to the membership period

## API Endpoints

### Preview Members Due for Renewal

```
GET /api/membership-billing/preview?date=2026-07-01
```

Returns JSON with members due for renewal on specified date.

### Manually Generate Invoices

```
POST /api/membership-billing/generate
{
  "date": "2026-07-01"  // optional
}
```

## Database Structure

### Related Tables

- **members**: Member information including `lastrenewal` date
- **membership_tiers**: Tier definitions with pricing and billing period
- **membership_periods**: Links members to tiers with begin/end dates and invoice
- **invoices**: Generated membership invoices
- **invoice_items**: Line items on invoices
- **settings**: Billing configuration

### Key Relationships

```
Member
  └─ has many MembershipPeriods
       ├─ belongs to MembershipTier
       └─ belongs to Invoice
            └─ has many InvoiceItems
```

## Best Practices

### Choosing a Billing Method

**Use Anniversary Billing when:**
- Members join throughout the year
- You want to spread billing workload over time
- Each member should be billed on their join anniversary
- You want individual renewal tracking

**Use Fixed Date Billing when:**
- You want all members billed on the same date (e.g., fiscal year start)
- Simpler accounting and reporting
- Easier to manage bulk billing cycles
- All memberships expire on same date

### Grace Period Configuration

- **7-14 days**: Tight window, requires running command more frequently
- **30 days** (default): Balanced approach, monthly command runs are sufficient
- **60+ days**: Wider window, more flexibility but higher chance of duplicates

### Recommended Workflow

1. **Set up billing method** in settings
2. **Test with dry-run** first:
   ```bash
   php artisan membership:generate-dues --dry-run
   ```
3. **Review the preview** in admin panel or via API
4. **Generate invoices** manually first time
5. **Enable auto-generate** once confident
6. **Monitor logs** in `storage/logs` for any errors

## Troubleshooting

### No Invoices Generated

Check:
1. `membership_auto_generate_invoices` is `true`
2. Members have active membership periods
3. Membership tiers are active (`is_active = true`)
4. Current date is within grace period of billing date
5. No recent invoices exist within grace period

### Duplicate Invoices

- Increase grace period
- Check for multiple command executions
- Verify `withoutOverlapping()` in schedule
- Review recent invoices in database

### Command Not Running Automatically

1. Verify cron is configured:
   ```bash
   crontab -l
   ```
2. Check Laravel logs in `storage/logs`
3. Run schedule manually:
   ```bash
   php artisan schedule:run
   ```
4. Verify command is registered in `routes/console.php`

## Future Enhancements

Potential additions to consider:

- Email notifications when invoices are generated
- Payment reminders for unpaid invoices
- Proration for mid-year membership changes
- Bulk invoice approval workflow
- Member self-service renewal portal
- Multiple billing cycles per year
- Tiered grace periods by membership level
- Auto-send invoices after generation

## Code Structure

### Service Layer

**`App\Services\MembershipBillingService`**
- Core business logic for dues generation
- Handles both anniversary and fixed-date billing
- Invoice creation and period management

### Console Commands

**`App\Console\Commands\GenerateMembershipDues`**
- CLI interface for manual generation
- Dry-run capability
- Date override option

### Controllers

**`App\Http\Controllers\MembershipBillingController`**
- Web interface for settings management
- Preview and manual generation endpoints
- Settings validation

### Models

**`App\Models\Setting`**
- Cached setting management
- Get/set methods with defaults

## Support

For issues or questions:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Run dry-run mode to test: `php artisan membership:generate-dues --dry-run`
3. Review database settings table
4. Check member data has required fields (`lastrenewal`, active periods, etc.)
