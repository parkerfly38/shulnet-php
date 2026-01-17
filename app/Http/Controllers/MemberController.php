<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\User;
use App\Enums\UserRole;
use App\Imports\MembersImport;
use App\Mail\TemporaryPasswordMail;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

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
                'city', 'state', 'user_id', 'created_at', 'updated_at'
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

        // Calculate member statistics
        $stats = [
            'total' => Member::count(),
            'member' => Member::where('member_type', 'member')->count(),
            'contact' => Member::where('member_type', 'contact')->count(),
            'prospect' => Member::where('member_type', 'prospect')->count(),
            'former' => Member::where('member_type', 'former')->count(),
        ];

        return Inertia::render('members/index', [
            'members' => $members,
            'stats' => $stats,
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
        $member->load(['membershipPeriods' => function ($query) {
            $query->with('invoice:id,invoice_number,invoice_date,total,status')
                  ->orderBy('begin_date', 'desc');
        }]);

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

    /**
     * Import members from CSV/Excel file
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240', // Max 10MB
        ]);

        try {
            $import = new MembersImport();
            Excel::import($import, $request->file('file'));

            $errors = $import->getErrors();
            
            return back()->with([
                'success' => sprintf(
                    'Import completed! %d members imported, %d updated.',
                    $import->getImported(),
                    $import->getUpdated()
                ),
                'import_errors' => $errors,
            ]);
        } catch (\Exception $e) {
            return back()->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

    /**
     * Download a sample CSV template for importing members
     */
    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="members-import-template.csv"',
        ];

        $columns = [
            'title',
            'first_name',
            'last_name',
            'email',
            'phone1',
            'phone2',
            'member_type',
            'address_line_1',
            'address_line_2',
            'city',
            'state',
            'zip',
            'country',
            'dob',
            'gender',
        ];

        $callback = function() use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            
            // Add a sample row
            fputcsv($file, [
                'Mr.',
                'John',
                'Doe',
                'john.doe@example.com',
                '555-1234',
                '555-5678',
                'individual',
                '123 Main St',
                'Apt 4B',
                'Anytown',
                'CA',
                '12345',
                'USA',
                '1990-01-01',
                'Male',
            ]);
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Create a user account for a member.
     */
    public function createUser(Request $request, Member $member)
    {
        // Check if member already has a user
        if ($member->user_id) {
            return back()->with('error', 'This member already has an associated user account.');
        }

        // Check if email already exists as a user
        if (User::where('email', $member->email)->exists()) {
            return back()->with('error', 'A user with this email already exists.');
        }

        // Validate the request
        $validated = $request->validate([
            'method' => 'required|in:manual,email',
            'password' => 'required_if:method,manual|nullable|string|min:8|confirmed',
            'roles' => 'nullable|array',
        ]);

        $temporaryPassword = null;
        
        // Determine the password based on method
        if ($validated['method'] === 'email') {
            // Generate a random temporary password
            $temporaryPassword = Str::random(12);
            $password = $temporaryPassword;
        } else {
            // Use the manually entered password
            $password = $validated['password'];
        }

        // Create the user
        $user = User::create([
            'name' => trim($member->first_name . ' ' . $member->last_name),
            'email' => $member->email,
            'password' => Hash::make($password),
            'roles' => [UserRole::Member],
            'email_verified_at' => now(), // Auto-verify since it's created by admin
        ]);

        // Link the user to the member
        $member->user_id = $user->id;
        $member->save();

        // Send email with temporary password if method is email
        if ($validated['method'] === 'email' && $temporaryPassword) {
            try {
                Mail::to($user->email)->send(new TemporaryPasswordMail($user, $temporaryPassword));
                return back()->with('success', 'User account created and temporary password sent to ' . $member->email);
            } catch (\Exception $e) {
                return back()->with('success', 'User account created but failed to send email. Temporary password: ' . $temporaryPassword);
            }
        }

        return back()->with('success', 'User account created successfully for ' . $member->first_name . ' ' . $member->last_name);
    }

    // ==================== API Methods ====================

    /**
     * API: Create a new member
     * 
     * @group Members
     * @authenticated
     */
    public function apiStore(Request $request)
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

        $member = Member::create($validated);

        return response()->json([
            'message' => 'Member created successfully',
            'data' => $member
        ], 201);
    }

    /**
     * API: Update an existing member
     * 
     * @group Members
     * @authenticated
     */
    public function apiUpdate(Request $request, Member $member)
    {
        $validated = $request->validate([
            'member_type' => ['sometimes', 'required', Rule::in(['member', 'contact', 'prospect', 'former'])],
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('members')->ignore($member->id)],
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

        return response()->json([
            'message' => 'Member updated successfully',
            'data' => $member->fresh()
        ]);
    }

    /**
     * API: Delete a member
     * 
     * @group Members
     * @authenticated
     */
    public function apiDestroy(Member $member)
    {
        $memberName = $member->first_name . ' ' . $member->last_name;
        $member->delete();

        return response()->json([
            'message' => "Member '{$memberName}' deleted successfully"
        ]);
    }

    /**
     * API: Get a single member
     * 
     * @group Members
     * @authenticated
     */
    public function apiShow(Member $member)
    {
        $member->load(['membershipPeriods' => function ($query) {
            $query->with('invoice:id,invoice_number,invoice_date,total,status')
                  ->orderBy('begin_date', 'desc');
        }]);

        return response()->json([
            'data' => $member
        ]);
    }

    /**
     * API: List all members with pagination
     * 
     * @group Members
     * @authenticated
     */
    public function apiIndex(Request $request)
    {
        $search = $request->get('search');
        $memberType = $request->get('member_type');
        $perPage = $request->get('per_page', 15);

        $query = Member::query()
            ->select([
                'id', 'member_type', 'first_name', 'last_name', 'email', 'phone1', 
                'city', 'state', 'user_id', 'created_at', 'updated_at'
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

        return response()->json($members);
    }
}
