<?php

namespace App\Http\Controllers;

use App\Models\ParentModel;
use Illuminate\Http\Request;
use Dedoc\Scramble\Attributes\Group;

#[Group('School Management')]
class ParentModelController extends Controller
{
    /**
     *  Get a paginated list of parents
     *
     * @group Parents
     *
     * @authenticated
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 25);
        $q = $request->input('q');

        $query = ParentModel::query();
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
     *  Get a single parent
     *
     * @group Parents
     *
     * @authenticated
     */
    public function show($id)
    {
        return response()->json(ParentModel::findOrFail($id));
    }

    /**
     *  Create a new parent
     *
     * @group Parents
     *
     * @authenticated
     */
    public function store(Request $request)
    {
        $data = $request->validate(['first_name' => 'nullable|string', 'last_name' => 'nullable|string', 'email' => 'nullable|email', 'phone' => 'nullable|string']);
        $model = ParentModel::create($data);

        return response()->json($model, 201);
    }

    /**
     *  Update an existing parent
     *
     * @group Parents
     *
     * @authenticated
     */
    public function update(Request $request, $id)
    {
        $model = ParentModel::findOrFail($id);
        $data = $request->validate(['first_name' => 'nullable|string', 'last_name' => 'nullable|string', 'email' => 'nullable|email', 'phone' => 'nullable|string']);
        $model->update($data);

        return response()->json($model);
    }

    /**
     *  Delete a parent
     *
     * @group Parents
     *
     * @authenticated
     */
    public function destroy($id)
    {
        $model = ParentModel::findOrFail($id);
        $model->delete();

        return response()->json(null, 204);
    }
}
