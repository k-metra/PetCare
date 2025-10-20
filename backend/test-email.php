<?php

// Simple email test script
require_once 'vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "🧪 Testing Email Configuration\n";
echo "==============================\n\n";

echo "📧 Configuration:\n";
echo "MAIL_HOST: " . $_ENV['MAIL_HOST'] . "\n";
echo "MAIL_PORT: " . $_ENV['MAIL_PORT'] . "\n";
echo "MAIL_USERNAME: " . $_ENV['MAIL_USERNAME'] . "\n";
echo "MAIL_FROM_ADDRESS: " . $_ENV['MAIL_FROM_ADDRESS'] . "\n";
echo "MAIL_FROM_NAME: " . $_ENV['MAIL_FROM_NAME'] . "\n\n";

// Test email sending
use Illuminate\Support\Facades\Mail;

try {
    // Bootstrap Laravel
    $app = require_once 'bootstrap/app.php';
    $app->boot();
    
    echo "🚀 Sending test email...\n";
    
    Mail::raw('This is a test email from PetCare. Your email configuration is working!', function($message) {
        $message->to($_ENV['MAIL_USERNAME'])
                ->subject('PetCare Email Test - Success!')
                ->from($_ENV['MAIL_FROM_ADDRESS'], $_ENV['MAIL_FROM_NAME']);
    });
    
    echo "✅ Email sent successfully!\n";
    echo "📥 Check your inbox at: " . $_ENV['MAIL_USERNAME'] . "\n";
    echo "📧 Email will appear to come from: " . $_ENV['MAIL_FROM_ADDRESS'] . "\n";
    
} catch (Exception $e) {
    echo "❌ Error sending email: " . $e->getMessage() . "\n\n";
    echo "🔧 Troubleshooting tips:\n";
    echo "1. Make sure you have Gmail 2FA enabled\n";
    echo "2. Use an App Password (not your regular Gmail password)\n";
    echo "3. Check that your credentials are correct in .env\n";
    echo "4. Verify your Gmail allows 'Less secure app access' or use App Password\n";
}