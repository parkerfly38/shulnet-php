<?php

namespace App\Http\Controllers;

use App\Models\EmailSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class EmailSettingController extends Controller
{
    /**
     * Display email settings page
     */
    public function index()
    {
        $settings = [
            'provider' => EmailSetting::get('email_provider', 'smtp'),
            'from_address' => EmailSetting::get('email_from_address', config('mail.from.address')),
            'from_name' => EmailSetting::get('email_from_name', config('mail.from.name')),

            // SMTP
            'smtp_host' => EmailSetting::get('smtp_host'),
            'smtp_port' => EmailSetting::get('smtp_port', '587'),
            'smtp_username' => EmailSetting::get('smtp_username'),
            'smtp_password' => EmailSetting::get('smtp_password') ? '••••••••' : '',
            'smtp_encryption' => EmailSetting::get('smtp_encryption', 'tls'),

            // Mailgun
            'mailgun_domain' => EmailSetting::get('mailgun_domain'),
            'mailgun_secret' => EmailSetting::get('mailgun_secret') ? '••••••••' : '',
            'mailgun_endpoint' => EmailSetting::get('mailgun_endpoint', 'api.mailgun.net'),

            // SendGrid
            'sendgrid_api_key' => EmailSetting::get('sendgrid_api_key') ? '••••••••' : '',

            // AWS SES
            'ses_key' => EmailSetting::get('ses_key') ? '••••••••' : '',
            'ses_secret' => EmailSetting::get('ses_secret') ? '••••••••' : '',
            'ses_region' => EmailSetting::get('ses_region', 'us-east-1'),
        ];

        return Inertia::render('settings/email', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update email settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'provider' => 'required|in:smtp,mailgun,sendgrid,ses,log',
            'from_address' => 'required|email',
            'from_name' => 'required|string',

            'smtp_host' => 'nullable|string',
            'smtp_port' => 'nullable|integer',
            'smtp_username' => 'nullable|string',
            'smtp_password' => 'nullable|string',
            'smtp_encryption' => 'nullable|in:tls,ssl',

            'mailgun_domain' => 'nullable|string',
            'mailgun_secret' => 'nullable|string',
            'mailgun_endpoint' => 'nullable|string',

            'sendgrid_api_key' => 'nullable|string',

            'ses_key' => 'nullable|string',
            'ses_secret' => 'nullable|string',
            'ses_region' => 'nullable|string',
        ]);

        foreach ($validated as $key => $value) {
            // Skip password fields if they're masked
            if (str_contains($value ?? '', '••••')) {
                continue;
            }

            if ($value !== null) {
                EmailSetting::set($key, $value);
            }
        }

        EmailSetting::clearCache();

        return redirect()->route('admin.email-settings.index')
            ->with('success', 'Email settings updated successfully.');
    }

    /**
     * Send test email
     */
    public function test(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        try {
            $this->configureMailer();

            Mail::raw('This is a test email from your application.', function ($message) use ($request) {
                $message->to($request->email)
                    ->subject('Test Email');
            });

            return back()->with('success', 'Test email sent successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send test email: '.$e->getMessage());
        }
    }

    /**
     * Configure mailer with current settings
     */
    private function configureMailer()
    {
        $provider = EmailSetting::get('email_provider', 'smtp');

        Config::set('mail.from.address', EmailSetting::get('email_from_address'));
        Config::set('mail.from.name', EmailSetting::get('email_from_name'));
        Config::set('mail.default', $provider);

        switch ($provider) {
            case 'smtp':
                Config::set('mail.mailers.smtp', [
                    'transport' => 'smtp',
                    'host' => EmailSetting::get('smtp_host'),
                    'port' => EmailSetting::get('smtp_port', 587),
                    'encryption' => EmailSetting::get('smtp_encryption', 'tls'),
                    'username' => EmailSetting::get('smtp_username'),
                    'password' => EmailSetting::get('smtp_password'),
                ]);
                break;

            case 'mailgun':
                Config::set('services.mailgun', [
                    'domain' => EmailSetting::get('mailgun_domain'),
                    'secret' => EmailSetting::get('mailgun_secret'),
                    'endpoint' => EmailSetting::get('mailgun_endpoint', 'api.mailgun.net'),
                ]);
                break;

            case 'sendgrid':
                Config::set('services.sendgrid', [
                    'api_key' => EmailSetting::get('sendgrid_api_key'),
                ]);
                Config::set('mail.mailers.sendgrid', [
                    'transport' => 'sendgrid',
                ]);
                break;

            case 'ses':
                Config::set('services.ses', [
                    'key' => EmailSetting::get('ses_key'),
                    'secret' => EmailSetting::get('ses_secret'),
                    'region' => EmailSetting::get('ses_region', 'us-east-1'),
                ]);
                break;
        }
    }
}
