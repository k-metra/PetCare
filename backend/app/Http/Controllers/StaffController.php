<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class StaffController extends Controller
{
    /**
     * Display a listing of staff members.
     */
    public function index(): JsonResponse
    {
        try {
            $staff = User::whereIn('role', ['staff', 'admin'])
                ->select('id', 'name', 'email', 'phone', 'role', 'created_at')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => true,
                'message' => 'Staff members retrieved successfully',
                'staff' => $staff
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve staff members',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created staff member.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'phone' => 'nullable|string|max:20',
                'role' => 'required|in:staff,admin',
                'password' => 'required|string|min:8',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $staff = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'role' => $request->role,
                'password' => Hash::make($request->password),
                'email_verified_at' => now(), // Auto-verify staff accounts
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Staff member created successfully',
                'staff' => $staff->only(['id', 'name', 'email', 'phone', 'role', 'created_at'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to create staff member',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified staff member.
     */
    public function show($id): JsonResponse
    {
        try {
            $staff = User::whereIn('role', ['staff', 'admin'])
                ->select('id', 'name', 'email', 'phone', 'role', 'created_at')
                ->findOrFail($id);

            return response()->json([
                'status' => true,
                'message' => 'Staff member retrieved successfully',
                'staff' => $staff
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Staff member not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified staff member.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $staff = User::whereIn('role', ['staff', 'admin'])->findOrFail($id);
            $currentUser = auth()->user();

            // Prevent admin from editing their own account
            if ($currentUser->id == $id) {
                return response()->json([
                    'status' => false,
                    'message' => 'You cannot edit your own account. Please ask another administrator to make changes.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => [
                    'required',
                    'string',
                    'email',
                    'max:255',
                    Rule::unique('users')->ignore($staff->id),
                ],
                'phone' => 'nullable|string|max:20',
                'role' => 'required|in:staff,admin',
                'password' => 'nullable|string|min:8',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'role' => $request->role,
            ];

            // Only update password if provided
            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $staff->update($updateData);

            return response()->json([
                'status' => true,
                'message' => 'Staff member updated successfully',
                'staff' => $staff->only(['id', 'name', 'email', 'phone', 'role', 'created_at'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to update staff member',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified staff member.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $staff = User::whereIn('role', ['staff', 'admin'])->findOrFail($id);
            $currentUser = auth()->user();

            // Prevent deletion of their own account
            if ($currentUser->id == $id) {
                return response()->json([
                    'status' => false,
                    'message' => 'You cannot delete your own account. Please ask another administrator.'
                ], 403);
            }

            // Prevent deletion of the main admin account
            $mainAdminEmail = env('MAIN_ADMIN_EMAIL', 'admin@petcare.com');
            if ($staff->email === $mainAdminEmail) {
                return response()->json([
                    'status' => false,
                    'message' => 'Cannot delete the main administrator account'
                ], 403);
            }

            $staff->delete();

            return response()->json([
                'status' => true,
                'message' => 'Staff member deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete staff member',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}