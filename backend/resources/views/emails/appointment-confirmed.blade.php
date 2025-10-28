<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Confirmed - PetCare Clinic</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .content {
            padding: 30px;
        }
        .appointment-card {
            background-color: #f8f9fa;
            border-left: 4px solid #28a745;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .appointment-detail {
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .appointment-detail:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #495057;
        }
        .value {
            color: #6c757d;
        }
        .pet-section {
            background-color: #e3f2fd;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
            border-left: 4px solid #2196f3;
        }
        .pet-item {
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #bbdefb;
        }
        .pet-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .service-list {
            list-style: none;
            padding: 0;
        }
        .service-item {
            background-color: #fff3cd;
            padding: 8px 12px;
            margin: 5px 0;
            border-radius: 4px;
            border-left: 3px solid #ffc107;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
        .contact-info {
            background-color: #e8f5e8;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="{{ asset('assets/home/pet_medics_logo.png') }}" alt="PetMedics Logo" style="max-height: 60px; width: auto;">
            </div>
            <h1>🎉 Appointment Confirmed!</h1>
            <p>Your pet's appointment has been confirmed</p>
        </div>

        <div class="content">
            <p>Dear {{ $appointment->user->name }},</p>
            
            <p>Great news! Your appointment at <strong>PetMedics Veterinary Clinic</strong> has been <strong style="color: #28a745;">confirmed</strong>. We're looking forward to taking care of your beloved pet(s).</p>

            <div class="appointment-card">
                <h3 style="margin-top: 0; color: #28a745;">📅 Appointment Details</h3>
                
                <div class="appointment-detail">
                    <span class="label">Appointment ID:</span>
                    <span class="value">#{{ $appointment->id }}</span>
                </div>
                
                <div class="appointment-detail">
                    <span class="label">Date:</span>
                    <span class="value">{{ \Carbon\Carbon::parse($appointment->appointment_date)->format('l, F j, Y') }}</span>
                </div>
                
                <div class="appointment-detail">
                    <span class="label">Time:</span>
                    <span class="value">{{ $appointment->appointment_time }}</span>
                </div>
                
                <div class="appointment-detail">
                    <span class="label">Status:</span>
                    <span class="value" style="color: #28a745; font-weight: bold;">✅ Confirmed</span>
                </div>
            </div>

            @if($appointment->pets && $appointment->pets->count() > 0)
            <div class="pet-section">
                <h4 style="margin-top: 0; color: #2196f3;">🐾 Pet Information</h4>
                @foreach($appointment->pets as $pet)
                <div class="pet-item">
                    <strong>{{ $pet->name }}</strong> ({{ ucfirst($pet->type) }})
                    <br><small>Breed: {{ $pet->breed }}</small>
                    @if($pet->grooming_details)
                        <br><small>Grooming: {{ is_string($pet->grooming_details) ? $pet->grooming_details : 'Special grooming requirements' }}</small>
                    @endif
                </div>
                @endforeach
            </div>
            @endif

            @if($appointment->services && $appointment->services->count() > 0)
            <div style="margin: 20px 0;">
                <h4 style="color: #ffc107;">🛍️ Services Booked</h4>
                <ul class="service-list">
                    @foreach($appointment->services as $service)
                    <li class="service-item">{{ $service->name }}</li>
                    @endforeach
                </ul>
            </div>
            @endif

            @if($appointment->notes)
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4 style="margin-top: 0;">📝 Special Notes</h4>
                <p style="margin-bottom: 0;">{{ $appointment->notes }}</p>
            </div>
            @endif

            <div class="contact-info">
                <h4 style="margin-top: 0; color: #495057;">📞 Need to make changes?</h4>
                <p style="margin-bottom: 0;">
                    If you need to reschedule or have any questions, please contact us:<br>
                    <strong>Email:</strong> {{ config('mail.from.address') }}<br>
                    <strong>Phone:</strong> (555) 123-PETS
                </p>
            </div>

            <p style="margin: 30px 0;">
                <strong>What to bring:</strong><br>
                • Your pet's vaccination records<br>
                • Any previous medical records<br>
                • List of current medications<br>
                • Your pet's favorite treat or toy for comfort
            </p>

            <p>Thank you for choosing PetMedics Veterinary Clinic. We can't wait to meet your furry friend!</p>

            <p>Best regards,<br>
            <strong>The PetMedics Team</strong></p>
        </div>

        <div class="footer">
            <div style="text-align: center; margin-bottom: 15px;">
                <img src="{{ asset('assets/home/pet_medics_logo.png') }}" alt="PetMedics Logo" style="max-height: 40px; width: auto; opacity: 0.7;">
            </div>
            <p><strong>PetMedics Veterinary Clinic</strong></p>
            <p>Blk98 L8b, C.Arellano St. Ph2. Katarungan Village, Poblacion, Muntinlupa City</p>
            <p>Phone: (555) 123-PETS | Email: {{ config('mail.from.address') }}</p>
            <p style="font-size: 12px; margin-top: 15px;">
                This email was sent automatically. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>