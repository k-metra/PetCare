<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;
use App\Mail\ContactFormMail;

class ContactFormController extends Controller
{

    /**
     * Store a newly created resource in storage.
     */
    public function mail(Request $request)
    {
        $validated_data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string',
        ]);

        try {
            Mail::to('petmedics.noreply@gmail.com')->send(new ContactFormMail($validated_data));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send contact form.' . $e->getMessage()], 500);
        }

        return response()->json(['message' => 'Contact form submitted successfully.'], 200);
    }

}
