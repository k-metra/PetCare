<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'create:admin {--name=} {--email=} {--password=} {--role=admin}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new admin or staff user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = $this->option('name') ?? $this->ask('Name');
        $email = $this->option('email') ?? $this->ask('Email');
        $password = $this->option('password') ?? $this->secret('Password');
        $role = $this->option('role');

        // Validate role
        if (!in_array($role, ['admin', 'staff'])) {
            $role = $this->choice('Role', ['admin', 'staff'], 'admin');
        }

        // Check if user already exists
        if (\App\Models\User::where('email', $email)->exists()) {
            $this->error('User with this email already exists!');
            return 1;
        }

        // Create the user
        $user = \App\Models\User::create([
            'name' => $name,
            'email' => $email,
            'password' => bcrypt($password),
            'role' => $role,
            'email_verified_at' => now(),
        ]);

        $this->info("✅ {$role} user created successfully!");
        $this->line("📧 Email: {$email}");
        $this->line("👤 Role: {$role}");
        $this->line("🔑 Password: (hidden for security)");
        
        return 0;
    }
}
