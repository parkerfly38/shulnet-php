<?php

namespace App\Ai\Agents;

use App\Ai\Tools\FinancialReport;
use App\Ai\Tools\EventRsvps;
use App\Ai\Tools\HebrewCalendar;
use App\Ai\Tools\MemberDetail;
use App\Ai\Tools\SearchEvents;
use App\Ai\Tools\SearchInvoices;
use App\Ai\Tools\SearchMembers;
use App\Ai\Tools\SearchYahrzeits;
use App\Ai\Tools\UpcomingYahrzeits;
use Laravel\Ai\Concerns\RemembersConversations;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Promptable;
use Stringable;

class AdminAssistant implements Agent, Conversational, HasTools
{
    use Promptable, RemembersConversations;

    public function instructions(): Stringable|string
    {
        return 'You are the administrative assistant for a synagogue management system. '
            .'Answer questions about members, yahrzeits, events, RSVPs, invoices and financial reports by calling the available tools. '
            .'Never guess data: if a tool returns nothing or an error, say so. Be concise. '
            .'Today is '.now()->toFormattedDayDateString().'.';
    }

    public function tools(): iterable
    {
        return [
            app(SearchMembers::class),
            app(MemberDetail::class),
            app(SearchYahrzeits::class),
            app(SearchEvents::class),
            app(EventRsvps::class),
            app(SearchInvoices::class),
            app(FinancialReport::class),
            app(UpcomingYahrzeits::class),
            app(HebrewCalendar::class),
        ];
    }
}
