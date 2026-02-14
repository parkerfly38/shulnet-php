<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use Illuminate\Http\Request;
use Dedoc\Scramble\Attributes\Group;

#[Group('School Management')]
class ExamController extends Controller
{
    /**
     *  Get a paginated list of exams
     *
     * @group Exams
     *
     * @authenticated
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 25);
        $q = $request->input('q');

        $query = Exam::query();
        if ($q) {
            $query->where(function ($s) use ($q) {
                $s->where('name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        return response()->json($query->paginate($perPage));
    }

    /**
     *  Get a single exam
     *
     * @group Exams
     *
     * @authenticated
     */
    public function show($id)
    {
        return response()->json(Exam::findOrFail($id));
    }

    /**
     *  Create a new exam
     *
     * @group Exams
     *
     * @authenticated
     */
    public function store(Request $request)
    {
        $data = $request->validate(['name' => 'required|string', 'date' => 'nullable|date', 'description' => 'nullable|string']);
        $model = Exam::create($data);

        return response()->json($model, 201);
    }

    /**
     *  Update an existing exam
     *
     * @group Exams
     *
     * @authenticated
     */
    public function update(Request $request, $id)
    {
        $model = Exam::findOrFail($id);
        $data = $request->validate(['name' => 'required|string', 'date' => 'nullable|date', 'description' => 'nullable|string']);
        $model->update($data);

        return response()->json($model);
    }

    /**
     *  Delete an exam
     *
     * @group Exams
     *
     * @authenticated
     */
    public function destroy($id)
    {
        $model = Exam::findOrFail($id);
        $model->delete();

        return response()->json(null, 204);
    }
}
