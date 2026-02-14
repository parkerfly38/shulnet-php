<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
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
}
