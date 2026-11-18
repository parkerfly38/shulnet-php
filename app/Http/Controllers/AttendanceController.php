<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Dedoc\Scramble\Attributes\Group;

#[Group('School Management')]
class AttendanceController extends Controller
{
    /**
     * Display a listing of attendances.
     * 
     * @authenticated
     */
    public function index(Request $request)
    {
        $query = Attendance::with(['student', 'classDefinition'])
            ->orderBy('attendance_date', 'desc')
            ->orderBy('created_at', 'desc');

        if ($request->has('date')) {
            $query->whereDate('attendance_date', $request->date);
        }

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('class_id')) {
            $query->where('class_definition_id', $request->class_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return $query->paginate(50);
    }

    /**
     *  Store a newly created attendance record
     * 
     * @authenticated
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.class_definition_id' => 'nullable|exists:class_definitions,id',
            'attendances.*.attendance_date' => 'required|date',
            'attendances.*.status' => 'required|in:present,absent,tardy,excused',
            'attendances.*.notes' => 'nullable|string',
        ]);

        $created = [];
        foreach ($validated['attendances'] as $data) {
            $classId = $data['class_definition_id'] ?? null;

            // Not updateOrCreate: "= NULL" never matches general (no-class) attendance, so each save duplicated it.
            $attendance = Attendance::where('student_id', $data['student_id'])
                ->whereDate('attendance_date', $data['attendance_date'])
                ->when($classId, fn ($q) => $q->where('class_definition_id', $classId), fn ($q) => $q->whereNull('class_definition_id'))
                ->first()
                ?? new Attendance([
                    'student_id' => $data['student_id'],
                    'attendance_date' => $data['attendance_date'],
                    'class_definition_id' => $classId,
                ]);

            $attendance->fill([
                'status' => $data['status'],
                'notes' => $data['notes'] ?? null,
            ])->save();

            $created[] = $attendance;
        }

        return response()->json($created, 201);
    }

    /**
     *  Display the specified attendance record.
     * 
     * @authenticated
     */
    public function show(string $id)
    {
        return Attendance::with(['student', 'classDefinition'])->findOrFail($id);
    }

    /**
     *  Update the specified attendance record.
     * 
     * @authenticated
     */
    public function update(Request $request, string $id)
    {
        $attendance = Attendance::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:present,absent,tardy,excused',
            'notes' => 'nullable|string',
        ]);

        $attendance->update($validated);

        return $attendance;
    }

    /**
     *  Remove the specified attendance record.
     * 
     * @authenticated
     */
    public function destroy(string $id)
    {
        //
    }
}
