<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class MemberController extends Controller
{
    /**
     * Display a listing of members.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $memberType = $request->get('member_type');
        $perPage = $request->get('per_page', 15);

        $query = Member::query()
            ->select([
                'id', 'member_type', 'first_name', 'last_name', 'email', 'phone1', 
                'city', 'state', 'created_at', 'updated_at'
            ])
            ->orderBy('last_name')
            ->orderBy('first_name');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('state', 'like', "%{$search}%");
            });
        }

        if ($memberType) {
            $query->where('member_type', $memberType);
        }

        $members = $query->paginate($perPage);

        return Inertia::render('members/index', [
            'members' => $members,
            'filters' => [
                'search' => $search,
                'member_type' => $memberType,
            ]
        ]);
    }

    /**
     * Show the form for creating a new member.
     */
    public function create()
    {
        return Inertia::render('members/create');
    }

    /**
     * Store a newly created member in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'member_type' => ['required', Rule::in(['member', 'contact', 'prospect', 'former'])],
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:members,email',
            'phone1' => 'nullable|string|max:20',
            'phone2' => 'nullable|string|max:20',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'dob' => 'nullable|date',
            'middle_name' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:100',
            'gender' => 'nullable|in:male,female,other',
            'aliyah' => 'nullable|boolean',
            'bnaimitzvahdate' => 'nullable|date',
            'chazanut' => 'nullable|boolean',
            'tribe' => 'nullable|in:israel,kohein,levi',
            'dvartorah' => 'nullable|boolean',
            'deceased' => 'nullable|boolean',
            'father_hebrew_name' => 'nullable|string|max:255',
            'mother_hebrew_name' => 'nullable|string|max:255',
            'hebrew_name' => 'nullable|string|max:255',
            'brianbatorah' => 'nullable|boolean',
            'maftir' => 'nullable|boolean',
            'anniversary_date' => 'nullable|date',
        ]);

        Member::create($validated);

        return redirect()->route('members.index')
            ->with('success', 'Member created successfully.');
    }

    /**
     * Display the specified member.
     */
    public function show(Member $member)
    {
        return Inertia::render('members/show', [
            'member' => $member
        ]);
    }

    /**
     * Show the form for editing the specified member.
     */
    public function edit(Member $member)
    {
        return Inertia::render('members/edit', [
            'member' => $member
        ]);
    }

    /**
     * Update the specified member in storage.
     */
    public function update(Request $request, Member $member)
    {
        $validated = $request->validate([
            'member_type' => ['required', Rule::in(['member', 'contact', 'prospect', 'former'])],
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('members')->ignore($member->id)],
            'phone1' => 'nullable|string|max:20',
            'phone2' => 'nullable|string|max:20',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'dob' => 'nullable|date',
            'middle_name' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:100',
            'gender' => 'nullable|in:male,female,other',
            'aliyah' => 'nullable|boolean',
            'bnaimitzvahdate' => 'nullable|date',
            'chazanut' => 'nullable|boolean',
            'tribe' => 'nullable|in:israel,kohein,levi',
            'dvartorah' => 'nullable|boolean',
            'deceased' => 'nullable|boolean',
            'father_hebrew_name' => 'nullable|string|max:255',
            'mother_hebrew_name' => 'nullable|string|max:255',
            'hebrew_name' => 'nullable|string|max:255',
            'brianbatorah' => 'nullable|boolean',
            'maftir' => 'nullable|boolean',
            'anniversary_date' => 'nullable|date',
        ]);

        $member->update($validated);

        return redirect()->route('members.index')
            ->with('success', 'Member updated successfully.');
    }

    /**
     * Remove the specified member from storage.
     */
    public function destroy(Member $member)
    {
        $member->delete();

        return redirect()->route('members.index')
            ->with('success', 'Member deleted successfully.');
    }

    /**
     * API endpoint for member search autocomplete.
     */
    public function search(Request $request)
    {
        $search = $request->get('q');
        $limit = $request->get('limit', 10);

        $members = Member::query()
            ->select(['id', 'first_name', 'last_name', 'email', 'city', 'state'])
            ->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->limit($limit)
            ->get();

        return response()->json($members);
    }
}
