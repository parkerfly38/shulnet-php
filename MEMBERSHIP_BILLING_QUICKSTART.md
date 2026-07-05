# Membership Billing Setup - Quick Start

## ✅ What Was Added

We've successfully implemented a configurable membership billing system with the following components:

### 1. Database & Settings
- **Migration**: Added 6 new membership billing settings to your database
- **Settings Table**: Now includes configuration for anniversary vs. fixed-date billing
- Default billing method: **Anniversary** (bills on each member's join date)

### 2. Core Service
- **`MembershipBillingService`**: Handles all billing logic
  - Anniversary billing: Bills each member on their join/renewal date
  - Fixed-date billing: Bills all members on the same date each year
  - Grace period: Prevents duplicate invoices
  - Automatic invoice generation with linked membership periods

### 3. Console Command
- **`php artisan membership:generate-dues`**: Generate invoices on demand
  - Supports `--dry-run` to preview without creating invoices
  - Supports `--date` to check specific dates
  - Supports `--force` to override auto-generate setting
  - **Automatically scheduled** to run daily at 1:00 AM

### 4. Web Interface
- **Controller**: `MembershipBillingController` for settings management
- **Routes**: Added to `/admin` routes
  - GET `/admin/settings/membership-billing` - Settings page
  - PUT `/admin/settings/membership-billing` - Update settings
  - GET `/admin/settings/membership-billing/preview` - Preview members due
  - POST `/admin/settings/membership-billing/generate` - Manual generation
- **React Component**: `resources/js/pages/settings/membership-billing.tsx`
- **✅ Navigation**: Added "Membership Billing" link to Admin → System section in sidebar

### 5. Testing Tools
- **Seeder**: `MembershipBillingSeeder` to create demo data with staggered renewal dates
- **Documentation**: Complete README with examples and troubleshooting

---

## 🚀 Quick Start Guide

### Step 1: Review the Settings

The migration has added these settings to your database:

```
membership_billing_method = "anniversary"  (or "fixed_date")
membership_billing_fixed_month = 1         (January)
membership_billing_fixed_day = 1           (1st)
membership_billing_grace_period_days = 30  (30 days window)
membership_auto_generate_invoices = "true"
membership_invoice_due_days = 30           (30 days to pay)
```

### Step 2: Choose Your Billing Method

**Option A: Anniversary Billing** (Default)
- Each member is billed on their join date anniversary
- Spreads workload throughout the year
- Best for organizations with continuous enrollment

**Option B: Fixed Date Billing**
- All members billed on the same date (e.g., January 1st)
- Simplified accounting
- Best for organizations with fiscal year cycles

To change the method, update settings in the database or via the web interface:

```php
Setting::set('membership_billing_method', 'fixed_date');
Setting::set('membership_billing_fixed_month', '7');  // July
Setting::set('membership_billing_fixed_day', '1');    // 1st
```

### Step 3: Test with Dry Run

```bash
# See which members would get invoices today
php artisan membership:generate-dues --dry-run

# Check a specific date
php artisan membership:generate-dues --date=2026-08-01 --dry-run
```

### Step 4: Optional - Seed Demo Data

To test with sample data:

```bash
php artisan db:seed --class=MembershipBillingSeeder
```

This creates:
- 5 membership tiers (Individual, Family, Senior, Student, Lifetime)
- Sample membership periods for up to 20 members with staggered dates

### Step 5: Access the Settings (Optional)

You can configure all settings through the web interface:

**Navigation Path:**
1. Log in as an admin
2. Open the sidebar
3. Navigate to **System** section
4. Click **Membership Billing**

Or directly visit: `/admin/settings/membership-billing`

### Step 6: Generate Invoices

```bash
# Generate for real
php artisan membership:generate-dues

# Or via web interface
# Sidebar → System → Membership Billing → Click "Generate Invoices Now"
```

---

## ⚙️ Configuration Options

### Settings You Can Adjust

| Setting | Purpose | Recommended Value |
|---------|---------|-------------------|
| `membership_billing_method` | Anniversary or fixed-date | `anniversary` |
| `membership_billing_grace_period_days` | Window to check renewals | `30` days |
| `membership_auto_generate_invoices` | Enable automation | `true` |
| `membership_invoice_due_days` | Payment deadline | `30` days |

### Modify Settings

**Via Code:**
```php
use App\Models\Setting;

Setting::set('membership_billing_method', 'anniversary');
Setting::set('membership_billing_grace_period_days', '30');
Setting::clearCache();
```

**Via Database:**
```sql
UPDATE settings 
SET value = 'fixed_date' 
WHERE key = 'membership_billing_method';
```

**Via Web Interface:**
Navigate to: **Sidebar → System → Membership Billing**

---

## 📅 Scheduled Automation

The command is automatically scheduled in `routes/console.php`:

```php
Schedule::command('membership:generate-dues')
    ->daily()
    ->at('01:00')
    ->withoutOverlapping()
    ->runInBackground();
```

**Make sure your cron is configured:**

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

---

## 🧪 Testing Scenarios

### Test Anniversary Billing

1. Set billing method to `anniversary`
2. Create/find a member with `last_renewal` date around today
3. Run: `php artisan membership:generate-dues --dry-run`
4. Should show that member in the list

### Test Fixed-Date Billing

1. Set billing method to `fixed_date`
2. Set month/day to today's date (or within 30 days)
3. Run: `php artisan membership:generate-dues --dry-run`
4. Should show all members with active memberships

### Test Grace Period

1. Set grace period to 7 days
2. Check dates 8+ days away from billing date
3. Should generate no invoices
4. Check dates within 7 days
5. Should generate invoices

---

## 📊 What Gets Created

When an invoice is generated:

```
Invoice:
  - invoice_number: INV-000123
  - status: draft
  - invoice_date: [billing date]
  - due_date: [billing date + due_days]
  - member_id: [member]
  - total: [tier price]
  
InvoiceItem:
  - description: "Family Membership Dues"
  - quantity: 1
  - unit_price: 360.00
  - total: 360.00

MembershipPeriod:
  - Updated with new invoice_id
  - Updated end_date to +1 year

Member:
  - Updated last_renewal to billing date
```

---

## 🎯 Next Steps

1. **Review Settings**: Check the current configuration
   ```bash
   php artisan tinker
   >>> Setting::where('group', 'membership')->get(['key', 'value'])
   ```

2. **Test Dry Run**: See what would be generated
   ```bash
   php artisan membership:generate-dues --dry-run
   ```

3. **Customize**: Adjust settings for your organization's needs

4. **Build UI**: Complete the React frontend component if needed

5. **Add Notifications**: Consider adding email notifications when invoices are created

6. **Monitor**: Check `storage/logs/laravel.log` for any issues

---

## 📖 Full Documentation

See `MEMBERSHIP_BILLING_README.md` for:
- Complete feature list
- Detailed configuration options
- API endpoints
- Troubleshooting guide
- Code architecture
- Future enhancement ideas

---

## ❓ Common Questions

**Q: Can I change the billing date after initial setup?**
A: Yes, just update the settings. Existing invoices won't be affected, only future generations.

**Q: What happens if a member has multiple membership periods?**
A: Each active membership period is evaluated separately and can generate separate invoices.

**Q: How do I prevent duplicate invoices?**
A: The grace period setting handles this. Invoices created within the grace period won't be duplicated.

**Q: Can I run the command more than once per day?**
A: Yes, but the grace period prevents duplicates. Running multiple times is safe.

**Q: What about lifetime memberships?**
A: Lifetime memberships (billing_period = 'lifetime') are included in the check, but their end_date is set far in the future so they effectively never renew.

---

## 🆘 Support

If you encounter issues:

1. Check logs: `tail -f storage/logs/laravel.log`
2. Run dry-run: `php artisan membership:generate-dues --dry-run`
3. Verify settings: `php artisan tinker` → `Setting::get('membership_billing_method')`
4. Check member data: Ensure members have `last_renewal` dates or membership periods
5. Review the full README: `MEMBERSHIP_BILLING_README.md`

---

## ✨ Features You Can Add

Consider enhancing with:
- Email notifications when invoices are created
- Payment reminders for overdue invoices
- Member self-service renewal portal
- Proration for mid-year tier changes
- Bulk approval workflow
- Export billing reports
- Multi-year memberships
- Family member linking

---

**That's it! Your membership billing system is ready to use.**

Run the dry-run command to see it in action! 🎉
