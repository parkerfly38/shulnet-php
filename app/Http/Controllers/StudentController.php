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

        $query = Student::query();
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
        return response()->json(Student::findOrFail($id));
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
        $data = $request->validate(['first_name' => 'nullable|string', 'last_name' => 'nullable|string', 'dob' => 'nullable|date', 'parent_id' => 'nullable|integer', 'email' => 'nullable|email', 'phone' => 'nullable|string']);
        $model = Student::create($data);

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
        $data = $request->validate(['first_name' => 'nullable|string', 'last_name' => 'nullable|string', 'dob' => 'nullable|date', 'parent_id' => 'nullable|integer', 'email' => 'nullable|email', 'phone' => 'nullable|string']);
        $model->update($data);

        return response()->json($model);
    }

    /**
     *  Delete a student
     *
     * @group Students
     *
     * @authenticated
     */
    public function destroy($id)
    {
        $model = Student::findOrFail($id);
        $model->delete();

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
