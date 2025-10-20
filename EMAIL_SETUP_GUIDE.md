# Email Configuration Guide for PetCare

## Overview
This guide helps you configure real email sending for the PetCare application instead of using Mailtrap for development.

## Email Service Options

### Option 1: Gmail (Recommended for Small Scale)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication

#### Step 2: Generate App Password
1. Go to Google Account > Security > 2-Step Verification
2. Click "App passwords" at the bottom
3. Select "Mail" and "Other (custom name)"
4. Enter "PetCare Laravel" as the name
5. Copy the generated 16-character password

#### Step 3: Update .env file
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-gmail@gmail.com
MAIL_FROM_NAME="PetCare Clinic"
```

### Option 2: Outlook/Hotmail

#### Step 1: Enable App Passwords (if 2FA enabled)
1. Go to Microsoft Account Security
2. Advanced security options > App passwords
3. Create new app password for "PetCare"

#### Step 2: Update .env file
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USERNAME=your-email@outlook.com
MAIL_PASSWORD=your-password-or-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@outlook.com
MAIL_FROM_NAME="PetCare Clinic"
```

### Option 3: Custom SMTP Server

#### For hosting providers like cPanel, Plesk, etc.
```env
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="PetCare Clinic"
```

### Option 4: SendGrid (Professional Email Service)

#### Step 1: Create SendGrid Account
1. Sign up at https://sendgrid.com
2. Create an API key in Settings > API Keys
3. Choose "Restricted Access" and enable "Mail Send"

#### Step 2: Update .env file
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="PetCare Clinic"
```

### Option 5: Mailgun (Popular for Laravel)

#### Step 1: Create Mailgun Account
1. Sign up at https://www.mailgun.com
2. Add and verify your domain
3. Get your API key from Dashboard

#### Step 2: Update .env file
```env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=your-domain.com
MAILGUN_SECRET=your-mailgun-api-key
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="PetCare Clinic"
```

## Quick Setup Instructions

### For Gmail (Most Common)

1. **Enable 2FA** on your Gmail account
2. **Generate App Password**:
   - Google Account > Security > 2-Step Verification > App passwords
   - Create password for "PetCare"
3. **Update your .env file**:
```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=youremail@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=youremail@gmail.com
MAIL_FROM_NAME="PetCare Clinic"
```

4. **Test the configuration**:
```bash
php artisan tinker
Mail::raw('Test email', function($message) {
    $message->to('test@example.com')->subject('Test');
});
```

## Environment Variables Explained

- `MAIL_MAILER`: Transport method (smtp, mailgun, ses)
- `MAIL_HOST`: SMTP server hostname
- `MAIL_PORT`: SMTP port (587 for TLS, 465 for SSL, 25 for no encryption)
- `MAIL_USERNAME`: Your email username/address
- `MAIL_PASSWORD`: Your email password or app password
- `MAIL_ENCRYPTION`: Encryption type (tls, ssl, or null)
- `MAIL_FROM_ADDRESS`: Default sender email address
- `MAIL_FROM_NAME`: Default sender name

## Common Ports

- **587**: TLS (recommended)
- **465**: SSL
- **25**: No encryption (not recommended)
- **2525**: Alternative port (some hosting providers)

## Troubleshooting

### Gmail Issues
- **Error**: "Username and Password not accepted"
  - **Solution**: Enable 2FA and use App Password, not your regular password

- **Error**: "Less secure app access"
  - **Solution**: Use App Password instead of enabling less secure apps

### General SMTP Issues
- **Connection timeout**: Check firewall and port settings
- **Authentication failed**: Verify username/password
- **TLS/SSL errors**: Try different ports (587 vs 465)

### Testing Email Configuration
```bash
# Test email configuration
php artisan tinker

# Send test email
\Mail::raw('This is a test email from PetCare', function($message) {
    $message->to('your-email@example.com')
            ->subject('PetCare Test Email');
});

# Check mail configuration
config('mail')
```

## Security Best Practices

1. **Use App Passwords**: Never use your main email password
2. **Environment Variables**: Keep credentials in .env file, not in code
3. **Dedicated Email**: Consider using a dedicated email for system notifications
4. **Rate Limiting**: Be aware of email provider limits (Gmail: 500/day)

## Queue Configuration (Optional)

For better performance, configure email queues:

```env
QUEUE_CONNECTION=database
```

Then run the queue worker:
```bash
php artisan queue:work
```

## Production Considerations

### For Production Servers:
1. **Use Professional Email Services**: SendGrid, Mailgun, SES
2. **Domain Authentication**: Set up SPF, DKIM, DMARC records
3. **Dedicated IP**: Consider dedicated IP for better deliverability
4. **Monitoring**: Set up email delivery monitoring
5. **Backup SMTP**: Configure backup email service

### Rate Limits by Provider:
- **Gmail**: 500 emails/day (free), 2000/day (paid)
- **Outlook**: 300 emails/day
- **SendGrid**: 100 emails/day (free), unlimited (paid)
- **Mailgun**: 5000 emails/month (free)

## Example Production .env

```env
# Production Email Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@petcare.com
MAIL_FROM_NAME="PetCare Veterinary Clinic"

# Queue for better performance
QUEUE_CONNECTION=database
```

Choose the email service that best fits your needs and follow the corresponding setup instructions!