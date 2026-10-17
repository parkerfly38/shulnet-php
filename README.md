# ShulNET 2.0

A modern synagogue management system built with Laravel and React.

## Overview

ShulNET is a comprehensive web application designed to help synagogues manage their members, religious school, events, yahrzeits, finances, leadership, communications, cemetery and ritual life in one place. It features a clean, modern interface, Hebrew calendar integration, an English/Spanish/Hebrew (RTL) interface, REST APIs for mobile apps and WordPress, and an AI assistant for administrators.

This is a replacement for the previous open source solution based on Zenbership.  It is a complete ground-up rewrite designed to use best of breed, contemporary technology that is approachable for small organizations to maintain and extend.

## Features

### Member Management
- Complete member profiles with personal and contact information
- Jewish/Hebrew details (Hebrew names, tribe, B'nai Mitzvah dates)
- Membership period tracking with invoice linking
- Role-based access control (Admin, Office, Member, Guest)
- Member types: Member, Contact, Prospect, Former Member
- **Member Onboarding Workflow** - Step-by-step wizard for onboarding new members with membership tier selection and automatic invoice generation
- **Family Relationships** - Link related members (spouses, children, etc.)
- **Notes and Member Care Alerts** - Notes on member records, with care alerts (Hospitalized, Mourning, Immediate Follow-Up, Other Emergency) surfaced on the dashboard
- **Excel Import** - Bulk import members from a downloadable template

### Member Portal
- Personal dashboard, profile editing and linked students
- View and pay invoices online
- View yahrzeits and request changes
- Register for events
- Request or volunteer for rides to services
- View their committees, boards, meetings and reports

### School Management
- **Student Management** - Complete student profiles with parent/guardian linking
- **School Tuition Tiers** - Configurable tuition pricing (Full, Multi-Child Discount, Scholarships, Payment Plans)
- **Student Onboarding Workflow** - Multi-step wizard to:
  - Add multiple students at once
  - Link to existing parents or create new parent records
  - Convert members to parents automatically
  - Select tuition tiers with quantity-based pricing
  - Generate invoices for tuition payments
- **Academics** - Class definitions, subjects, teachers, exams and grades (class, subject and exam)
- **Attendance** - Attendance records by class and student
- **School API** - Token-authenticated API for teacher and parent mobile apps (see [MOBILE_SCHOOL_API.md](MOBILE_SCHOOL_API.md))

### Event Management
- Multiple calendars (public or members-only) and event creation
- Event RSVP tracking with Excel export
- Ticket type management
- Event policies and permissions
- **Zoom Integration** - Automatic Zoom meeting creation and registration for events and meetings (see [ZOOM_INTEGRATION.md](ZOOM_INTEGRATION.md))

### Committee and Board Management
- **Committee Management** - Create and manage synagogue committees
- **Board Management** - Track board of directors and governance
- **Member Terms** - Assign members to committees/boards with titles and term dates
- **Meeting Management** - Schedule meetings with agendas, Zoom links, and email invitations
- **Meeting Minutes** - Attach minutes to meetings after they occur
- **Reports** - Create and publish committee and board reports with date and content
- **Member Portal** - Members can view their committees/boards, upcoming meetings, and reports
- **Leadership Dashboard** - Executive overview with metrics, upcoming meetings, term expirations, and monthly reports

### Yahrzeit Tracking
- Hebrew calendar integration
- Yahrzeit date management
- Hebrew month filtering and monthly yahrzeit lists
- Automatic date conversions
- Excel import and export

### Ritual Life (Gabbai)
- **Honors Scheduling** - Assign members to aliyot and other honors by service date, with annual or triennial Torah reading cycle support
- **Anniversaries and B'nai Mitzvah** - Upcoming wedding anniversaries and B'nai Mitzvah anniversaries for a date range
- **Aliyah Pledges** - Unpaid aliyah pledges from invoice line items

### Rides to Services
- Members request rides to services with pickup location and passenger count
- Volunteer drivers claim open requests from the member portal

### Cemetery Management
- **Gravesites** - Cemetery, section, row and plot, status, dimensions, GPS coordinates, perpetual care and monument inscriptions
- **Deeds** - Plot ownership records linked to members
- **Interments** - Burial records with Hebrew name, dates, funeral home and officiating rabbi

### Financial Management
- Invoice creation and tracking
- Invoice items and line-by-line details
- Invoice aging reports
- Membership period billing
- **Automated dues billing** - Nightly generation of membership dues invoices on anniversary or fixed-date schedules (see [MEMBERSHIP_BILLING_README.md](MEMBERSHIP_BILLING_README.md))
- **Automated invoice generation** from onboarding workflows
- **Online payments** - Members pay invoices through Stripe, PayPal or Authorize.Net (selected in Settings)
- **Print functionality** for invoices (index and edit pages)
- **Email invoices** with PDF attachments
- **Chart of Accounts and GL Batch Export** - Map revenue to GL accounts and export batches for your accounting system (see [GL_BATCH_EXPORT_README.md](GL_BATCH_EXPORT_README.md))
- **Financial Reports** - Income summary, outstanding balances, aging, revenue by source, member growth, tuition revenue, payment methods, event revenue and budget vs. actual
- **Exports** - Members, invoices, students, financial summaries and yahrzeits

### AI Assistant
- Chat widget for administrators that answers questions from live data ("Who has a yahrzeit this week?", "Which families owe more than $500?")
- 11 read-only tools covering members, yahrzeits, events, RSVPs, students, invoices, financial reports and the Hebrew calendar
- OpenAI by default via the Laravel AI SDK; Ollama, Anthropic, Gemini and other providers are a configuration change
- Admin role enforced on the route and on every tool call; conversations persist for 30 days
- See [AI_ASSISTANT.md](AI_ASSISTANT.md)

### Content Management (HTML Publisher)
- **HTML Page Management** - Create and publish web pages with rich text editor
- **Template System** - Reusable templates with headers, footers, and custom CSS
- **Asset Library** - Upload and manage images and files with metadata
- **Multi-Storage Support** - Local, S3, CloudFlare R2, or Azure Blob storage
- **SEO Optimization** - Meta descriptions, keywords, and custom slugs
- **Publishing Workflow** - Draft and published states with scheduling
- **Navigation Management** - Control which pages appear in site navigation

### Email Campaign Management
- **Campaign Creation** - Manage multiple email campaigns and newsletters
- **Subscriber Management** - Member subscription tracking with opt-in/opt-out
- **Double Opt-in Support** - Confirmation emails for verified subscriptions
- **Campaign Emails** - Send newsletters and announcements to subscribers
- **Bulk Operations** - Subscribe multiple members at once
- **Email Templates** - Reusable templates with variable substitution
- **Compliance** - CAN-SPAM and GDPR-ready features

### Banners and Push Notifications
- Site and app banners targeted by audience, with start and end dates
- Optional push notifications to mobile apps through Firebase Cloud Messaging
- Public banner feed for the WordPress plugin (see [BANNER_SYSTEM_README.md](BANNER_SYSTEM_README.md) and [FIREBASE_IMPLEMENTATION.md](FIREBASE_IMPLEMENTATION.md))

### Forms and PDF Templates
- **Forms** - Build forms, preview them, accept public submissions and review responses
- **PDF Templates** - HTML templates with merge fields for generating letters and documents as PDFs

### Integrations and APIs
- **REST API** - Sanctum token API for admin, member and school mobile apps (see [REACT_NATIVE_API.md](REACT_NATIVE_API.md)), with OpenAPI docs generated by Scramble
- **API Tokens** - Admins issue and revoke tokens at `/admin/api-tokens`
- **WordPress Plugin** - Shows ShulNET banners on a WordPress site by auto-display, shortcode or widget (see [wordpress-plugin/README.md](wordpress-plugin/README.md))

### Platform
- **Multilingual** - English, Spanish and Hebrew with right-to-left layout
- **Two-factor authentication** for user accounts
- **Role switching** - Users with several roles switch between them without signing out
- **Global search** across the admin area

### Dashboard
- Members joined trend analysis (line chart)
- Current Hebrew month yahrzeits
- Upcoming events preview
- Open invoices by aging (0-30, 31-60, 61-90, 90+ days)
- Member care alerts
- **Quick action workflows** - One-click access to member and student onboarding

## Tech Stack

### Backend
- **Laravel 13.x** - PHP framework, version 12.x prior to October 2026
- **Inertia.js** - Server-side rendering for React
- **SQLite** - Database (configurable for MySQL/PostgreSQL)
- **Fortify** - Authentication, including two-factor
- **Sanctum** - API tokens for mobile apps and integrations
- **Laravel AI SDK** - AI assistant agent and tools
- **Scramble** - OpenAPI documentation
- **DomPDF** and **Laravel Excel** - PDF generation, imports and exports

### Frontend
- **React 19.x** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4.x** - Styling
- **Recharts** - Data visualization
- **Radix UI** - Accessible components

## Installation

### Prerequisites
- PHP 8.4.1 or higher (required by Laravel 13)
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
   - Sample committees and boards with members
   - HTML templates, pages, and assets (for content management demo)

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

### Internationalization (i18n) and RTL

The UI supports English (`en`), Spanish (`es`) and Hebrew (`he`, right-to-left).

- **Translations** live in `lang/{locale}.json`. Keys are the English strings; missing keys fall back to English.
- **In React**, use the hook:
  ```tsx
  const { t } = useTranslation(); // resources/js/hooks/use-translation.ts
  <Button>{t('Save')}</Button>
  <p>{t('Hello, :name', { name: user.name })}</p>
  ```
- **Locale resolution** (`SetLocale` middleware): the user's saved `users.locale`, then the `locale` cookie, then the app default.
- **Switching language**: the `LanguageSwitcher` component (auth screens and sidebar) PATCHes `/settings/locale`.
- **RTL**: `<html dir>` is set from the locale and Radix `DirectionProvider` is configured. Use Tailwind logical classes (`ms-`, `me-`, `ps-`, `pe-`, `text-start`, `start-`, `end-`) instead of `ml-`/`mr-`/`left-`/`right-`.
- **Adding a language**: add its code to `supported_locales` in `config/app.php`, create `lang/xx.json`, and add its label to the language switcher.
- Spanish and Hebrew translations are a first draft and should be reviewed by native speakers. The Hebrew *calendar* features are independent of the UI language.

## Deployment

### TinyMCE Installation

TinyMCE is excluded from the repository (listed in `.gitignore`) and must be installed during deployment.

**Copy TinyMCE files to the public directory:**

```bash
# After running npm install, copy TinyMCE to public directory
cp -r node_modules/tinymce public/
```

This copies the complete TinyMCE library (version 8.6.0) to `public/tinymce/`, which is required by the Rich Text Editor component at `/tinymce/tinymce.min.js`.

**Deployment Checklist:**
1. Run `npm install` to install all dependencies
2. Copy TinyMCE: `cp -r node_modules/tinymce public/`
3. Build assets: `npm run build`
4. Clear caches: `php artisan optimize:clear`
5. Run migrations: `php artisan migrate --force`

### Production Build

When deploying to production:

```bash
# Install dependencies
composer install --no-dev --optimize-autoloader
npm install

# Copy TinyMCE to public directory
cp -r node_modules/tinymce public/

# Build frontend assets
npm run build

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Project Structure

```
app/
├── Actions/          # Reusable queries shared by controllers and AI tools (Fortify actions too)
├── Ai/
│   ├── Agents/       # AdminAssistant agent
│   └── Tools/        # Read-only tools the assistant can call
├── Console/
│   └── Commands/     # Scheduled commands (dues, push notifications, AI pruning)
├── Enums/            # Enum definitions (UserRole, MemberCareAlert)
├── Http/
│   ├── Controllers/  # Application controllers
│   │   ├── Member/   # Member-facing controllers
│   ├── Middleware/   # Custom middleware
│   └── Requests/     # Form requests
├── Mail/             # Mailable classes
│   ├── InvoiceMail.php
│   └── MeetingInvitationMail.php
├── Models/           # Eloquent models
│   ├── Member.php
│   ├── Student.php
│   ├── ParentModel.php
│   ├── Committee.php
│   ├── Board.php
│   ├── Meeting.php
│   ├── Report.php
│   ├── MembershipTier.php
│   ├── SchoolTuitionTier.php
│   ├── HtmlPage.php
│   ├── HtmlTemplate.php
│   ├── HtmlAsset.php
│   ├── Invoice.php
│   └── ...
├── Policies/         # Authorization policies
├── Services/         # Business logic services
│   ├── HebrewCalendarService.php
│   ├── FinancialReportService.php
│   ├── MembershipBillingService.php
│   ├── PaymentService.php        # Stripe, PayPal and Authorize.Net gateways
│   ├── FirebaseService.php
│   ├── ZoomService.php
│   └── SettingsService.php
└── Traits/           # Reusable traits

resources/
├── css/              # Stylesheets
├── js/
│   ├── components/   # React components
│   │   └── ui/       # shadcn/ui components
│   ├── layouts/      # Layout components
│   ├── ├── html-publisher/
│   │   │   ├── pages/
│   │   │   ├── templates/
│   │   │   └── assets/
│   │   pages/        # Inertia pages
│   │   ├── dashboard.tsx
│   │   ├── members/
│   │   ├── invoices/
│   │   ├── member/   # Member-facing pages
│   │   │   ├── committees/
│   │   │   └── boards/
│   │   └── admin/
│   │       ├── committees/
│   │       ├── boards/
│   │       ├── meetings/
│   │       ├── reports/
│   │       ├── leadership/
│   │       ├── membership-tiers/
│   │       └── school-tuition-tiers/
│   └── types/        # TypeScript definitions
└── views/            # Blade templates
    └── emails/       # Email templates
        ├── invoice.blade.php
        └── meeting-invitation.blade.php

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

### Content Management System

The HTML Publisher provides a complete content management system for creating and publishing web pages:

**Page Management:**
- Rich text editor with full formatting capabilities
- SEO-friendly URLs with customizable slugs
- Meta descriptions and keywords for search optimization
- Draft and published states with publication scheduling
- Navigation menu integration (show/hide pages)
- Sort order control for menu placement
- Per-page header/footer overrides

**Template System:**
- Create reusable templates with headers and footers
- Custom CSS per template
- Template inheritance - pages can use templates or standalone content
- Track template usage across pages
- Visual template preview

**Asset Library:**
- Upload images and files with drag-and-drop support
- Automatic image dimension detection
- Alt text for accessibility
- Multiple storage provider support:
  - Local storage (default)
  - Amazon S3
  - CloudFlare R2
  - Azure Blob Storage
- Asset metadata tracking (file size, MIME type, dimensions)
- Copy-to-clipboard for easy insertion into pages

**Use Cases:**
- Public-facing website pages
- Community newsletters and announcements
- Event landing pages
- Educational content and resources
- Board meeting minutes and documents

Access the HTML Publisher at `/admin/html-pages` in the application.

### Committee and Board Management

The system provides comprehensive tools for managing synagogue committees and the board of directors:

**Committee and Board Structure:**
- Create and manage multiple committees (e.g., Ritual, Education, Social Action)
- Track board of directors with descriptions and responsibilities
- Add members to committees/boards with specific titles and term dates
- Term tracking with start and end dates for accountability
- Active member counts and roster management

**Meeting Management:**
- Schedule meetings with date, time, and agenda
- Add virtual meeting links (Zoom, Teams, etc.)
- Email automatic meeting invitations to all committee/board members
- Attach minutes after meetings for record-keeping
- Track upcoming and past meetings
- View meeting history with searchable records

**Reports System:**
- Create committee and board reports with title, date, and rich content
- Publish monthly reports and activity summaries
- Track report history for transparency
- View all reports by committee or board

**Member Portal:**
- Members can view "My Committees" and "My Boards"
- Access to upcoming meeting schedules
- View other committee/board members with contact information
- Read published reports and minutes
- Stay informed about committee activities

**Leadership Dashboard:**
- Executive overview at `/admin/leadership`
- Real-time statistics:
  - Total committees and boards with member counts
  - Upcoming meetings in next 30 days
  - Terms expiring in next 60 days
- Upcoming and recent meeting lists
- Term expiration tracking with color-coded urgency:
  - Red: Terms ending within 14 days
  - Yellow: Terms ending within 30 days
  - Gray: Terms ending within 60 days
- Monthly report summaries
- Quick access to committee and board management

**Use Cases:**
- Board of Directors governance
- Committee roster management
- Meeting coordination and documentation
- Term rotation tracking
- Organizational transparency
- Member engagement and participation

Access committee management at `/admin/committees` and board management at `/admin/boards`.

## Documentation

**User guide:** step-by-step documentation for administrators, office staff and members is served by the app at `/user-docs/` (linked as "Documentation" in the sidebar). The source is in [public/user-docs](public/user-docs/index.html).

**Developer guides** in this repository:

- **[AI Assistant](AI_ASSISTANT.md)** - Admin assistant, tools, providers and conversation retention
- **[Roles and Permissions](ROLES_README.md)** - Developer guide to the role system
- **[Committees and Boards](COMMITTEES_BOARDS_README.md)** - Committees, boards, meetings, minutes and reports
- **[Membership Billing](MEMBERSHIP_BILLING_README.md)** and **[Quickstart](MEMBERSHIP_BILLING_QUICKSTART.md)** - Automated dues generation
- **[GL Batch Export](GL_BATCH_EXPORT_README.md)** - Chart of accounts and accounting exports
- **[Banner System](BANNER_SYSTEM_README.md)** - Banners and push notifications
- **[Firebase](FIREBASE_IMPLEMENTATION.md)** - Push notification setup
- **[Zoom Integration](ZOOM_INTEGRATION.md)** - Zoom meetings for events and committee meetings
- **[HTML Publisher Seeded Content](HTML_PUBLISHER_SEEDED_CONTENT.md)** - Demo pages, templates and assets
- **[Mobile API](REACT_NATIVE_API.md)** - REST API for React Native and other mobile apps
- **[Mobile School API](MOBILE_SCHOOL_API.md)** - Teacher and parent app endpoints
- **[WordPress Plugin](wordpress-plugin/README.md)** - Showing ShulNET banners on WordPress

Interactive API documentation is generated by Scramble at `/docs/api`.

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

### AI Assistant

The assistant uses the provider named by `AI_PROVIDER` (OpenAI when unset). Providers are defined in `config/ai.php`.

```env
# OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...

# Or a local Ollama model, keeping data on your own server
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:12b
```

See [AI_ASSISTANT.md](AI_ASSISTANT.md) for details.

### Payments, Zoom and Push Notifications

Each integration is optional and configured in `.env` (keys are read in `config/services.php`):

```env
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_SECRET=
PAYPAL_MODE=sandbox
AUTHORIZE_NET_API_LOGIN_ID=
AUTHORIZE_NET_TRANSACTION_KEY=
AUTHORIZE_NET_ENVIRONMENT=sandbox

ZOOM_ACCOUNT_ID=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=

FIREBASE_CREDENTIALS=/storage/firebase/firebase-credentials.json
```

Choose the active payment processor in Settings (`/admin/settings`).

### Scheduled Jobs

Recurring tasks are defined in `routes/console.php` and run by Laravel's scheduler. The scheduler does nothing on its own: your server must invoke `php artisan schedule:run` **every minute**.

| Command | Schedule | Purpose |
|---------|----------|---------|
| `banners:send-push-notifications` | Every 15 minutes | Sends push notifications for pending banners |
| `membership:generate-dues` | Daily at 01:00 | Generates membership dues invoices based on billing settings (anniversary or fixed date) |
| `ai:prune-conversations --days=30` | Daily at 02:00 | Deletes admin assistant conversations inactive for more than 30 days |

Times use the application timezone (`APP_TIMEZONE`).

**Enable the scheduler** with a single cron entry on the server:

```bash
* * * * * cd /path/to/shulnet-php && php artisan schedule:run >> /dev/null 2>&1
```

For local development you can run `php artisan schedule:work` instead. The bundled Docker image runs the scheduler for you: supervisor starts a `laravel-scheduler` program (`schedule:work`) alongside PHP-FPM, nginx and the queue worker, so no host cron entry is needed. If you run multiple container replicas, run the scheduler on only one of them (or use `->onOneServer()` with a shared cache) to avoid duplicate runs.

**Useful commands:**

```bash
php artisan schedule:list                          # Show all scheduled tasks and next run times
php artisan schedule:test                          # Pick a scheduled task and run it now
php artisan membership:generate-dues --dry-run     # Preview dues invoices without creating them
php artisan membership:generate-dues --date=2026-09-01   # Check renewals as of a given date
php artisan membership:generate-dues --force       # Generate even if auto-generation is disabled
php artisan ai:prune-conversations --days=14       # Prune with a different retention window
```

**Changing a schedule or retention window:** edit the `Schedule::command(...)` entries in `routes/console.php`. For example, change `--days=30` there to keep assistant conversations for a different period. The assistant widget also ignores conversations older than 30 days when restoring history, which is set in `AdminChatController::show`.

### Asset Storage

Configure asset storage for the HTML Publisher in `.env`:

```env
# Local Storage (default)
FILESYSTEM_DISK=public

# Amazon S3
AWS_ACCESS_KEY_ID=your-key-id
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket-name

# CloudFlare R2
# Use S3-compatible configuration with R2 endpoint

# Azure Blob Storage
AZURE_STORAGE_NAME=your-storage-account
AZURE_STORAGE_KEY=your-storage-key
AZURE_STORAGE_CONTAINER=your-container-name
```

Set the active storage provider in Settings (`/admin/settings`) under "Asset Storage Provider".

## Testing

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/AdminChatTest.php

# Run with coverage
php artisan test --coverage
```

## Docker

Release images are available here:
https://hub.docker.com/repository/docker/parkerfly38/shulnet-php/general

```bash
docker pull parkerfly38/shulnet-php:latest
```

### Supply Chain Attestations

All Docker images are built with supply chain attestations for enhanced security and transparency:

- **🔐 Provenance Attestation** - Cryptographic proof of how, when, and where the image was built
- **📦 SBOM (Software Bill of Materials)** - Complete inventory of all software components and dependencies
- **🎯 GitHub Artifact Attestations** - Traceability from source code to deployment

**Benefits:**
- Verify image integrity and authenticity
- Track vulnerabilities across all dependencies
- Meet compliance requirements (SLSA, SSDF, SOC 2)
- Complete transparency into what's inside each image

**View Attestations:**
```bash
# View provenance
docker buildx imagetools inspect <imagename> --format '{{ json .Provenance }}'

# View SBOM
docker buildx imagetools inspect <imagename> --format '{{ json .SBOM }}'
```

**Build Locally:**
```bash
# Single platform, loaded to Docker
docker build -t shulnet-php:local .

# With provenance and SBOM attestations
docker buildx build --provenance=true --sbom=true -t shulnet-php:local --load .
```

The image runs PHP-FPM, nginx, the queue worker and the scheduler under supervisor.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

This project is released under the MIT License.

Copyright (c) 2026 Cove Brook Coders, LLC / Brian Kresge

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Support

For issues and questions, please contact the development team.
