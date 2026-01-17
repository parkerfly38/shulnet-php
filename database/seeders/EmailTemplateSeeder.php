<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Welcome Message',
                'description' => 'Welcome new subscribers to your community',
                'subject' => 'Welcome to Our Community!',
                'content' => '<p>Dear {member_name},</p>

<p>Thank you for subscribing to our newsletter! We\'re excited to have you as part of our community.</p>

<p>You can expect to receive updates about:</p>
<ul>
  <li>Upcoming events and programs</li>
  <li>Community news and announcements</li>
  <li>Special opportunities and initiatives</li>
</ul>

<p>We look forward to staying connected with you.</p>

<p>Warm regards,<br>
The Team</p>',
            ],
            [
                'name' => 'General Announcement',
                'description' => 'Share important news and updates',
                'subject' => 'Important Update',
                'content' => '<p>Dear {member_name},</p>

<p>We wanted to share some important news with you.</p>

<p>[Your announcement details here]</p>

<p>If you have any questions, please don\'t hesitate to reach out.</p>

<p>Best regards,<br>
The Team</p>',
            ],
            [
                'name' => 'Event Invitation',
                'description' => 'Invite members to upcoming events',
                'subject' => 'You\'re Invited to Our Upcoming Event',
                'content' => '<p>Dear {member_name},</p>

<p>We\'re pleased to invite you to our upcoming event:</p>

<p><strong>Event Name:</strong> [Event Name]<br>
<strong>Date:</strong> [Date]<br>
<strong>Time:</strong> [Time]<br>
<strong>Location:</strong> [Location]</p>

<p>We hope to see you there!</p>

<p>Please RSVP by [Date].</p>

<p>Best regards,<br>
The Team</p>',
            ],
            [
                'name' => 'Monthly Newsletter',
                'description' => 'Regular newsletter template with sections',
                'subject' => 'This Month\'s Newsletter',
                'content' => '<h2>Monthly Newsletter</h2>

<p>Dear {member_name},</p>

<p>Here\'s what\'s happening this month:</p>

<h3>Upcoming Events</h3>
<p>[List your events here]</p>

<h3>Community Updates</h3>
<p>[Share community news]</p>

<h3>Announcements</h3>
<p>[Important announcements]</p>

<p>Thank you for being part of our community!</p>

<p>Best regards,<br>
The Team</p>',
            ],
        ];

        foreach ($templates as $template) {
            EmailTemplate::create($template);
        }
    }
}
