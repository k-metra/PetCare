<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New Message from PetMedics Contact Form</title>

        <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
     }

        body {
      font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    background-color: #f4f4f4;
    padding: 20px;
}

.header {
    background: linear-gradient(135deg, #467178 0%, #2b95a6 100%);
    color: white;
    padding: 30px 20px;
    text-align: center;
}

.header h1 {
    margin: 0;
    font-size: 28px;
    text-align: center;
    font-weight: bold;
}

.content {
    padding: 30px;
}
    </style>
    </head>
    <body>
        <div class="header">
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="{{ asset('assets/home/pet_medics_logo.png') }}" alt="PetMedics Logo" style="max-height: 60px; width: auto;" />
            </div>
            <h1>New Message from PetMedics Contact Form</h1>
            <p>PetMedics received a new e-mail via the contact form!</p>
        </div>
        
        <div class="content">
            <p><strong>Name:</strong> {{ $contactFormData['name'] }}</p>
            <p><strong>Email:</strong> {{ $contactFormData['email'] }}</p>
            <p><strong>Message:</strong></p>
            <p>{{ $contactFormData['message'] }}</p>
        </div>
    </body>
</html>