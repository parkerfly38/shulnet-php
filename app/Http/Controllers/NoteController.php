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

        return Inertia::render('notes/index', [
            'notes' => $notes,
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
}
