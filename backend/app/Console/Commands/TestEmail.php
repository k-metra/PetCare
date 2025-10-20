<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Models\User;

class TestEmail extends Command
{
    protected $signature = 'test:email {email}';
    protected $description = 'Test email configuration by sending a test email';

    public function handle()
    {
        $email = $this->argument('email');
        
        try {
            Mail::raw('This is a test email from PetCare. If you receive this, your email configuration is working correctly!', function($message) use ($email) {
                $message->to($email)
                        ->subject('PetCare Email Configuration Test');
            });
            
            $this->info("✅ Test email sent successfully to: {$email}");
            $this->info("Check your inbox (and spam folder) for the test email.");
            
        } catch (\Exception $e) {
            $this->error("❌ Failed to send email: " . $e->getMessage());
            $this->info("Common solutions:");
            $this->info("1. Check your .env email configuration");
            $this->info("2. Make sure you're using an App Password for Gmail");
            $this->info("3. Verify your email provider settings");
        }
    }
}