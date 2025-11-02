<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Appointment Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration options for the appointment system
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Maximum Appointments Per Time Slot
    |--------------------------------------------------------------------------
    |
    | This value determines how many appointments can be booked for the same
    | date and time slot. This helps prevent overbooking and ensures
    | proper resource management.
    |
    */
    'max_appointments_per_slot' => env('MAX_APPOINTMENTS_PER_SLOT', 3),

    /*
    |--------------------------------------------------------------------------
    | Available Time Slots
    |--------------------------------------------------------------------------
    |
    | Define the available time slots for appointments. These should match
    | the time slots available in the frontend.
    |
    */
    'available_time_slots' => [
        '8:00 AM',
        '8:30 AM',
        '9:00 AM',
        '9:30 AM',
        '10:00 AM',
        '10:30 AM',
        '11:00 AM',
        '11:30 AM',
        '12:00 PM',
        '12:30 PM',
        '1:00 PM',
        '1:30 PM',
        '2:00 PM',
        '2:30 PM',
        '3:00 PM'
    ],

    /*
    |--------------------------------------------------------------------------
    | Clinic Hours
    |--------------------------------------------------------------------------
    |
    | Define the clinic operating hours
    |
    */
    'clinic_hours' => [
        'start' => '8:00 AM',
        'end' => '5:00 PM',
        'appointment_cutoff' => '3:00 PM',
    ],

    /*
    |--------------------------------------------------------------------------
    | Excluded Days
    |--------------------------------------------------------------------------
    |
    | Define which days of the week are excluded from booking
    | 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
    |
    */
    'excluded_days' => [
        0, // Sunday
    ],
];