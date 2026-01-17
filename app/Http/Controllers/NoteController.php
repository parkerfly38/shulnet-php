<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Models\Note;
use App\Models\Member;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $assigned = $request->get('assigned');
        $perPage = $request->get('per_page', 15);

        $query = Note::query()
            ->with(['member', 'user'])
            ->select([
                'id', 'item_scope','name',
                'deadline_date','completed_date',
                'seen_date','note_text','added_by',
                'label','visibility','priority',
                'member_id','user_id',
                'created_at','updated_at'
            ])->orderBy('created_at', 'desc');
        
        if ($search) {
            $query->where('name', 'like', "%$search%");
        }

        // Filter for notes assigned to current user
        if ($assigned && auth()->user()) {
            $query->where('user_id', auth()->user()->id);
        }

        $notes = $query->paginate($perPage);

        // Calculate note statistics
        $stats = [
            'total' => Note::count(),
            'high_priority' => Note::where('priority', 'High')->count(),
            'medium_priority' => Note::where('priority', 'Medium')->count(),
            'low_priority' => Note::where('priority', 'Low')->count(),
            'completed' => Note::whereNotNull('completed_date')->count(),
            'pending' => Note::whereNull('completed_date')->count(),
            'overdue' => Note::whereNull('completed_date')
                ->whereNotNull('deadline_date')
                ->where('deadline_date', '<', now())
                ->count(),
        ];

        return Inertia::render('notes/index', [
            'notes' => $notes,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'assigned' => $assigned
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $members = Member::select('id', 'first_name', 'last_name', 'email')
            ->orderBy('first_name')
            ->get();
        
        $users = User::select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('notes/create', [
            'members' => $members,
            'users' => $users
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreNoteRequest $request)
    {
        $validated = $request->validate([
            'item_scope' => 'required|in:User,Member,Contact',
            'name' => 'required|string|max:255',
            'deadline_date' => 'nullable|date',
            'note_text' => 'nullable|string',
            'label' => 'nullable|string|max:255',
            'added_by' => 'nullable|string|max:255',
            'visibility' => 'required|in:Member,Admin,Broadcast',
            'priority' => 'required|in:Low,Medium,High',
            'member_id' => 'nullable|exists:members,id',
            'user_id' => 'nullable|exists:users,id'
        ]);

        Note::create($validated);

        return redirect('/admin/notes')
            ->with('success', 'Note created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Note $note)
    {
        $note->load(['member', 'user']);
        
        // Mark as seen if assigned to current user and not already seen
        if ($note->user_id === auth()->id() && !$note->seen_date) {
            $note->update(['seen_date' => now()]);
        }
        
        return Inertia::render('notes/show', [
            'note' => $note
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Note $note)
    {
        $note->load(['member', 'user']);
        
        $members = Member::select('id', 'first_name', 'last_name', 'email')
            ->orderBy('first_name')
            ->get();
        
        $users = User::select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('notes/edit', [
            'note' => $note,
            'members' => $members,
            'users' => $users
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateNoteRequest $request, Note $note)
    {
        $validated = $request->validate([
            'item_scope' => 'required|in:User,Member,Contact',
            'name' => 'required|string|max:255',
            'deadline_date' => 'nullable|date',
            'completed_date' => 'nullable|date',
            'note_text' => 'nullable|string',
            'label' => 'nullable|string|max:255',
            'added_by' => 'nullable|string|max:255',
            'visibility' => 'required|in:Member,Admin,Broadcast',
            'priority' => 'required|in:Low,Medium,High',
            'member_id' => 'nullable|exists:members,id',
            'user_id' => 'nullable|exists:users,id'
        ]);

        // Convert ISO datetime strings to MySQL format
        if (isset($validated['completed_date'])) {
            $validated['completed_date'] = \Carbon\Carbon::parse($validated['completed_date'])->format('Y-m-d H:i:s');
        }
        if (isset($validated['deadline_date'])) {
            $validated['deadline_date'] = \Carbon\Carbon::parse($validated['deadline_date'])->format('Y-m-d H:i:s');
        }

        $note->update($validated);

        return redirect('/admin/notes')
            ->with('success', 'Note updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Note $note)
    {
        $note->delete();

        return redirect('/admin/notes')
            ->with('success', 'Note deleted successfully.');
    }

    /**
     * Mark all user's assigned notes as seen.
     */
    public function markAllSeen()
    {
        if (auth()->user()) {
            Note::where('user_id', auth()->user()->id)
                ->whereNull('seen_date')
                ->update(['seen_date' => now()]);
        }

        return redirect()->back()
            ->with('success', 'All notifications marked as seen.');
    }

    /**
     * Download note as ICS calendar file.
     */
    public function downloadICS(Note $note)
    {
        if (!$note->deadline_date) {
            return redirect()->back()
                ->with('error', 'Note has no deadline to export.');
        }

        $deadline = \Carbon\Carbon::parse($note->deadline_date);
        
        // Generate ICS content
        $ics = "BEGIN:VCALENDAR\r\n";
        $ics .= "VERSION:2.0\r\n";
        $ics .= "PRODID:-//ShulNet//Notes//EN\r\n";
        $ics .= "CALSCALE:GREGORIAN\r\n";
        $ics .= "METHOD:PUBLISH\r\n";
        $ics .= "BEGIN:VEVENT\r\n";
        $ics .= "UID:" . md5($note->id . $note->created_at) . "@shulnet\r\n";
        $ics .= "DTSTAMP:" . now()->format('Ymd\THis\Z') . "\r\n";
        $ics .= "DTSTART:" . $deadline->format('Ymd\THis\Z') . "\r\n";
        $ics .= "DTEND:" . $deadline->addHour()->format('Ymd\THis\Z') . "\r\n";
        $ics .= "SUMMARY:" . $this->escapeICSString($note->name) . "\r\n";
        
        if ($note->note_text) {
            $ics .= "DESCRIPTION:" . $this->escapeICSString($note->note_text) . "\r\n";
        }
        
        $ics .= "PRIORITY:" . ($note->priority === 'High' ? '1' : ($note->priority === 'Medium' ? '5' : '9')) . "\r\n";
        $ics .= "STATUS:CONFIRMED\r\n";
        $ics .= "END:VEVENT\r\n";
        $ics .= "END:VCALENDAR\r\n";

        $filename = \Illuminate\Support\Str::slug($note->name) . '.ics';

        return response($ics, 200)
            ->header('Content-Type', 'text/calendar; charset=utf-8')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Escape special characters for ICS format.
     */
    private function escapeICSString(string $text): string
    {
        $text = str_replace('\\', '\\\\', $text);
        $text = str_replace(',', '\\,', $text);
        $text = str_replace(';', '\\;', $text);
        $text = str_replace("\n", '\\n', $text);
        return $text;
    }
}
