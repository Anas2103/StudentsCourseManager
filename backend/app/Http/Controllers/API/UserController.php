<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\Admin;
use App\Models\Role;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with('role')
            ->when($request->search, fn($q, $s) =>
                $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")
            )
            ->when($request->role, fn($q, $r) =>
                $q->whereHas('role', fn($rq) => $rq->where('name', $r))
            )
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->latest();

        $paginator = $query->paginate($request->per_page ?? 15);
        return response()->json([
            'users' => [
                'data'         => UserResource::collection($paginator->items()),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'from'         => $paginator->firstItem(),
                'to'           => $paginator->lastItem(),
                'total'        => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $role = Role::where('name', $request->role)->firstOrFail();

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => $request->password,
            'role_id'  => $role->id,
            'phone'    => $request->phone,
            'status'   => $request->status ?? 'active',
        ]);

        // Create role-specific profile
        $this->createRoleProfile($user, $role->name);

        return response()->json([
            'message' => 'User created successfully.',
            'user'    => new UserResource($user->load('role')),
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($user->load('role', 'student.department', 'teacher.department', 'admin')),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user->update($request->only('name', 'email', 'phone', 'address', 'status'));

        return response()->json([
            'message' => 'User updated.',
            'user'    => new UserResource($user->fresh('role')),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete your own account.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }

    /** Toggle active/inactive status */
    public function toggleStatus(User $user): JsonResponse
    {
        $user->update(['status' => $user->status === 'active' ? 'inactive' : 'active']);

        return response()->json([
            'message' => "User {$user->status}.",
            'user'    => new UserResource($user->fresh('role')),
        ]);
    }

    /** Admin-reset a user's password */
    public function resetUserPassword(Request $request, User $user): JsonResponse
    {
        $request->validate(['password' => 'required|string|min:8|confirmed']);

        $user->update(['password' => $request->password]);

        return response()->json(['message' => 'Password reset successfully.']);
    }

    /** Assign a role to a user */
    public function assignRole(Request $request, User $user): JsonResponse
    {
        $request->validate(['role' => 'required|string|exists:roles,name']);

        $role = Role::where('name', $request->role)->firstOrFail();
        $user->update(['role_id' => $role->id]);

        return response()->json([
            'message' => 'Role assigned.',
            'user'    => new UserResource($user->fresh('role')),
        ]);
    }

    private function createRoleProfile(User $user, string $roleName): void
    {
        match ($roleName) {
            'student' => Student::create([
                'user_id'    => $user->id,
                'student_id' => \App\Support\CodeGenerator::next(Student::class, 'student_id', 'STU-'),
            ]),
            'teacher' => Teacher::create([
                'user_id'    => $user->id,
                'teacher_id' => \App\Support\CodeGenerator::next(Teacher::class, 'teacher_id', 'TCH-'),
            ]),
            'admin', 'super_admin' => Admin::create([
                'user_id'  => $user->id,
                'admin_id' => \App\Support\CodeGenerator::next(Admin::class, 'admin_id', 'ADM-'),
            ]),
            default => null,
        };
    }
}
