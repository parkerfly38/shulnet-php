<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use Illuminate\Http\Request;
use Dedoc\Scramble\Attributes\Group;

#[Group('School Management')]
class TeacherController extends Controller
{
    /**
     *  Get a paginated list of teachers
     *
     * @group Teachers
     *
     * @authenticated
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 25);
        $q = $request->input('q');

        $query = Teacher::query();
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
     *  Get a single teacher
     *
     * @group Teachers
     *
     * @authenticated
     */
    public function show($id)
    {
        return response()->json(Teacher::findOrFail($id));
    }

    /**
     *  Create a new teacher
     *
     * @group Teachers
     *
     * @authenticated
     */
    public function store(Request $request)
    {
        $data = $request->validate(['first_name' => 'nullable|string', 'last_name' => 'nullable|string', 'email' => 'nullable|email', 'phone' => 'nullable|string']);
        $model = Teacher::create($data);

        return response()->json($model, 201);
    }

    /**
     *  Update an existing teacher
     *
     * @group Teachers
     *
     * @authenticated
     */
    public function update(Request $request, $id)
    {
        $model = Teacher::findOrFail($id);
        $data = $request->validate(['first_name' => 'nullable|string', 'last_name' => 'nullable|string', 'email' => 'nullable|email', 'phone' => 'nullable|string']);
        $model->update($data);

        return response()->json($model);
    }

    /**
     *  Delete a teacher
     *
     * @group Teachers
     *
     * @authenticated
     */
    public function destroy($id)
    {
        $model = Teacher::findOrFail($id);
        $model->delete();

        return response()->json(null, 204);
    }
}
