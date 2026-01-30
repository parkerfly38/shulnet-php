<?php

namespace Database\Seeders;

use App\Models\HtmlAsset;
use App\Models\HtmlPage;
use App\Models\HtmlTemplate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class HtmlContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample templates
        $mainTemplate = HtmlTemplate::create([
            'name' => 'Main Website Template',
            'description' => 'Primary template for public-facing pages',
            'header' => <<<'HTML'
<header style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem 1rem;">
    <div style="max-width: 1200px; margin: 0 auto;">
        <h1 style="margin: 0; font-size: 2rem;">Congregation Beth Shalom</h1>
        <nav style="margin-top: 1rem;">
            <a href="/" style="color: white; margin-right: 1.5rem; text-decoration: none;">Home</a>
            <a href="/about" style="color: white; margin-right: 1.5rem; text-decoration: none;">About</a>
            <a href="/events" style="color: white; margin-right: 1.5rem; text-decoration: none;">Events</a>
            <a href="/contact" style="color: white; text-decoration: none;">Contact</a>
        </nav>
    </div>
</header>
HTML,
            'footer' => <<<'HTML'
<footer style="background: #1a202c; color: #cbd5e0; padding: 2rem 1rem; margin-top: 3rem;">
    <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
        <p style="margin: 0;">&copy; 2026 Congregation Beth Shalom. All rights reserved.</p>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem;">
            123 Temple Lane, Your City, State 12345 | (555) 123-4567 | info@bethshalom.org
        </p>
    </div>
</footer>
HTML,
            'navigation' => null,
            'css' => <<<'CSS'
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    line-height: 1.6;
    color: #2d3748;
    margin: 0;
    padding: 0;
}
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
}
h2 {
    color: #2d3748;
    border-bottom: 2px solid #667eea;
    padding-bottom: 0.5rem;
}
CSS,
        ]);

        $simpleTemplate = HtmlTemplate::create([
            'name' => 'Simple Template',
            'description' => 'Minimal template for newsletters and announcements',
            'header' => '<div style="text-align: center; padding: 1rem; background: #f7fafc; border-bottom: 3px solid #4299e1;"><h2 style="margin: 0;">Beth Shalom Community</h2></div>',
            'footer' => '<div style="text-align: center; padding: 1rem; background: #f7fafc; border-top: 1px solid #e2e8f0; margin-top: 2rem;"><small>Congregation Beth Shalom</small></div>',
        ]);

        // Create sample assets (we'll create placeholder data since we can't upload real files)
        $logo = HtmlAsset::create([
            'name' => 'congregation-logo.png',
            'filename' => time() . '_congregation-logo.png',
            'path' => 'html-assets/sample-logo.png',
            'url' => '/storage/html-assets/sample-logo.png',
            'storage_provider' => 'local',
            'mime_type' => 'image/png',
            'file_size' => 45678,
            'width' => 400,
            'height' => 200,
            'alt_text' => 'Congregation Beth Shalom Logo',
        ]);

        $heroImage = HtmlAsset::create([
            'name' => 'sanctuary-hero.jpg',
            'filename' => time() . '_sanctuary-hero.jpg',
            'path' => 'html-assets/sample-hero.jpg',
            'url' => '/storage/html-assets/sample-hero.jpg',
            'storage_provider' => 'local',
            'mime_type' => 'image/jpeg',
            'file_size' => 234567,
            'width' => 1920,
            'height' => 1080,
            'alt_text' => 'Beautiful sanctuary interior',
        ]);

        // Create sample pages
        HtmlPage::create([
            'title' => 'Welcome Home',
            'slug' => 'welcome',
            'template_id' => $mainTemplate->id,
            'content' => <<<HTML
<div class="container">
    <h2>Welcome to Congregation Beth Shalom</h2>
    
    <div style="margin: 2rem 0;">
        <img src="/storage/html-assets/sample-hero.jpg" alt="Beautiful sanctuary interior" style="width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    </div>
    
    <p style="font-size: 1.125rem; line-height: 1.75;">
        For over 75 years, Congregation Beth Shalom has been a cornerstone of Jewish life in our community. 
        We are a warm, welcoming congregation that celebrates the richness of Jewish tradition while embracing 
        the diverse needs of modern Jewish families.
    </p>
    
    <h3 style="color: #667eea; margin-top: 2rem;">Our Mission</h3>
    <p>
        We strive to create a vibrant Jewish community where individuals and families can grow spiritually, 
        connect socially, and engage in meaningful acts of tikkun olam (repairing the world). Whether you're 
        looking for traditional Shabbat services, contemporary learning opportunities, or ways to give back to 
        the community, you'll find a home here.
    </p>
    
    <h3 style="color: #667eea; margin-top: 2rem;">Join Us</h3>
    <p>
        We invite you to explore our website, attend our services, and become part of our extended family. 
        Whether you're new to the area or have been here for years, there's a place for you at Beth Shalom.
    </p>
    
    <div style="background: #f7fafc; padding: 1.5rem; border-radius: 8px; margin-top: 2rem; border-left: 4px solid #667eea;">
        <h4 style="margin-top: 0; color: #667eea;">Service Times</h4>
        <p style="margin: 0.5rem 0;"><strong>Friday Evening:</strong> 7:00 PM</p>
        <p style="margin: 0.5rem 0;"><strong>Saturday Morning:</strong> 9:30 AM</p>
        <p style="margin: 0.5rem 0;"><strong>Sunday Morning:</strong> 9:00 AM (First Sunday of month)</p>
    </div>
</div>
HTML,
            'status' => 'published',
            'published_at' => now(),
            'show_in_nav' => true,
            'sort_order' => 1,
            'meta_description' => 'Welcome to Congregation Beth Shalom - A vibrant Jewish community serving families for over 75 years.',
            'meta_keywords' => 'synagogue, Jewish community, Beth Shalom, congregation, services',
        ]);

        HtmlPage::create([
            'title' => 'About Our Congregation',
            'slug' => 'about',
            'template_id' => $mainTemplate->id,
            'content' => <<<HTML
<div class="container">
    <h2>Our Story</h2>
    
    <p>
        Congregation Beth Shalom was founded in 1950 by a small group of dedicated families who envisioned 
        a synagogue that would serve as both a spiritual home and a community center for Jewish life.
    </p>
    
    <h3 style="color: #667eea; margin-top: 2rem;">Our Values</h3>
    <ul style="line-height: 1.8;">
        <li><strong>Torah:</strong> We are committed to lifelong Jewish learning and the study of our sacred texts.</li>
        <li><strong>Avodah:</strong> We create meaningful worship experiences that inspire and uplift.</li>
        <li><strong>Gemilut Chasadim:</strong> We perform acts of loving kindness within our community and beyond.</li>
        <li><strong>Kehillah:</strong> We build strong relationships and a sense of belonging for all members.</li>
    </ul>
    
    <h3 style="color: #667eea; margin-top: 2rem;">Leadership</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 1rem;">
        <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h4 style="margin-top: 0; color: #667eea;">Rabbi Sarah Cohen</h4>
            <p style="margin: 0; font-style: italic; color: #718096;">Senior Rabbi</p>
            <p style="margin-top: 0.5rem; font-size: 0.875rem;">Leading our congregation with wisdom and compassion since 2015.</p>
        </div>
        
        <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h4 style="margin-top: 0; color: #667eea;">Cantor David Levy</h4>
            <p style="margin: 0; font-style: italic; color: #718096;">Cantor</p>
            <p style="margin-top: 0.5rem; font-size: 0.875rem;">Creating beautiful musical experiences for our services since 2018.</p>
        </div>
        
        <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h4 style="margin-top: 0; color: #667eea;">Rachel Goldstein</h4>
            <p style="margin: 0; font-style: italic; color: #718096;">President</p>
            <p style="margin-top: 0.5rem; font-size: 0.875rem;">Dedicated volunteer leader guiding our community forward.</p>
        </div>
    </div>
</div>
HTML,
            'status' => 'published',
            'published_at' => now(),
            'show_in_nav' => true,
            'sort_order' => 2,
            'meta_description' => 'Learn about the history, values, and leadership of Congregation Beth Shalom.',
            'meta_keywords' => 'about, history, rabbi, leadership, Jewish values',
        ]);

        HtmlPage::create([
            'title' => 'Community Newsletter - January 2026',
            'slug' => 'newsletter-jan-2026',
            'template_id' => $simpleTemplate->id,
            'content' => <<<HTML
<div style="max-width: 800px; margin: 0 auto; padding: 2rem 1rem;">
    <h2 style="text-align: center; color: #2d3748;">January 2026 Newsletter</h2>
    
    <div style="background: #fff5f5; border-left: 4px solid #fc8181; padding: 1rem; margin: 1.5rem 0;">
        <h3 style="margin-top: 0; color: #c53030;">Special Shabbat Programs</h3>
        <p>Join us for our special Tu B'Shevat celebration on January 24th with a tree-planting ceremony 
        and environmental education program for all ages.</p>
    </div>
    
    <h3 style="color: #4299e1;">Upcoming Events</h3>
    <ul style="line-height: 1.8;">
        <li><strong>Jan 10:</strong> Adult Education Series - "Modern Jewish Ethics"</li>
        <li><strong>Jan 17:</strong> Family Shabbat Service & Dinner</li>
        <li><strong>Jan 24:</strong> Tu B'Shevat Celebration</li>
        <li><strong>Jan 31:</strong> Youth Group Movie Night</li>
    </ul>
    
    <h3 style="color: #4299e1;">Community News</h3>
    <p>
        Mazel tov to the Schwartz family on the birth of their granddaughter, Emma Rose! 
        We also extend our congratulations to Ben Goldberg on his acceptance to rabbinical school.
    </p>
    
    <p>
        Our winter coat drive collected over 200 coats for local families in need. Thank you to everyone 
        who participated in this mitzvah!
    </p>
    
    <div style="background: #ebf8ff; padding: 1rem; margin: 1.5rem 0; border-radius: 4px;">
        <p style="margin: 0; text-align: center;">
            <strong>Questions?</strong> Contact the office at (555) 123-4567 or info@bethshalom.org
        </p>
    </div>
</div>
HTML,
            'status' => 'published',
            'published_at' => now()->subDays(5),
            'show_in_nav' => false,
            'sort_order' => 10,
            'meta_description' => 'January 2026 community newsletter with events and announcements.',
        ]);

        HtmlPage::create([
            'title' => 'Contact Us',
            'slug' => 'contact',
            'template_id' => $mainTemplate->id,
            'content' => <<<HTML
<div class="container">
    <h2>Get in Touch</h2>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 2rem;">
        <div>
            <h3 style="color: #667eea;">Office Hours</h3>
            <p style="line-height: 1.8;">
                <strong>Monday - Thursday:</strong> 9:00 AM - 5:00 PM<br>
                <strong>Friday:</strong> 9:00 AM - 3:00 PM<br>
                <strong>Saturday & Sunday:</strong> By appointment
            </p>
            
            <h3 style="color: #667eea; margin-top: 2rem;">Contact Information</h3>
            <p style="line-height: 1.8;">
                <strong>Phone:</strong> (555) 123-4567<br>
                <strong>Email:</strong> info@bethshalom.org<br>
                <strong>Address:</strong><br>
                123 Temple Lane<br>
                Your City, State 12345
            </p>
        </div>
        
        <div>
            <h3 style="color: #667eea;">Staff Directory</h3>
            <div style="line-height: 1.8;">
                <p><strong>Rabbi Sarah Cohen</strong><br>rabbi@bethshalom.org</p>
                <p><strong>Cantor David Levy</strong><br>cantor@bethshalom.org</p>
                <p><strong>Executive Director</strong><br>director@bethshalom.org</p>
                <p><strong>Education Director</strong><br>education@bethshalom.org</p>
            </div>
        </div>
    </div>
    
    <div style="background: #f7fafc; padding: 2rem; border-radius: 8px; margin-top: 2rem;">
        <h3 style="margin-top: 0; color: #667eea;">Visit Us</h3>
        <p>
            We welcome visitors to our services and programs. No RSVP needed for regular Shabbat services. 
            For special events or to schedule a tour, please contact our office.
        </p>
        <p style="margin-bottom: 0;">
            <strong>New to the area?</strong> We'd love to meet you! Contact us to learn about membership 
            or schedule a meeting with the rabbi.
        </p>
    </div>
</div>
HTML,
            'status' => 'published',
            'published_at' => now(),
            'show_in_nav' => true,
            'sort_order' => 4,
            'meta_description' => 'Contact Congregation Beth Shalom - office hours, phone, email, and address.',
            'meta_keywords' => 'contact, office hours, phone, email, address, visit',
        ]);

        HtmlPage::create([
            'title' => 'Draft: High Holy Days 2026',
            'slug' => 'high-holy-days-2026',
            'template_id' => $mainTemplate->id,
            'content' => <<<HTML
<div class="container">
    <h2>High Holy Days 5787 / 2026</h2>
    
    <p><em>This page is currently in draft status. It will be published closer to the High Holy Days.</em></p>
    
    <h3 style="color: #667eea;">Service Schedule (Tentative)</h3>
    <p>Details coming soon for Rosh Hashanah and Yom Kippur services.</p>
    
    <h3 style="color: #667eea;">Ticket Information</h3>
    <p>Information about tickets and reservations will be available in the summer.</p>
</div>
HTML,
            'status' => 'draft',
            'show_in_nav' => false,
            'sort_order' => 20,
            'meta_description' => 'High Holy Days schedule and information for 2026.',
        ]);

        $this->command->info('Created ' . HtmlTemplate::count() . ' HTML templates');
        $this->command->info('Created ' . HtmlAsset::count() . ' HTML assets');
        $this->command->info('Created ' . HtmlPage::count() . ' HTML pages');
    }
}
