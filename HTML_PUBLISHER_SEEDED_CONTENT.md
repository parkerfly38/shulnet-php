# HTML Publisher Seeded Content

This document describes the sample content created by the `HtmlContentSeeder`.

## Templates Created

### 1. Main Website Template
- **Purpose:** Primary template for public-facing pages
- **Features:**
  - Purple gradient header with navigation
  - Professional footer with contact info
  - Custom CSS for consistent styling
  - Used by: Welcome, About, and Contact pages

### 2. Simple Template
- **Purpose:** Minimal template for newsletters and announcements
- **Features:**
  - Simple centered header
  - Minimal footer
  - Clean, distraction-free layout
  - Used by: Newsletter pages

## Sample Assets

### 1. congregation-logo.png
- Placeholder logo asset
- 400×200px
- Alt text: "Congregation Beth Shalom Logo"

### 2. sanctuary-hero.jpg
- Placeholder hero/banner image
- 1920×1080px
- Alt text: "Beautiful sanctuary interior"

### 3. Additional placeholder asset
- Sample for testing asset management

**Note:** The actual image files are placeholder entries in the database. In production, you would upload real files through the asset management interface.

## Pages Created

### 1. Welcome Home (Published)
- **URL:** `/welcome`
- **Template:** Main Website Template
- **Status:** Published
- **Navigation:** Visible (Sort Order: 1)
- **Content:** 
  - Welcome message with hero image
  - Mission statement
  - Service times callout box
- **SEO:** Full meta description and keywords

### 2. About Our Congregation (Published)
- **URL:** `/about`
- **Template:** Main Website Template
- **Status:** Published
- **Navigation:** Visible (Sort Order: 2)
- **Content:**
  - Congregation history
  - Core values (Torah, Avodah, Gemilut Chasadim, Kehillah)
  - Leadership profiles with cards layout
- **SEO:** Optimized for search engines

### 3. Community Newsletter - January 2026 (Published)
- **URL:** `/newsletter-jan-2026`
- **Template:** Simple Template
- **Status:** Published
- **Navigation:** Hidden
- **Content:**
  - Special programs announcement
  - Upcoming events list
  - Community news and mazel tovs
  - Contact information footer
- **Published:** 5 days ago

### 4. Contact Us (Published)
- **URL:** `/contact`
- **Template:** Main Website Template
- **Status:** Published
- **Navigation:** Visible (Sort Order: 4)
- **Content:**
  - Office hours
  - Contact information (phone, email, address)
  - Staff directory
  - Visitor information
- **SEO:** Full contact page optimization

### 5. High Holy Days 2026 (Draft)
- **URL:** `/high-holy-days-2026`
- **Template:** Main Website Template
- **Status:** Draft (not published)
- **Navigation:** Hidden
- **Content:**
  - Placeholder for future High Holy Days information
  - Tentative service schedule section
  - Ticket information section
- **Purpose:** Example of draft content workflow

## How to Use This Sample Content

1. **View Pages:** Navigate to `/admin/html-pages` to see all pages
2. **Edit Content:** Click on any page to edit in the rich text editor
3. **Manage Templates:** Go to `/admin/html-templates` to modify templates
4. **Upload Assets:** Visit `/admin/html-assets` to add real images
5. **Publish Drafts:** Change the "High Holy Days 2026" page to published when ready

## Publishing Workflow Example

The seeded content demonstrates a complete publishing workflow:

1. **Draft Creation:** "High Holy Days 2026" shows how to prepare content in advance
2. **Template Usage:** Multiple pages share the same template for consistency
3. **Navigation Control:** Some pages are in nav (Welcome, About, Contact) while others are standalone (Newsletter)
4. **SEO Best Practices:** Published pages include meta descriptions and keywords
5. **Asset Integration:** The Welcome page demonstrates embedding uploaded images

## Customization Tips

- **Replace Placeholder Text:** Update "Congregation Beth Shalom" with your organization name
- **Upload Real Images:** Replace placeholder assets with actual photos
- **Adjust Colors:** Modify template CSS to match your branding
- **Add More Pages:** Create service schedules, event pages, educational resources
- **Create Custom Templates:** Design templates for different page types (events, classes, etc.)

## Storage Configuration

By default, assets use local storage. To use cloud storage:

1. Configure your preferred provider in `.env` (S3, CloudFlare R2, Azure)
2. Update the setting in `/admin/settings` under "Asset Storage Provider"
3. New uploads will automatically use the selected provider

## Next Steps

1. Review the sample content in the admin interface
2. Modify templates to match your organization's branding
3. Upload your own images and assets
4. Create additional pages as needed
5. Publish the draft content when ready
6. Share published page URLs with your community
