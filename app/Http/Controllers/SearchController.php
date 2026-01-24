<?php

namespace App\Http\Controllers;

use App\Models\Deed;
use App\Models\Event;
use App\Models\EventRSVP;
use App\Models\Member;
use App\Models\ParentModel;
use App\Models\Student;
use App\Models\Yahrzeit;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function globalSearch(Request $request)
    {
        $query = $request->input('q', '');
        
        if (strlen($query) < 2) {
            return response()->json([
                'members' => [],
                'students' => [],
                'parents' => [],
                'deeds' => [],
                'yahrzeits' => [],
                'event_rsvps' => [],
            ]);
        }

        $limit = 5;

        // Search Members
        $members = Member::where(function ($q) use ($query) {
            $q->where('first_name', 'like', "%{$query}%")
              ->orWhere('last_name', 'like', "%{$query}%")
              ->orWhere('email', 'like', "%{$query}%")
              ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ["%{$query}%"]);
        })
        ->select('id', 'first_name', 'last_name', 'email', 'phone1', 'member_type')
        ->limit($limit)
        ->get()
        ->map(function ($member) {
            return [
                'id' => $member->id,
                'name' => trim("{$member->first_name} {$member->last_name}"),
                'email' => $member->email,
                'phone' => $member->phone1,
                'type' => $member->member_type,
                'url' => route('members.show', $member->id),
            ];
        });

        // Search Students
        $students = Student::where(function ($q) use ($query) {
            $q->where('first_name', 'like', "%{$query}%")
              ->orWhere('last_name', 'like', "%{$query}%")
              ->orWhere('email', 'like', "%{$query}%")
              ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ["%{$query}%"]);
        })
        ->with('parent:id,first_name,last_name')
        ->select('id', 'first_name', 'last_name', 'email', 'parent_id', 'date_of_birth')
        ->limit($limit)
        ->get()
        ->map(function ($student) {
            $parentName = $student->parent 
                ? trim("{$student->parent->first_name} {$student->parent->last_name}")
                : null;
            
            return [
                'id' => $student->id,
                'name' => trim("{$student->first_name} {$student->last_name}"),
                'email' => $student->email,
                'parent' => $parentName,
                'dob' => $student->date_of_birth,
                'url' => route('admin.school.students.show', $student->id),
            ];
        });

        // Search Parents
        $parents = ParentModel::where(function ($q) use ($query) {
            $q->where('first_name', 'like', "%{$query}%")
              ->orWhere('last_name', 'like', "%{$query}%")
              ->orWhere('email', 'like', "%{$query}%")
              ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ["%{$query}%"]);
        })
        ->select('id', 'first_name', 'last_name', 'email', 'phone')
        ->limit($limit)
        ->get()
        ->map(function ($parent) {
            return [
                'id' => $parent->id,
                'name' => trim("{$parent->first_name} {$parent->last_name}"),
                'email' => $parent->email,
                'phone' => $parent->phone,
                'url' => route('admin.school.parents.show', $parent->id),
            ];
        });

        // Search Deeds
        $deeds = Deed::where(function ($q) use ($query) {
            $q->where('deed_number', 'like', "%{$query}%")
              ->orWhereHas('member', function ($q) use ($query) {
                  $q->where('first_name', 'like', "%{$query}%")
                    ->orWhere('last_name', 'like', "%{$query}%")
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ["%{$query}%"]);
              });
        })
        ->with('member:id,first_name,last_name')
        ->select('id', 'deed_number', 'member_id', 'purchase_date', 'occupied')
        ->limit($limit)
        ->get()
        ->map(function ($deed) {
            $ownerName = $deed->member 
                ? trim("{$deed->member->first_name} {$deed->member->last_name}")
                : null;
            
            return [
                'id' => $deed->id,
                'number' => $deed->deed_number,
                'owner' => $ownerName,
                'occupied' => $deed->occupied,
                'purchase_date' => $deed->purchase_date?->format('Y-m-d'),
                'url' => route('deeds.show', $deed->id),
            ];
        });

        // Search Yahrzeits
        $yahrzeits = Yahrzeit::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
              ->orWhere('hebrew_name', 'like', "%{$query}%");
        })
        ->select('id', 'name', 'hebrew_name', 'date_of_death', 'hebrew_day_of_death', 'hebrew_month_of_death')
        ->limit($limit)
        ->get()
        ->map(function ($yahrzeit) {
            return [
                'id' => $yahrzeit->id,
                'name' => $yahrzeit->name,
                'hebrew_name' => $yahrzeit->hebrew_name,
                'date' => $yahrzeit->date_of_death?->format('Y-m-d'),
                'url' => route('yahrzeits.show', $yahrzeit->id),
            ];
        });

        // Search Event RSVPs
        $eventRsvps = EventRSVP::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
              ->orWhere('email', 'like', "%{$query}%");
        })
        ->with(['event:id,title', 'member:id,first_name,last_name'])
        ->select('id', 'name', 'email', 'event_id', 'member_id', 'status', 'guests')
        ->limit($limit)
        ->get()
        ->map(function ($rsvp) {
            return [
                'id' => $rsvp->id,
                'name' => $rsvp->name,
                'email' => $rsvp->email,
                'event' => $rsvp->event?->title,
                'status' => $rsvp->status,
                'guests' => $rsvp->guests,
                'url' => route('events.show', $rsvp->event_id) . '#rsvp-' . $rsvp->id,
            ];
        });

        return response()->json([
            'members' => $members,
            'students' => $students,
            'parents' => $parents,
            'deeds' => $deeds,
            'yahrzeits' => $yahrzeits,
            'event_rsvps' => $eventRsvps,
        ]);
    }
}
