# PetCare Appointment Booking API Integration

## Overview
This document outlines the complete integration between the React frontend and Laravel backend for the appointment booking system.

## Backend API Endpoints

### Base URL
```
http://127.0.0.1:8000/api
```

### Authentication
All appointment endpoints require Bearer token authentication:
```
Authorization: Bearer {token}
```

### Available Endpoints

#### 1. Create Appointment
**POST** `/appointments`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}
Accept: application/json
```

**Request Body:**
```json
{
  "appointment_date": "2025-10-23",
  "appointment_time": "9:00 AM",
  "pets": [
    {
      "type": "dog",
      "breed": "Labrador Retriever"
    },
    {
      "type": "cat", 
      "breed": "Persian"
    }
  ],
  "services": [
    "Pet Grooming",
    "Health Checkups"
  ],
  "notes": "Special instructions (optional)"
}
```

**Success Response (201):**
```json
{
  "status": true,
  "message": "Appointment scheduled successfully",
  "appointment": {
    "id": 1,
    "user_id": 1,
    "appointment_date": "2025-10-23",
    "appointment_time": "9:00 AM", 
    "status": "pending",
    "notes": null,
    "created_at": "2025-10-20T12:00:00.000000Z",
    "updated_at": "2025-10-20T12:00:00.000000Z",
    "pets": [
      {
        "id": 1,
        "appointment_id": 1,
        "type": "dog",
        "breed": "Labrador Retriever"
      }
    ],
    "services": [
      {
        "id": 1,
        "name": "Pet Grooming",
        "description": "Professional pet grooming services...",
        "price": "50.00"
      }
    ]
  }
}
```

**Error Response (422):**
```json
{
  "status": false,
  "message": "Validation failed",
  "errors": {
    "appointment_date": ["The appointment date field is required."]
  }
}
```

#### 2. Get User Appointments
**GET** `/appointments`

**Response:**
```json
{
  "status": true,
  "appointments": [
    {
      "id": 1,
      "appointment_date": "2025-10-23",
      "appointment_time": "9:00 AM",
      "status": "pending",
      "pets": [...],
      "services": [...]
    }
  ]
}
```

#### 3. Get Available Services
**GET** `/services`

**Response:**
```json
{
  "status": true,
  "services": [
    {
      "id": 1,
      "name": "Pet Grooming",
      "description": "Professional pet grooming services...",
      "price": "50.00"
    },
    {
      "id": 2,
      "name": "Health Checkups", 
      "description": "Comprehensive health examinations...",
      "price": "75.00"
    }
  ]
}
```

## Database Schema

### Tables Created:
1. **appointments** - Main appointment records
2. **pets** - Pet information for each appointment
3. **services** - Available veterinary services
4. **appointment_service** - Many-to-many pivot table

### Key Relationships:
- User **has many** Appointments
- Appointment **has many** Pets
- Appointment **belongs to many** Services (many-to-many)

## Frontend Integration

### Key Changes Made:
1. **API Integration**: Updated `setAppointment.tsx` to call Laravel API
2. **Error Handling**: Added proper error handling and validation feedback
3. **Loading States**: Added loading indicator during form submission
4. **Authentication**: Integrated with existing token-based authentication

### Usage Example:
```typescript
const appointmentPayload = {
  appointment_date: selectedDate.toISOString().split('T')[0],
  appointment_time: selectedTime,
  pets: pets.map(pet => ({
    type: pet.type,
    breed: pet.breed
  })),
  services: selectedServices
};

const response = await fetch('http://127.0.0.1:8000/api/appointments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  },
  body: JSON.stringify(appointmentPayload)
});
```

## Business Rules Implemented

### Backend Validation:
- **Date Validation**: No appointments on Sundays or past dates
- **Pet Validation**: 1-5 pets per appointment, valid types (dog/cat)
- **Service Validation**: At least one service must be selected
- **Authentication**: User must be logged in and verified

### Frontend Validation:
- **Date Picker**: Automatically disables Sundays and past dates
- **Time Slots**: Limited to clinic hours (8 AM - 3 PM)
- **Form Validation**: All required fields must be completed

## Testing the Integration

### Prerequisites:
1. Laravel backend running on `http://127.0.0.1:8000`
2. React frontend running on `http://localhost:3000`
3. User account created and verified
4. User logged in with valid token

### Test Flow:
1. Navigate to `/set-appointment`
2. Select a valid future date (not Sunday)
3. Choose a time slot (8 AM - 3 PM)
4. Add pet details (type and breed)
5. Select one or more services
6. Submit the form
7. Verify success message and database record

## Next Steps (Optional Enhancements)

1. **Appointment Management**: Add view/edit/cancel functionality
2. **Email Notifications**: Send confirmation emails
3. **Calendar View**: Display appointments in calendar format
4. **Payment Integration**: Add payment processing
5. **Admin Panel**: Allow staff to manage appointments
6. **Real-time Updates**: WebSocket notifications for appointment status changes

## Security Considerations

- All appointment endpoints require authentication
- Input validation on both frontend and backend
- CSRF protection enabled
- SQL injection prevention through Eloquent ORM
- XSS protection through proper data sanitization