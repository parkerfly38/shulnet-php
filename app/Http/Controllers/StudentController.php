<?php

namespace App\Http\Controllers;

use App\Imports\StudentsImport;
use App\Models\Student;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Dedoc\Scramble\Attributes\Group;

#[Group('School Management')]
class StudentController extends Controller
{
    /**
     *  Get a paginated list of students
     *
     * @group Students
     *
     * @authenticated
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 25);
        $q = $request->input('q');

        $query = Student::with('parents');
        if ($q) {
            $query->where(function ($s) use ($q) {
                $s->where('first_name', 'like', "%{$q}%")
                    ->orWhere('last_name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        return response()->json($query->paginate($perPage));
    }

    /**
     *  Get a single student
     *
     * @group Students
     *
     * @authenticated
     */
    public function show($id)
    {
        $student = Student::with('parents')->findOrFail($id);
        return response()->json($student);
    }

    /**
     *  Create a new student
     *
     * @group Students
     *
     * @authenticated
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => 'nullable|string',
            'last_name' => 'nullable|string',
            'middle_name' => 'nullable|string',
            'gender' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'dob' => 'nullable|date',
            'address' => 'nullable|string',
            'picture_url' => 'nullable|string',
            'email' => 'nullable|email',
            'is_parent_email' => 'nullable|boolean',
            'parent_ids' => 'nullable|array',
            'parent_ids.*' => 'integer|exists:parents,id',
        ]);
        
        $parentIds = $data['parent_ids'] ?? [];
        unset($data['parent_ids']);
        
        $model = Student::create($data);
        
        if (!empty($parentIds)) {
            $model->parents()->sync($parentIds);
        }
        
        $model->load('parents');

        if (!empty($parentIds)) {
            $model->parents()->sync($parentIds);
        }

        $model->load('parents');

        if ($request->header('X-Inertia')) {
            return redirect()->route('admin.school.students.index')
                ->with('success', 'Student created successfully.');
        }

        return response()->json($model, 201);
    }

    /**
     *  Update an existing student
     *
     * @group Students
     *
     * @authenticated
     */
    public function update(Request $request, $id)
    {
        $model = Student::findOrFail($id);
        $data = $request->validate([
            'first_name' => 'nullable|string',
            'last_name' => 'nullable|string',
            'middle_name' => 'nullable|string',
            'gender' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'dob' => 'nullable|date',
            'address' => 'nullable|string',
            'picture_url' => 'nullable|string',
            'email' => 'nullable|email',
            'is_parent_email' => 'nullable|boolean',
            'parent_ids' => 'nullable|array',
            'parent_ids.*' => 'integer|exists:parents,id',
        ]);
        
        $parentIds = $data['parent_ids'] ?? [];
        unset($data['parent_ids']);
        
        $model->update($data);
        
        $model->parents()->sync($parentIds);
        $model->load('parents');

        $model->parents()->sync($parentIds);
        $model->load('parents');

        if ($request->header('X-Inertia')) {
            return redirect()->route('admin.school.students.show', $id)
                ->with('success', 'Student updated successfully.');
        }

        return response()->json($model);
    }

    /**
     *  Delete a student
     *
     * @group Students
     *
     * @authenticated
     */
    public function destroy(Request $request, $id)
    {
        $model = Student::findOrFail($id);
        $model->delete();

        if ($request->header('X-Inertia')) {
            return redirect()->route('admin.school.students.index')
                ->with('success', 'Student deleted successfully.');
        }

        return response()->json(null, 204);
    }

    /**
     * Import students from CSV/Excel file
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240', // Max 10MB
        ]);

        try {
            $import = new StudentsImport;
            Excel::import($import, $request->file('file'));

            $errors = $import->getErrors();

            return back()->with([
                'success' => sprintf(
                    'Import completed! %d students imported, %d updated.',
                    $import->getImported(),
                    $import->getUpdated()
                ),
                'import_errors' => $errors,
            ]);
        } catch (\Exception $e) {
            return back()->with('error', 'Import failed: '.$e->getMessage());
        }
    }

    /**
     * Download a sample CSV template for importing students
     */
    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="students-import-template.csv"',
        ];

        $columns = [
            'first_name',
            'last_name',
            'middle_name',
            'email',
            'gender',
            'date_of_birth',
            'dob',
            'address',
            'is_parent_email',
            'parent_id',
        ];

        $callback = function () use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            // Add a sample row
            fputcsv($file, [
                'Sarah',
                'Cohen',
                'Rachel',
                'sarah.cohen@example.com',
                'female',
                '2015-06-15',
                '2015-06-15',
                '456 Oak Avenue, Springfield, IL 62701',
                '1',
                '',
            ]);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
