# Committee and Board Management

Complete guide to managing committees, boards, meetings, and reports in ShulNET.

## Overview

ShulNET provides comprehensive tools for managing synagogue committees and the board of directors. The system supports the full lifecycle of committee and board operations including member management, meeting coordination, minute-taking, and report publishing.

## Table of Contents

- [Committees and Boards](#committees-and-boards)
- [Member Management](#member-management)
- [Meeting Management](#meeting-management)
- [Reports](#reports)
- [Member Portal](#member-portal)
- [Leadership Dashboard](#leadership-dashboard)
- [Database Structure](#database-structure)
- [API Routes](#api-routes)

## Committees and Boards

### Creating Committees

Navigate to `/admin/committees` to manage all committees.

**Fields:**
- **Name** (required) - Committee name (e.g., "Ritual Committee", "Education Committee")
- **Description** - Detailed description of the committee's purpose and responsibilities

**Examples:**
- Ritual Committee - Oversees religious services and lifecycle events
- Education Committee - Manages educational programs and curriculum
- Social Action Committee - Coordinates community service and social justice initiatives
- Finance Committee - Oversees budget and financial planning

### Creating Boards

Navigate to `/admin/boards` to manage boards (typically the Board of Directors).

**Fields:**
- **Name** (required) - Board name (e.g., "Board of Directors")
- **Description** - Detailed description of the board's responsibilities

**Example:**
- Board of Directors - Provides governance and strategic direction for the congregation

### Managing Committees and Boards

From the committee or board detail page, you can:
- View all members with their titles and terms
- Add new members
- Remove members
- Schedule meetings
- Create reports
- View meeting history

## Member Management

### Adding Members to Committees/Boards

From a committee or board detail page:

1. Click **Add Member** button
2. Select a member from the dropdown
3. Enter their **Title** (e.g., "Chair", "Vice Chair", "Secretary", "Treasurer", "Member")
4. Set **Term Start Date**
5. Set **Term End Date** (optional)
6. Click **Add Member**

**Validation:**
- A member cannot be added to the same committee/board twice
- Term end date must be on or after the term start date
- All fields except term end date are required

### Member Titles

Common titles for committees and boards:
- **Chair/President** - Leads the committee/board
- **Vice Chair/Vice President** - Assists the chair
- **Secretary** - Takes minutes and manages records
- **Treasurer** - Manages finances (for boards)
- **Member** - General committee/board member
- **Ex-Officio** - Non-voting advisory member

### Term Tracking

Member terms are tracked with start and end dates:
- **Active terms** - Current members with no end date or future end date
- **Expiring terms** - Members whose terms are ending soon (tracked in leadership dashboard)
- **Past terms** - Members whose terms have ended (historical record)

### Removing Members

To remove a member from a committee/board:
1. Find the member in the members list
2. Click **Remove** button
3. Confirm the removal

This preserves the historical record while removing active membership.

## Meeting Management

### Creating Meetings

Meetings are polymorphic and can be attached to either committees or boards.

Navigate to `/admin/meetings/{type}/{id}` where:
- `{type}` is either `committee` or `board`
- `{id}` is the committee or board ID

**Meeting Fields:**
- **Title** (required) - Meeting name (e.g., "Monthly Board Meeting", "Committee Planning Session")
- **Meeting Date** (required) - Date and time of the meeting
- **Agenda** - Meeting agenda or topics to discuss
- **Meeting Link** - Virtual meeting link (Zoom, Teams, Google Meet, etc.)
- **Minutes** - Meeting minutes (can be added later)

### Scheduling Meetings

1. From committee/board detail page, click **Schedule Meeting**
2. Fill in meeting details
3. Click **Create Meeting**
4. Optionally click **Send Invitations** to email all members

### Email Invitations

After creating a meeting, you can send email invitations to all committee/board members:

1. From the meeting detail page, click **Send Invitations**
2. An email will be sent to each member containing:
   - Meeting title
   - Date and time
   - Agenda
   - Meeting link (if provided)
   - Committee/board name

**Email Template:**
The email uses `resources/views/emails/meeting-invitation.blade.php`

### Adding Meeting Minutes

Minutes can be added after a meeting has occurred:

1. Navigate to the meeting detail page
2. Click **Edit Meeting**
3. Add minutes in the **Minutes** field
4. Save the meeting

Minutes support rich text and can include:
- Attendees
- Discussion points
- Decisions made
- Action items

### Viewing Meetings

**Upcoming Meetings:**
- Listed on committee/board detail pages
- Shown on leadership dashboard
- Displayed in member portal

**Past Meetings:**
- Archived meetings with minutes
- Searchable history
- Accessible from meeting list

## Reports

### Creating Reports

Reports can be created for committees or boards to document activities, findings, or updates.

Navigate to `/admin/reports/{type}/{id}` where:
- `{type}` is either `committee` or `board`
- `{id}` is the committee or board ID

**Report Fields:**
- **Title** (required) - Report title (e.g., "Q1 Financial Report", "Annual Activities Summary")
- **Report Date** (required) - Date of the report
- **Content** (required) - Full report content (supports rich text)

### Managing Reports

From the reports list page:
- View all reports for a committee/board
- Create new reports
- Edit existing reports
- Delete reports

### Report Types

Common report types:
- **Monthly Reports** - Regular activity summaries
- **Annual Reports** - Yearly summaries
- **Financial Reports** - Budget and expense reports (for boards)
- **Project Reports** - Specific initiative updates
- **Committee Findings** - Research or investigation results

### Viewing Reports

Reports can be viewed by:
- **Administrators** - Full access to all reports
- **Committee/Board Members** - Access to their committee/board reports via member portal
- **Leadership** - Overview of recent reports in leadership dashboard

## Member Portal

Members can access their committees and boards through the member-facing portal.

### My Committees

Navigate to `/member/committees`

**Features:**
- View all committees the member belongs to
- See member's title and term dates
- Access committee details

### My Boards

Navigate to `/member/boards`

**Features:**
- View all boards the member belongs to
- See member's title and term dates
- Access board details

### Committee/Board Detail Pages

From the member portal, click on a committee or board to view:

**Upcoming Meetings:**
- Next 5 upcoming meetings
- Meeting date, time, and title
- Meeting link (if available)
- Agenda preview

**Members:**
- All current committee/board members
- Member names, titles, and contact information
- Ability to connect with other members

**Reports:**
- Recent reports (last 5)
- Report titles, dates, and previews
- Full report access

### Navigation

Member portal links are available in the sidebar under "My Involvement":
- My Committees
- My Boards

## Leadership Dashboard

The leadership dashboard provides an executive overview of all committee and board activities.

Navigate to `/admin/leadership`

### Dashboard Statistics

**Committees Card:**
- Total number of committees
- Total number of distinct committee members

**Boards Card:**
- Total number of boards
- Total number of distinct board members

**Upcoming Meetings Card:**
- Count of meetings in the next 30 days

**Expiring Terms Card:**
- Count of terms ending in the next 60 days

### Upcoming Meetings

Displays the next 30 days of scheduled meetings:
- Meeting title
- Entity name (committee or board)
- Entity type badge
- Date and time
- Link to meeting details

### Recent Meetings

Shows meetings from the past 30 days:
- Meeting title
- Entity name
- Date
- Minutes indicator (badge shows if minutes have been added)
- Link to meeting details

### Expiring Terms

Lists all committee and board member terms expiring in the next 60 days:

**Color-coded urgency:**
- 🔴 **Red (Destructive)** - Terms ending within 14 days
- 🟡 **Yellow (Default)** - Terms ending within 30 days
- ⚪ **Gray (Secondary)** - Terms ending within 60 days

**Information shown:**
- Member name
- Title
- Entity name (committee or board)
- Days until term expires

**Use case:** Proactively manage term rotations and ensure continuity

### Recent Reports

Displays reports from the current month:
- Report title
- Entity name
- Report date
- Content preview (first 200 characters)
- Link to full report

### Quick Actions

Two buttons for quick access:
- **View All Committees** - Navigate to committee management
- **View All Boards** - Navigate to board management

## Database Structure

### Tables

**committees**
- `id` - Primary key
- `name` - Committee name
- `description` - Committee description
- `timestamps` - Created/updated dates

**boards**
- `id` - Primary key
- `name` - Board name
- `description` - Board description
- `timestamps` - Created/updated dates

**committee_member** (Pivot Table)
- `id` - Primary key
- `committee_id` - Foreign key to committees
- `member_id` - Foreign key to members
- `title` - Member's title on committee
- `term_start_date` - Start of term
- `term_end_date` - End of term (nullable)
- `timestamps` - Created/updated dates

**board_member** (Pivot Table)
- `id` - Primary key
- `board_id` - Foreign key to boards
- `member_id` - Foreign key to members
- `title` - Member's title on board
- `term_start_date` - Start of term
- `term_end_date` - End of term (nullable)
- `timestamps` - Created/updated dates

**meetings** (Polymorphic)
- `id` - Primary key
- `meetable_type` - Polymorphic type (App\Models\Committee or App\Models\Board)
- `meetable_id` - Polymorphic ID
- `title` - Meeting title
- `meeting_date` - Date and time of meeting
- `agenda` - Meeting agenda (text)
- `meeting_link` - Virtual meeting link (nullable)
- `minutes` - Meeting minutes (text, nullable)
- `timestamps` - Created/updated dates

**reports** (Polymorphic)
- `id` - Primary key
- `reportable_type` - Polymorphic type (App\Models\Committee or App\Models\Board)
- `reportable_id` - Polymorphic ID
- `title` - Report title
- `report_date` - Date of report
- `content` - Report content (text)
- `timestamps` - Created/updated dates

### Relationships

**Committee/Board Models:**
```php
// Members (many-to-many with pivot data)
public function members()
{
    return $this->belongsToMany(Member::class)
        ->withPivot(['title', 'term_start_date', 'term_end_date'])
        ->withTimestamps();
}

// Meetings (polymorphic one-to-many)
public function meetings()
{
    return $this->morphMany(Meeting::class, 'meetable');
}

// Reports (polymorphic one-to-many)
public function reports()
{
    return $this->morphMany(Report::class, 'reportable');
}
```

**Member Model:**
```php
// Committees (many-to-many)
public function committees()
{
    return $this->belongsToMany(Committee::class)
        ->withPivot(['title', 'term_start_date', 'term_end_date'])
        ->withTimestamps();
}

// Boards (many-to-many)
public function boards()
{
    return $this->belongsToMany(Board::class)
        ->withPivot(['title', 'term_start_date', 'term_end_date'])
        ->withTimestamps();
}
```

## API Routes

### Admin Routes

**Committees:**
- `GET /admin/committees` - List all committees
- `GET /admin/committees/create` - Show create form
- `POST /admin/committees` - Store new committee
- `GET /admin/committees/{id}` - Show committee details
- `GET /admin/committees/{id}/edit` - Show edit form
- `PUT /admin/committees/{id}` - Update committee
- `DELETE /admin/committees/{id}` - Delete committee
- `POST /admin/committees/{id}/attach-member` - Add member
- `DELETE /admin/committees/{id}/detach-member` - Remove member

**Boards:**
- `GET /admin/boards` - List all boards
- `GET /admin/boards/create` - Show create form
- `POST /admin/boards` - Store new board
- `GET /admin/boards/{id}` - Show board details
- `GET /admin/boards/{id}/edit` - Show edit form
- `PUT /admin/boards/{id}` - Update board
- `DELETE /admin/boards/{id}` - Delete board
- `POST /admin/boards/{id}/attach-member` - Add member
- `DELETE /admin/boards/{id}/detach-member` - Remove member

**Meetings:**
- `GET /admin/meetings/{type}/{id}` - List meetings for committee/board
- `GET /admin/meetings/{type}/{id}/create` - Show create form
- `POST /admin/meetings/{type}/{id}` - Store new meeting
- `GET /admin/meetings/{meeting}` - Show meeting details
- `GET /admin/meetings/{meeting}/edit` - Show edit form
- `PUT /admin/meetings/{meeting}` - Update meeting
- `DELETE /admin/meetings/{meeting}` - Delete meeting
- `POST /admin/meetings/{meeting}/send-invitations` - Email invitations

**Reports:**
- `GET /admin/reports/{type}/{id}` - List reports for committee/board
- `GET /admin/reports/{type}/{id}/create` - Show create form
- `POST /admin/reports/{type}/{id}` - Store new report
- `GET /admin/reports/{report}` - Show report details
- `GET /admin/reports/{report}/edit` - Show edit form
- `PUT /admin/reports/{report}` - Update report
- `DELETE /admin/reports/{report}` - Delete report

**Leadership Dashboard:**
- `GET /admin/leadership` - Show leadership dashboard

### Member Routes

**My Committees:**
- `GET /member/committees` - List member's committees
- `GET /member/committees/{id}` - Show committee details (with access control)

**My Boards:**
- `GET /member/boards` - List member's boards
- `GET /member/boards/{id}` - Show board details (with access control)

## Access Control

### Admin Access

Administrators have full access to:
- Create, edit, and delete committees and boards
- Add and remove members
- Schedule and manage meetings
- Create and manage reports
- View leadership dashboard

### Member Access

Members can only access:
- Their own committees and boards
- Meetings for their committees/boards
- Reports for their committees/boards

**Access Verification:**
The system verifies membership before allowing access to committee/board details in the member portal.

## Best Practices

### Committee Management
1. **Clear Descriptions** - Write detailed committee descriptions so members understand the purpose
2. **Regular Terms** - Use consistent term lengths (e.g., 2-year terms) for planning
3. **Term Overlap** - Stagger term end dates to ensure continuity
4. **Title Consistency** - Use standard titles across committees

### Meeting Management
1. **Advance Scheduling** - Schedule meetings well in advance
2. **Send Invitations** - Always email invitations after creating meetings
3. **Add Agendas** - Include detailed agendas so members can prepare
4. **Record Minutes** - Add minutes promptly after meetings
5. **Include Links** - Provide virtual meeting links for remote participation

### Report Management
1. **Regular Reporting** - Establish reporting schedules (monthly, quarterly, annual)
2. **Consistent Format** - Use consistent report formats for easier reading
3. **Timely Publishing** - Publish reports soon after completion
4. **Comprehensive Content** - Include all relevant information and decisions

### Term Management
1. **Monitor Expirations** - Check the leadership dashboard regularly for expiring terms
2. **Advance Planning** - Begin succession planning 60-90 days before term ends
3. **Overlap Period** - Consider having new members join before old terms end
4. **Document Handoffs** - Create transition documents for outgoing members

## Email Templates

### Meeting Invitation

Template: `resources/views/emails/meeting-invitation.blade.php`

**Variables Available:**
- `$meeting->title`
- `$meeting->meeting_date`
- `$meeting->agenda`
- `$meeting->meeting_link`
- `$entityName` (committee or board name)
- `$entityType` ('committee' or 'board')

**Customization:**
Edit the blade template to customize the email format, styling, or content.

## Troubleshooting

### Members can't see their committees/boards
- Verify the member has been added to the committee/board
- Check that the term dates are valid (start date in past, end date in future or null)
- Ensure member is logged in

### Email invitations not sending
- Check mail configuration in `.env`
- Verify `MAIL_FROM_ADDRESS` is set
- Test mail with `php artisan tinker` and `Mail::raw()`

### Terms not showing as expiring
- Verify term end dates are set
- Check that term end dates are within the next 60 days
- Refresh the leadership dashboard

### Meeting link not clickable
- Ensure the link includes the protocol (https://)
- Example: `https://zoom.us/j/123456789`

## Future Enhancements

Potential features for future development:

- **Meeting Attendance Tracking** - Record who attended each meeting
- **Task Assignment** - Assign action items from meetings to members
- **Document Library** - Attach files to committees, boards, or meetings
- **Committee Calendars** - Dedicated calendar views for each committee
- **Notifications** - Email reminders for upcoming meetings and expiring terms
- **Meeting Templates** - Reusable agenda templates for recurring meetings
- **Voting** - Record votes and decisions from meetings
- **Subcommittees** - Support nested committee structures
- **Public Pages** - Optional public-facing committee pages for transparency

## Support

For questions or issues with committee and board management:
1. Check this documentation first
2. Review the code in `app/Models/Committee.php` and `app/Models/Board.php`
3. Examine the controllers in `app/Http/Controllers/`
4. Contact the development team

---

**Last Updated:** February 1, 2026
**Version:** 1.0.0
