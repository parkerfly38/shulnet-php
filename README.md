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

### Content Management (HTML Publisher)
- **HTML Page Management** - Create and publish web pages with rich text editor
- **Template System** - Reusable templates with headers, footers, and custom CSS
- **Asset Library** - Upload and manage images and files with metadata
- **Multi-Storage Support** - Local, S3, CloudFlare R2, or Azure Blob storage
- **SEO Optimization** - Meta descriptions, keywords, and custom slugs
- **Publishing Workflow** - Draft and published states with scheduling
- **Navigation Management** - Control which pages appear in site navigation

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

## Project Structure

```
app/
├── Actions/          # Custom actions (Fortify, etc.)
├── Enums/            # Enum definitions (UserRole)
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

This project is released under the MIT License.

Copyright (c) 2026 Cove Brook Coders, LLC / Brian Kresge

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Support

For issues and questions, please contact the development team.
