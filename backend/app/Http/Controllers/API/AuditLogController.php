<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $logs = AuditLog::with('user:id,name,avatar')
            ->when($request->user_id,  fn($q, $u) => $q->where('user_id', $u))
            ->when($request->action,   fn($q, $a) => $q->where('action', $a))
            ->when($request->date,     fn($q, $d) => $q->whereDate('created_at', $d))
            ->latest('created_at')
            ->paginate($request->per_page ?? 30);

        return response()->json(['logs' => $logs]);
    }
}
