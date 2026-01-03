# ShulNET 2.0

A modern synagogue management system built with Laravel and React.

## Overview

ShulNET is a comprehensive web application designed to help synagogues manage their members, events, yahrzeits, invoices, and other essential operations. It features a clean, modern interface with support for Hebrew calendar integration.

This is a replacement for the previous open source solution based on Zenbership.  It is a complete ground-up rewrite designed to use best of breed, contemporary technology that is approachable for small organizations to maintain and extend.

## Features

### Member Management
- Complete member profiles with personal and contact information
- Jewish/Hebrew details (Hebrew names, tribe, B'nai Mitzvah dates)
- Membership period tracking with invoice linking
- Role-based access control (Admin, Office, Member, Guest)
- Member types: Member, Contact, Prospect, Former Member
- **Member Onboarding Workflow** - Step-by-step wizard for onboarding new members with membership tier selection and automatic invoice generation

### School Management
- **Student Management** - Complete student profiles with parent/guardian linking
- **School Tuition Tiers** - Configurable tuition pricing (Full, Multi-Child Discount, Scholarships, Payment Plans)
- **Student Onboarding Workflow** - Multi-step wizard to:
  - Add multiple students at once
  - Link to existing parents or create new parent records
  - Convert members to parents automatically
  - Select tuition tiers with quantity-based pricing
  - Generate invoices for tuition payments

### Event Management
- Calendar and event creation
- Event RSVP tracking
- Ticket type management
- Event policies and permissions

### Yahrzeit Tracking
- Hebrew calendar integration
- Yahrzeit date management
- Hebrew month filtering
- Automatic date conversions

### Financial Management
- Invoice creation and tracking
- Invoice items and line-by-line details
- Invoice aging reports
- Membership period billing
- **Automated invoice generation** from onboarding workflows
- **Print functionality** for invoices (index and edit pages)
- **Email invoices** with PDF attachments

### Dashboard
- Members joined trend analysis (line chart)
- Current Hebrew month yahrzeits
- Upcoming events preview
- Open invoices by aging (0-30, 31-60, 61-90, 90+ days)
- **Quick action workflows** - One-click access to member and student onboarding

## Tech Stack

### Backend
- **Laravel 12.x** - PHP framework
- **Inertia.js** - Server-side rendering for React
- **SQLite** - Database (configurable for MySQL/PostgreSQL)
- **Fortify** - Authentication

### Frontend
- **React 19.x** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4.x** - Styling
- **Recharts** - Data visualization
- **Radix UI** - Accessible components

## Installation

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- SQLite (or MySQL/PostgreSQL)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shulnet-php
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**
   ```bash
   npm install
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Configure database**
   
   Edit `.env` and set your database connection. For SQLite (default):
   ```env
   DB_CONNECTION=sqlite
   DB_DATABASE=/absolute/path/to/database/database.sqlite
   ```

6. **Run migrations**
   ```bash
   touch database/database.sqlite  # If using SQLite
   php artisan migrate
   ```

7. **Seed the database (optional but recommended)**
   ```bash
   php artisan db:seed
   ```
   
   This will populate:
   - Membership tiers (Individual, Family, Student, Senior, etc.)
   - School tuition tiers (Full Tuition, Discounts, Scholarships, Payment Plans)
   - Sample members and parents (for testing)

8. **Build assets**
   ```bash
   npm run build
   ```

## Development

### Running the development server

1. **Start the Laravel server**
   ```bash
   php artisan serve
   ```

2. **Start the Vite dev server** (in another terminal)
   ```bash
   npm run dev
   ```

3. **Access the application**
   
   Open your browser to `http://localhost:8000`

### Development commands

```bash
# Run tests
php artisan test

# Run type checking
npm run type-check

# Run linting
npm run lint

# Format code
npm run format
```

## Project Structure

```
app/
├── Actions/          # Custom actions (Fortify, etc.)
├── Enums/            # Enum definitions (UserRole)
├── Http/
│   ├── Controllers/  # Application controllers
│   ├── Middleware/   # Custom middleware
│   └── Requests/     # Form requests
├── Mail/             # Mailable classes (InvoiceMail)
├── Models/           # Eloquent models
│   ├── Member.php
│   ├── Student.php
│   ├── ParentModel.php
│   ├── MembershipTier.php
│   ├── SchoolTuitionTier.php
│   ├── Invoice.php
│   └── ...
├── Policies/         # Authorization policies
├── Services/         # Business logic services
│   ├── HebrewCalendarService.php
│   └── SettingsService.php
└── Traits/           # Reusable traits

resources/
├── css/              # Stylesheets
├── js/
│   ├── components/   # React components
│   │   └── ui/       # shadcn/ui components
│   ├── layouts/      # Layout components
│   ├── pages/        # Inertia pages
│   │   ├── dashboard.tsx
│   │   ├── members/
│   │   ├── invoices/
│   │   └── admin/
│   │       ├── membership-tiers/
│   │       └── school-tuition-tiers/
│   └── types/        # TypeScript definitions
└── views/            # Blade templates
    └── emails/       # Email templates

database/
├── factories/        # Model factories
├── migrations/       # Database migrations
└── seeders/          # Database seeders
    ├── MembershipTierSeeder.php
    └── SchoolTuitionTierSeeder.php
```

## Key Features Explained

### Onboarding Workflows

The dashboard provides streamlined onboarding workflows for both members and students:

**Member Onboarding (4 steps):**
1. **Member Details** - Basic information (name, email, phone, address, etc.)
2. **Additional Details** - Jewish/Hebrew information, dates, etc.
3. **Membership Tier** - Select tier with pricing and billing period
4. **Review & Invoice** - Confirm details and optionally create an invoice

**Student Onboarding (4 steps):**
1. **Student Details** - Add one or multiple students with all information
2. **Parent Selection** - Choose from existing parents, convert a member to parent, or create new parent
3. **Tuition Tier** - Select school tuition tier (Full, Multi-Child Discount, Scholarships, Payment Plans)
4. **Review & Invoice** - Confirm details and optionally create an invoice

Both workflows support:
- Automatic invoice generation with customizable dates
- Email invoice delivery with PDF attachments
- Real-time validation
- Step-by-step progress tracking

### School Tuition Tiers

Configurable tuition pricing options including:
- **Full Tuition** - $5,000/annual
- **Multi-Child Discount** - $4,000/annual
- **Scholarship Tiers** - Full, 50%, and 25% scholarships
- **Payment Plans** - Semester ($2,750) and Monthly ($500) options
- **Negotiated Tuition** - Custom pricing for special cases

Each tier includes:
- Detailed feature descriptions
- Flexible billing periods (annual, semester, monthly, custom)
- Quantity-based pricing for multiple students

### Hebrew Calendar Integration

The system includes a `HebrewCalendarService` that converts Gregorian dates to Hebrew dates using PHP's `jdtojewish()` function. This enables:
- Yahrzeit tracking by Hebrew month
- Hebrew date display throughout the application
- Accurate Hebrew calendar calculations

### Role-Based Access Control

Users are assigned roles that determine their permissions:
- **Admin** - Full system access
- **Office** - Administrative functions
- **Member** - Limited member functions
- **Guest** - Read-only access

See `app/Enums/UserRole.php` and `app/Traits/HasRoles.php` for implementation details.

### Membership Periods

Track member status over time with:
- Begin and end dates
- Membership types
- Optional invoice linking
- Active/expired status tracking

### Invoice Management

Comprehensive invoicing features:
- Multiple invoice statuses (draft, open, paid, overdue, cancelled)
- Line-item support with quantity and pricing
- Recurring invoice scheduling
- Invoice aging reports (0-30, 31-60, 61-90, 90+ days)
- Print functionality for physical copies
- Email delivery with PDF attachments
- Polymorphic relationships (invoiceable to Members or Parents)

## Configuration

### Database

The application supports multiple database drivers. Edit `.env`:

```env
# SQLite (default)
DB_CONNECTION=sqlite

# MySQL
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=shulnet
DB_USERNAME=root
DB_PASSWORD=

# PostgreSQL
DB_CONNECTION=pgsql
```

### Mail

Configure mail settings in `.env` for invoice and notification emails:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
```

## Testing

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/MemberTest.php

# Run with coverage
php artisan test --coverage
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For issues and questions, please contact the development team.
