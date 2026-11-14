<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /** Register a new student account */
    public function register(RegisterRequest $request): JsonResponse
    {
        $studentRole = Role::where('name', 'student')->firstOrFail();

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => $request->password,
            'role_id'  => $studentRole->id,
            'phone'    => $request->phone,
            'status'   => 'active',
        ]);

        // Create student profile with auto-generated ID
        $studentId = \App\Support\CodeGenerator::next(Student::class, 'student_id', 'STU-');
        Student::create([
            'user_id'         => $user->id,
            'student_id'      => $studentId,
            'enrollment_date' => now()->toDateString(),
        ]);

        AuditLog::create([
            'user_id'     => $user->id,
            'action'      => 'registered',
            'model_type'  => User::class,
            'model_id'    => $user->id,
            'description' => "New student {$user->name} registered.",
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->userAgent(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful.',
            'token'   => $token,
            'user'    => new UserResource($user->load('role', 'student')),
        ], 201);
    }

    /** Login with email + password */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::with('role', 'student', 'teacher', 'admin')
                    ->where('email', $request->email)
                    ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid email or password.'], 401);
        }

        if ($user->status === 'inactive') {
            return response()->json(['message' => 'Your account has been deactivated. Please contact admin.'], 403);
        }

        // Revoke all previous tokens on new login (unless remember_me)
        if (! $request->boolean('remember_me')) {
            $user->tokens()->delete();
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        AuditLog::create([
            'user_id'     => $user->id,
            'action'      => 'login',
            'description' => "{$user->name} logged in.",
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Login successful.',
            'token'   => $token,
            'user'    => new UserResource($user),
        ]);
    }

    /** Logout — revoke current token */
    public function logout(Request $request): JsonResponse
    {
        AuditLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'logout',
            'description' => "{$request->user()->name} logged out.",
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->userAgent(),
        ]);

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /** Get the authenticated user */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('role', 'student.department', 'teacher.department', 'admin');

        return response()->json(['user' => new UserResource($user)]);
    }

    /** Update authenticated user's own profile */
    public function updateProfile(Request $request): JsonResponse
    {
        $request->validate([
            'name'    => 'sometimes|string|max:255',
            'phone'   => 'sometimes|nullable|string|max:20',
            'address' => 'sometimes|nullable|string|max:500',
        ]);

        $user = $request->user();
        $user->update($request->only('name', 'phone', 'address'));

        return response()->json([
            'message' => 'Profile updated.',
            'user'    => new UserResource($user->fresh('role')),
        ]);
    }

    /** Change authenticated user's password */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->update(['password' => $request->password]);

        return response()->json(['message' => 'Password changed successfully.']);
    }

    /** Upload user avatar */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate(['avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048']);

        $user = $request->user();

        // Remove old avatar
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return response()->json([
            'message'    => 'Avatar uploaded.',
            'avatar_url' => asset('storage/' . $path),
        ]);
    }

    /** Send password-reset link (email simulation) */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $user  = \App\Models\User::where('email', $request->email)->first();
        $token = Str::random(64);

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['email' => $user->email, 'token' => $token, 'created_at' => now()]
        );

        // No mail server configured — return token directly so the demo reset flow works
        return response()->json([
            'message'     => 'Reset token generated.',
            'demo_token'  => $token,
            'email'       => $user->email,
        ]);
    }

    /** Reset password with token */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'                 => 'required|string',
            'email'                 => 'required|email',
            'password'              => 'required|string|min:8|confirmed',
        ]);

        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || $record->token !== $request->token) {
            return response()->json(['message' => 'Invalid or expired token.'], 400);
        }

        if (now()->diffInMinutes($record->created_at) > 60) {
            \Illuminate\Support\Facades\DB::table('password_reset_tokens')
                ->where('email', $request->email)->delete();
            return response()->json(['message' => 'Token has expired. Please request a new one.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->forceFill(['password' => Hash::make($request->password)])->save();

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password reset successfully.']);
    }
}
