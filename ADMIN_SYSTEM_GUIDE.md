# PetCare Admin System Setup Guide

## Overview
This guide explains how to set up and use the admin/staff system for the PetCare Laravel backend.

## User Roles

### 🔹 User (Default)
- Can book appointments
- Can view their own appointments
- Standard customer access

### 🔸 Staff
- Can view all appointments
- Can update appointment status (pending → confirmed → completed → cancelled)
- Can access dashboard statistics
- Limited administrative access

### 🔴 Admin
- Full staff permissions
- Can manage users (view all users, change user roles)
- Can promote users to staff or admin
- Full administrative access

## Quick Setup

### Default Admin Accounts Created
After running the seeder, you'll have these default accounts:

```
Admin Account:
Email: admin@petcare.com
Password: admin123
Role: admin

Staff Account:
Email: staff@petcare.com  
Password: staff123
Role: staff
```

**⚠️ IMPORTANT: Change these default passwords immediately in production!**

## Creating Admin/Staff Users

### Method 1: Using Artisan Command (Recommended)
```bash
# Interactive mode
php artisan create:admin

# With parameters
php artisan create:admin --name="John Admin" --email="john@admin.com" --password="securepass123" --role="admin"

# Create staff user
php artisan create:admin --name="Jane Staff" --email="jane@staff.com" --password="staffpass123" --role="staff"
```

### Method 2: Using Database Seeder
```bash
php artisan db:seed --class=AdminUserSeeder
```

### Method 3: Direct Database Insert
```sql
INSERT INTO users (name, email, password, role, email_verified_at, created_at, updated_at) 
VALUES ('Admin Name', 'admin@example.com', '$2y$12$hashed_password', 'admin', NOW(), NOW(), NOW());
```

## API Endpoints

### Admin/Staff Endpoints (require staff or admin role)

#### Get All Appointments
```http
GET /api/admin/appointments
Authorization: Bearer {token}
```

#### Update Appointment Status
```http
PUT /api/admin/appointments/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "confirmed" // pending, confirmed, completed, cancelled
}
```

#### Get Dashboard Statistics
```http
GET /api/admin/dashboard
Authorization: Bearer {token}
```

### Admin-Only Endpoints (require admin role)

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer {token}
```

#### Update User Role
```http
PUT /api/admin/users/{id}/role
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "staff" // user, staff, admin
}
```

## Role-Based Access Control

### Authentication Flow
1. User logs in with admin/staff credentials
2. Backend returns JWT token with user data including role
3. Frontend stores token and user role
4. Role is checked on each protected route

### Middleware Usage
The `CheckRole` middleware is used to protect admin routes:

```php
// Staff or Admin access
Route::middleware(['auth:sanctum', 'role:staff,admin'])->group(function () {
    // Routes here
});

// Admin only access  
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Routes here
});
```

### User Model Helper Methods
```php
$user->isAdmin();  // Returns true if role is 'admin'
$user->isStaff();  // Returns true if role is 'staff' or 'admin'
$user->isUser();   // Returns true if role is 'user'
```

## Frontend Integration

### Checking User Role
```typescript
const user = JSON.parse(localStorage.getItem('user') || '{}');
const isAdmin = user.role === 'admin';
const isStaff = ['staff', 'admin'].includes(user.role);
```

### Admin Dashboard Example
```typescript
const fetchAdminData = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://127.0.0.1:8000/api/admin/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  
  const data = await response.json();
  if (data.status) {
    console.log('Dashboard stats:', data.stats);
  }
};
```

## Security Considerations

### Password Security
- Use strong passwords for admin accounts
- Change default passwords immediately
- Consider implementing password policies
- Use bcrypt for password hashing (already implemented)

### Token Security
- JWT tokens include role information
- Tokens should be stored securely
- Implement token expiration
- Consider refresh token mechanism

### Role Validation
- Role validation happens on both frontend and backend
- Backend middleware provides final authorization
- Frontend role checks are for UI purposes only

## Database Schema Changes

### Users Table Addition
```sql
ALTER TABLE users ADD COLUMN role ENUM('user', 'staff', 'admin') DEFAULT 'user' AFTER email;
```

### Migration Files Created
- `add_role_to_users_table.php` - Adds role column
- Default roles: user, staff, admin

## Common Tasks

### Promoting a User to Staff
```bash
# Using artisan tinker
php artisan tinker
$user = App\Models\User::where('email', 'user@example.com')->first();
$user->role = 'staff';
$user->save();
```

### Viewing All Admin Users
```bash
php artisan tinker
App\Models\User::whereIn('role', ['staff', 'admin'])->get(['name', 'email', 'role']);
```

### Resetting Admin Password
```bash
php artisan tinker
$admin = App\Models\User::where('email', 'admin@petcare.com')->first();
$admin->password = bcrypt('newpassword123');
$admin->save();
```

## Error Handling

### Common Response Codes
- `401 Unauthorized` - No valid token provided
- `403 Forbidden` - Valid token but insufficient permissions
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Server-side errors

### Sample Error Responses
```json
{
  "status": false,
  "message": "Access denied. Insufficient permissions."
}
```

## Next Steps

### Recommended Enhancements
1. **Admin Dashboard UI** - Create React admin dashboard
2. **Activity Logging** - Log admin actions
3. **Role Permissions** - More granular permissions
4. **Two-Factor Authentication** - Extra security for admin accounts
5. **API Rate Limiting** - Protect against abuse
6. **Audit Trail** - Track changes made by admins

### Example Admin Dashboard Routes
```typescript
// Add these routes to your React app
<Route path="/admin" element={<AdminDashboard />} />
<Route path="/admin/appointments" element={<AppointmentManager />} />
<Route path="/admin/users" element={<UserManager />} />
<Route path="/admin/statistics" element={<Statistics />} />
```

## Troubleshooting

### Common Issues
1. **403 Forbidden**: Check if user has correct role
2. **Middleware not working**: Verify middleware registration in bootstrap/app.php
3. **Role not updating**: Clear application cache and check database

### Debugging Commands
```bash
# Check current user roles
php artisan tinker
App\Models\User::all(['email', 'role']);

# Test middleware
php artisan route:list --name=admin

# Clear cache
php artisan config:clear
php artisan route:clear
```

This admin system provides a solid foundation for managing your PetCare application with proper role-based access control and security measures.