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
            'provider' => EmailSetting::get('provider', 'smtp'),
            'from_address' => EmailSetting::get('from_address', config('mail.from.address')),
            'from_name' => EmailSetting::get('from_name', config('mail.from.name')),

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
        try {
            $validated = $request->validate([
                'email' => 'required|email',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email address: ' . implode(', ', $e->validator->errors()->all()),
            ], 422);
        }

        try {
            EmailSetting::configureMailer();

            Mail::raw('This is a test email from your application.', function ($message) use ($request) {
                $message->to($request->email)
                    ->subject('Test Email');
            });

            return response()->json([
                'success' => true,
                'message' => 'Test email sent successfully!',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send test email: '.$e->getMessage(),
            ], 500);
        }
    }
}
