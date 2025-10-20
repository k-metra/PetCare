# Logout Functionality Implementation Guide

## Overview
This guide documents the complete logout functionality implementation for the PetCare application, including both frontend and backend components.

## Backend Implementation

### API Endpoints

#### 1. Single Device Logout
```http
POST /api/logout
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
{
  "status": true,
  "message": "Logout successful"
}
```

#### 2. All Devices Logout
```http
POST /api/logout-all
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
{
  "status": true,
  "message": "Logout from all devices successful"
}
```

#### 3. Get Current User Info
```http
GET /api/user
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "email_verified_at": "2025-10-20T10:30:00.000000Z"
  }
}
```

### Controller Methods

The logout functionality is implemented in `UserController.php`:

```php
/**
 * Logout user and revoke current token
 */
public function logout(Request $request) {
    try {
        // Revoke current access token
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'status' => true, 
            'message' => 'Logout successful'
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'status' => false, 
            'message' => 'Logout failed', 
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Logout from all devices by revoking all tokens
 */
public function logoutAll(Request $request) {
    try {
        // Revoke all tokens for the user
        $request->user()->tokens()->delete();
        
        return response()->json([
            'status' => true, 
            'message' => 'Logout from all devices successful'
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'status' => false, 
            'message' => 'Logout from all devices failed', 
            'error' => $e->getMessage()
        ], 500);
    }
}
```

## Frontend Implementation

### 1. Authentication Utilities (`utils/auth.ts`)

```typescript
// Logout utility functions
export const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      clearAuthData();
      return { success: true, message: 'Already logged out' };
    }

    // Call logout API
    const response = await fetch('http://127.0.0.1:8000/api/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    
    // Clear local storage regardless of API response
    clearAuthData();
    
    return { 
      success: true, 
      message: data.message || 'Logout successful' 
    };
    
  } catch (error) {
    console.error('Logout error:', error);
    // Clear local storage even if API call fails
    clearAuthData();
    return { 
      success: true, 
      message: 'Logout successful (local)' 
    };
  }
};

export const logoutAll = async () => {
  // Similar implementation for logout all devices
};

const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
```

### 2. User Menu Component (`components/userMenu.tsx`)

A comprehensive dropdown menu that shows:
- User information (name, email, role)
- Account settings option
- Logout options (single device & all devices)

Key features:
- Click outside to close
- Loading states
- Role-based styling
- Responsive design

### 3. Logout Button Component (`components/logoutButton.tsx`)

A reusable logout button component with:
- Simple button mode
- Dropdown mode with multiple options
- Loading states
- Customizable styling

## Integration Points

### Header Component
- Displays UserMenu when user is logged in
- Shows user avatar and dropdown

### Navigation Component
- Desktop: Shows logout in main navigation
- Mobile: Shows logout in hamburger menu
- Conditional rendering based on authentication status

## User Experience Flow

### Normal Logout
1. User clicks logout button/option
2. API call to `/api/logout` with current token
3. Token is revoked on server
4. Local storage is cleared
5. User is redirected to home page
6. Page reloads to clear any cached state

### Logout All Devices
1. User selects "Logout All Devices" option
2. API call to `/api/logout-all` with current token
3. All user tokens are revoked on server
4. Local storage is cleared
5. User is redirected to home page
6. Page reloads to clear any cached state

## Security Features

### Token Management
- Tokens are properly revoked on server
- Local storage is always cleared
- Graceful handling of network failures
- Protection against token reuse

### Error Handling
- API failures don't prevent local logout
- User is always logged out locally
- Appropriate error messages
- Loading states prevent double-clicks

## Testing the Implementation

### Manual Testing
1. **Login** to the application
2. **Check header** - Should show user menu
3. **Click user menu** - Should show dropdown with user info
4. **Test single logout** - Should logout and redirect
5. **Login again** and **test logout all** - Should logout from all devices

### API Testing
```bash
# Test logout endpoint
curl -X POST http://127.0.0.1:8000/api/logout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Test logout all endpoint
curl -X POST http://127.0.0.1:8000/api/logout-all \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

## Browser Developer Tools Testing
1. **Check localStorage** - Should contain token and user data when logged in
2. **After logout** - localStorage should be empty
3. **Network tab** - Should show successful API calls
4. **Console** - Should not show any errors

## Error Scenarios Handled

1. **Network failure** - Local logout still works
2. **Invalid token** - Graceful error handling
3. **Server unavailable** - User is logged out locally
4. **Token already expired** - Clean logout flow
5. **Multiple logout attempts** - Loading states prevent issues

## File Structure
```
frontend/src/
├── utils/
│   └── auth.ts                 # Authentication utilities
├── components/
│   ├── userMenu.tsx           # User dropdown menu
│   ├── logoutButton.tsx       # Reusable logout button
│   ├── header.tsx             # Updated with UserMenu
│   └── navbar.jsx             # Updated with logout options
backend/
├── app/Http/Controllers/Api/
│   └── UserController.php     # Logout methods added
└── routes/
    └── api.php                # Logout routes added
```

## Next Steps & Enhancements

### Possible Improvements
1. **Session timeout warnings** - Warn user before auto-logout
2. **Remember me functionality** - Longer-lived tokens
3. **Logout confirmation** - Ask before logging out
4. **Activity tracking** - Log login/logout activities
5. **Device management** - Show active sessions

### Security Enhancements
1. **Token refresh** - Automatic token renewal
2. **Concurrent session limits** - Limit active sessions
3. **Suspicious activity detection** - Auto-logout on unusual activity
4. **Two-factor authentication** - Extra security layer

The logout functionality is now fully implemented and provides a secure, user-friendly way to end user sessions in the PetCare application.