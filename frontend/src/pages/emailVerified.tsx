import React, { useEffect, useState } from 'react';
import Header from '../components/header'
import home_image from '../assets/home/home_image.png'

export default function EmailVerified() {
    const [message, setMessage] = useState('');
    const URLParams = new URLSearchParams(window.location.search);

    const status = URLParams.get('status');

    useEffect(() => {
        switch (status) {
            case 'success':
                setMessage('Email verified successfully! You can now log in.');
                break;
            case 'invalid_link':
                setMessage('Invalid verification link.');
                break;
            case 'user_not_found':
                setMessage('User not found.');
                break;
            case 'already_verified':
                setMessage('Email is already verified.');
                break;
            case 'link_sent':
                setMessage('A new verification link has been sent to your email address.');
                break;
            default:
                setMessage('Unknown status.');
        }
    }, [status]);
    return (
        <>
            <Header />
            <main className="min-h-screen overflow-hidden flex justify-center items-center relative">
                <img src={home_image} alt="Home Image" className="w-full absolute h-full object-cover mt-16"></img>
                <div className="bg-gradient-to-tr from-[#019789] to-[#13AAAB] p-8 px-10 rounded-lg drop-shadow-lg relative text-white max-w-md">
                    <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
                    <p>{message}</p>
                </div>
            </main>
        </>
    )
}