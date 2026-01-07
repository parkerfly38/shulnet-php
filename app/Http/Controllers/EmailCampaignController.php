<?php

namespace App\Http\Controllers;

use App\Models\EmailCampaign;
use App\Models\EmailTemplate;
use App\Models\Member;
use App\Models\EmailSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
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
            'pendingSubscribers'
        ])->latest()->get();

        return Inertia::render('campaigns/index', [
            'campaigns' => $campaigns
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
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
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

        $templates = EmailTemplate::select('id', 'name', 'subject', 'content')->get();

        return Inertia::render('campaigns/show', [
            'campaign' => $campaign,
            'templates' => $templates,
        ]);
    }

    /**
     * Show the form for editing the specified campaign.
     */
    public function edit(EmailCampaign $campaign)
    {
        return Inertia::render('campaigns/edit', [
            'campaign' => $campaign
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
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
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
            'member_id' => 'required|exists:members,id',
        ]);

        $member = Member::findOrFail($validated['member_id']);

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

        if (!$subscription) {
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
            'campaign' => $campaign
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
        
        $subscribers = $campaign->confirmedSubscribers()->get();

        if ($subscribers->isEmpty()) {
            return back()->with('error', 'No confirmed subscribers to send to.');
        }

        $sent = 0;

        foreach ($subscribers as $subscriber) {
            if (!$subscriber->email) {
                continue;
            }

            try {
                Mail::send('emails.campaign', [
                    'campaign' => $campaign,
                    'member' => $subscriber,
                    'unsubscribeUrl' => route('campaigns.unsubscribe.public', [
                        'campaign' => $campaign->id,
                        'member' => $subscriber->id
                    ]),
                ], function ($message) use ($subscriber, $campaign) {
                    $message->to($subscriber->email)
                        ->subject($campaign->subject);
                });

                $sent++;
            } catch (\Exception $e) {
                // Log error but continue
                \Log::error("Failed to send campaign to {$subscriber->email}: " . $e->getMessage());
            }
        }

        return back()->with('success', "Campaign sent to {$sent} subscribers.");
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
            'campaign' => $campaign
        ]);
    }
}

