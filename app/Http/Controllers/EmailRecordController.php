<?php

namespace App\Http\Controllers;

use App\Models\EmailRecord;
use Illuminate\Http\Request;
use Dedoc\Scramble\Attributes\Group;

#[Group('Email Management')]

class EmailRecordController extends Controller
{
    /**
     * API: Store a new email record.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'subject' => 'required|string|max:255',
            'from' => 'required|email|max:255',
            'to' => 'required|email|max:255',
            'cc' => 'nullable|string|max:255',
            'bcc' => 'nullable|string|max:255',
            'date_sent' => 'required|date',
            'conversation_id' => 'nullable|string|max:255',
            'message_id' => 'nullable|string|max:255',
        ]);

        $emailRecord = EmailRecord::create($validated);

        return response()->json([
            'message' => 'Email record created successfully',
            'data' => $emailRecord,
        ], 201);
    }
}
