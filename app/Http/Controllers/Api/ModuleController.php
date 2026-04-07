<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use Illuminate\Http\JsonResponse;

class ModuleController extends Controller
{
    /**
     * Return a single module with its lessons.
     *
     * @todo Implement fully in Phase 2.
     */
    public function show(Module $module): JsonResponse
    {
        $module->load('lessons');

        return response()->json([
            'module' => $module,
        ]);
    }
}
