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

### Dashboard
- Members joined trend analysis (line chart)
- Current Hebrew month yahrzeits
- Upcoming events preview
- Open invoices by aging (0-30, 31-60, 61-90, 90+ days)

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

7. **Seed the database (optional)**
   ```bash
   php artisan db:seed
   ```

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
├── Models/           # Eloquent models
├── Policies/         # Authorization policies
├── Services/         # Business logic services
└── Traits/           # Reusable traits

resources/
├── css/              # Stylesheets
├── js/
│   ├── components/   # React components
│   ├── layouts/      # Layout components
│   ├── pages/        # Inertia pages
│   └── types/        # TypeScript definitions
└── views/            # Blade templates

database/
├── factories/        # Model factories
├── migrations/       # Database migrations
└── seeders/          # Database seeders
```

## Key Features Explained

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
