<?php

namespace App\Http\Controllers;

use App\Models\CampaignEmail;
use App\Models\EmailCampaign;
use App\Models\EmailSetting;
use App\Models\EmailTemplate;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EmailCampaignController extends Controller
{
    /**
     * Display a listing of campaigns.
     */
    public function index()
    {
        $campaigns = EmailCampaign::withCount([
            'subscribers',
            'confirmedSubscribers',
            'pendingSubscribers',
        ])->latest()->get();

        return Inertia::render('campaigns/index', [
            'campaigns' => $campaigns,
        ]);
    }

    /**
     * Show the form for creating a new campaign.
     */
    public function create()
    {
        return Inertia::render('campaigns/create');
    }

    /**
     * Store a newly created campaign.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'opt_in_type' => 'required|in:single,double',
            'is_active' => 'boolean',
            'confirmation_subject' => 'nullable|string|max:255',
            'confirmation_content' => 'nullable|string',
        ]);

        $campaign = EmailCampaign::create($validated);

        return redirect('/admin/campaigns')
            ->with('success', 'Campaign created successfully.');
    }

    /**
     * Display the specified campaign.
     */
    public function show(EmailCampaign $campaign)
    {
        $campaign->load(['subscribers' => function ($query) {
            $query->withPivot('status', 'confirmed_at', 'unsubscribed_at')
                ->orderBy('campaign_subscriptions.created_at', 'desc');
        }]);

        // Load campaign emails
        $campaignEmails = $campaign->campaignEmails()
            ->orderBy('created_at', 'desc')
            ->get();

        $templates = EmailTemplate::select('id', 'name', 'subject', 'content')->get();

        // Get members not already subscribed or only unsubscribed
        $subscribedMemberIds = $campaign->subscribers()
            ->wherePivot('status', '!=', 'unsubscribed')
            ->pluck('members.id');

        $availableMembers = Member::whereNotIn('id', $subscribedMemberIds)
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->select('id', 'first_name', 'last_name', 'email')
            ->get();

        return Inertia::render('campaigns/show', [
            'campaign' => $campaign,
            'campaignEmails' => $campaignEmails,
            'templates' => $templates,
            'availableMembers' => $availableMembers,
        ]);
    }

    /**
     * Show the form for editing the specified campaign.
     */
    public function edit(EmailCampaign $campaign)
    {
        return Inertia::render('campaigns/edit', [
            'campaign' => $campaign,
        ]);
    }

    /**
     * Update the specified campaign.
     */
    public function update(Request $request, EmailCampaign $campaign)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'opt_in_type' => 'required|in:single,double',
            'is_active' => 'boolean',
            'confirmation_subject' => 'nullable|string|max:255',
            'confirmation_content' => 'nullable|string',
        ]);

        $campaign->update($validated);

        return redirect('/admin/campaigns')
            ->with('success', 'Campaign updated successfully.');
    }

    /**
     * Remove the specified campaign.
     */
    public function destroy(EmailCampaign $campaign)
    {
        $campaign->delete();

        return redirect('/admin/campaigns')
            ->with('success', 'Campaign deleted successfully.');
    }

    /**
     * Subscribe a member to the campaign
     */
    public function subscribe(Request $request, EmailCampaign $campaign)
    {
        $validated = $request->validate([
            'member_id' => 'nullable|exists:members,id',
            'email' => 'required_without:member_id|email',
            'first_name' => 'required_without:member_id|string|max:255',
            'last_name' => 'required_without:member_id|string|max:255',
        ]);

        // If member_id provided, use existing member
        if (!empty($validated['member_id'])) {
            $member = Member::findOrFail($validated['member_id']);
        } else {
            // Check if member with this email already exists
            $member = Member::where('email', $validated['email'])->first();
            
            if (!$member) {
                // Create new minimal contact record
                $member = Member::create([
                    'email' => $validated['email'],
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'member_type' => 'contact',
                ]);
            }
        }

        // Check if already subscribed
        if ($campaign->subscribers()->where('member_id', $member->id)->exists()) {
            return back()->with('error', 'Member is already subscribed to this campaign.');
        }

        if ($campaign->opt_in_type === 'single') {
            // Single opt-in: immediately confirmed
            $campaign->subscribers()->attach($member->id, [
                'status' => 'confirmed',
                'confirmed_at' => now(),
            ]);

            return back()->with('success', 'Member subscribed successfully.');
        } else {
            // Double opt-in: send confirmation email
            $token = Str::random(64);

            $campaign->subscribers()->attach($member->id, [
                'status' => 'pending',
                'confirmation_token' => $token,
            ]);

            // Send confirmation email
            Mail::send('emails.campaign-confirmation', [
                'campaign' => $campaign,
                'member' => $member,
                'confirmUrl' => route('campaigns.confirm', ['token' => $token]),
            ], function ($message) use ($member, $campaign) {
                $message->to($member->email)
                    ->subject($campaign->confirmation_subject ?? "Please confirm your subscription to {$campaign->name}");
            });

            return back()->with('success', 'Confirmation email sent to member.');
        }
    }

    /**
     * Bulk subscribe members to campaign
     */
    public function bulkSubscribe(Request $request, EmailCampaign $campaign)
    {
        $validated = $request->validate([
            'member_ids' => 'required|array',
            'member_ids.*' => 'exists:members,id',
        ]);

        $subscribed = 0;
        $confirmationsSent = 0;

        foreach ($validated['member_ids'] as $memberId) {
            // Skip if already subscribed
            if ($campaign->subscribers()->where('member_id', $memberId)->exists()) {
                continue;
            }

            $member = Member::find($memberId);

            if ($campaign->opt_in_type === 'single') {
                $campaign->subscribers()->attach($memberId, [
                    'status' => 'confirmed',
                    'confirmed_at' => now(),
                ]);
                $subscribed++;
            } else {
                $token = Str::random(64);

                $campaign->subscribers()->attach($memberId, [
                    'status' => 'pending',
                    'confirmation_token' => $token,
                ]);

                // Send confirmation email
                if ($member->email) {
                    Mail::send('emails.campaign-confirmation', [
                        'campaign' => $campaign,
                        'member' => $member,
                        'confirmUrl' => route('campaigns.confirm', ['token' => $token]),
                    ], function ($message) use ($member, $campaign) {
                        $message->to($member->email)
                            ->subject($campaign->confirmation_subject ?? "Please confirm your subscription to {$campaign->name}");
                    });
                    $confirmationsSent++;
                }
            }
        }

        if ($campaign->opt_in_type === 'single') {
            return back()->with('success', "{$subscribed} members subscribed successfully.");
        } else {
            return back()->with('success', "{$confirmationsSent} confirmation emails sent.");
        }
    }

    /**
     * Confirm subscription (for double opt-in)
     */
    public function confirm($token)
    {
        $subscription = \DB::table('campaign_subscriptions')
            ->where('confirmation_token', $token)
            ->first();

        if (! $subscription) {
            return redirect('/')->with('error', 'Invalid confirmation token.');
        }

        \DB::table('campaign_subscriptions')
            ->where('id', $subscription->id)
            ->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
                'confirmation_token' => null,
            ]);

        $campaign = EmailCampaign::find($subscription->email_campaign_id);

        return view('campaigns.confirmed', [
            'campaign' => $campaign,
        ]);
    }

    /**
     * Unsubscribe a member from campaign
     */
    public function unsubscribe(Request $request, EmailCampaign $campaign)
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
        ]);

        \DB::table('campaign_subscriptions')
            ->where('email_campaign_id', $campaign->id)
            ->where('member_id', $validated['member_id'])
            ->update([
                'status' => 'unsubscribed',
                'unsubscribed_at' => now(),
            ]);

        return back()->with('success', 'Member unsubscribed successfully.');
    }

    /**
     * Send campaign to all confirmed subscribers
     */
    public function send(EmailCampaign $campaign)
    {
        // Configure mailer with stored settings
        EmailSetting::configureMailer();

        // Get pending campaign emails
        $pendingEmails = $campaign->campaignEmails()->where('status', 'pending')->get();

        if ($pendingEmails->isEmpty()) {
            return back()->with('error', 'No pending emails to send.');
        }

        $subscribers = $campaign->confirmedSubscribers()->get();

        if ($subscribers->isEmpty()) {
            return back()->with('error', 'No confirmed subscribers to send to.');
        }

        $sent = 0;

        // Send each pending email to all subscribers
        foreach ($pendingEmails as $campaignEmail) {
            foreach ($subscribers as $subscriber) {
                if (! $subscriber->email) {
                    continue;
                }

                try {
                    Mail::send('emails.campaign', [
                        'campaign' => $campaign,
                        'campaignEmail' => $campaignEmail,
                        'member' => $subscriber,
                        'content' => $campaignEmail->content,
                        'unsubscribeUrl' => route('campaigns.unsubscribe.public', [
                            'campaign' => $campaign->id,
                            'member' => $subscriber->id,
                        ]),
                    ], function ($message) use ($subscriber, $campaignEmail) {
                        $message->to($subscriber->email)
                            ->subject($campaignEmail->subject);
                    });

                    $sent++;
                } catch (\Exception $e) {
                    // Log error but continue
                    \Log::error("Failed to send campaign email {$campaignEmail->id} to {$subscriber->email}: ".$e->getMessage());
                }
            }

            // Mark campaign email as sent
            $campaignEmail->markAsSent();
        }

        return back()->with('success', "Sent {$pendingEmails->count()} campaign email(s) to {$sent} total recipients.");
    }

    /**
     * Public unsubscribe endpoint
     */
    public function unsubscribePublic(EmailCampaign $campaign, Member $member)
    {
        \DB::table('campaign_subscriptions')
            ->where('email_campaign_id', $campaign->id)
            ->where('member_id', $member->id)
            ->update([
                'status' => 'unsubscribed',
                'unsubscribed_at' => now(),
            ]);

        return view('campaigns.unsubscribed', [
            'campaign' => $campaign,
        ]);
    }

    /**
     * Show form to create a new campaign email
     */
    public function createEmail(EmailCampaign $campaign)
    {
        $templates = EmailTemplate::select('id', 'name', 'subject', 'content')->get();

        return Inertia::render('campaigns/emails/create', [
            'campaign' => $campaign,
            'templates' => $templates,
        ]);
    }

    /**
     * Store a new campaign email
     */
    public function storeEmail(Request $request, EmailCampaign $campaign)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $campaign->campaignEmails()->create([
            'subject' => $validated['subject'],
            'content' => $validated['content'],
            'status' => 'pending',
        ]);

        return redirect("/admin/campaigns/{$campaign->id}")
            ->with('success', 'Campaign email created successfully.');
    }

    /**
     * Show form to edit a campaign email
     */
    public function editEmail(EmailCampaign $campaign, CampaignEmail $email)
    {
        // Ensure the email belongs to this campaign
        if ($email->campaign_id !== $campaign->id) {
            abort(404);
        }

        // Only allow editing pending emails
        if ($email->status !== 'pending') {
            return back()->with('error', 'Cannot edit an email that has already been sent.');
        }

        $templates = EmailTemplate::select('id', 'name', 'subject', 'content')->get();

        return Inertia::render('campaigns/emails/edit', [
            'campaign' => $campaign,
            'campaignEmail' => $email,
            'templates' => $templates,
        ]);
    }

    /**
     * Update a campaign email
     */
    public function updateEmail(Request $request, EmailCampaign $campaign, CampaignEmail $email)
    {
        // Ensure the email belongs to this campaign
        if ($email->campaign_id !== $campaign->id) {
            abort(404);
        }

        // Only allow updating pending emails
        if ($email->status !== 'pending') {
            return back()->with('error', 'Cannot update an email that has already been sent.');
        }

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $email->update($validated);

        return redirect("/admin/campaigns/{$campaign->id}")
            ->with('success', 'Campaign email updated successfully.');
    }

    /**
     * Delete a campaign email
     */
    public function destroyEmail(EmailCampaign $campaign, CampaignEmail $email)
    {
        // Ensure the email belongs to this campaign
        if ($email->campaign_id !== $campaign->id) {
            abort(404);
        }

        // Only allow deleting pending emails
        if ($email->status !== 'pending') {
            return back()->with('error', 'Cannot delete an email that has already been sent.');
        }

        $email->delete();

        return back()->with('success', 'Campaign email deleted successfully.');
    }
}
