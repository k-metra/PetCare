import Header from '../components/header'
import InputField from '../components/inputField'
import { apiUrl } from '../utils/apiConfig'

import home_image from '../assets/home/home_image.png'

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion'

import { useState } from 'react'

export default function Register() {
    const [credentials, setCredentials] = useState({name: '', email: '', password: ''})
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials(prev => ({...prev, [e.target.name]: e.target.value}))
        // Clear error when user starts typing
        if (error) {
            setError('');
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(''); // Clear any previous errors
        
        try {
            const response = await fetch(apiUrl.register(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();
            console.log(data);

            if (data.status) {
                console.log('Registration successful');
                navigate('/email/verified?status=link_sent');
            } else {
                // Handle specific error messages
                const errorMessage = data.error || data.message || 'An error occurred during registration.';
                
                if (errorMessage.toLowerCase().includes('email') && 
                    (errorMessage.toLowerCase().includes('taken') || 
                     errorMessage.toLowerCase().includes('already') ||
                     errorMessage.toLowerCase().includes('unique'))) {
                    setError('This email address is already registered. Please use a different email or try logging in.');
                } else {
                    setError(errorMessage);
                }
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('An error occurred during registration. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
        <Header />
        <main className="min-h-screen overflow-hidden flex justify-center items-center relative">
            <img src={home_image} alt="Home Image" className="w-full absolute h-full object-cover mt-16"></img>

            <div className="bg-gradient-to-tr from-[#019789] to-[#13AAAB] p-8 px-10 rounded-lg drop-shadow-lg relative w-full max-w-md mx-auto">
                <h1 className="text-3xl text-center font-bold text-white">Create account</h1>
                
                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg max-w-full">
                        <p className="text-red-100 text-sm text-center break-words">{error}</p>
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-10">
                    <InputField name="name" placeholder="Full Name" type="text" onChange={handleChange} />
                    <InputField name="email" placeholder="Email" type="text" onChange={handleChange} />
                    <InputField name="password" placeholder="Password" type="password" onChange={handleChange} />
                    <motion.button whileHover={{scale:1.05, transition: {type:"tween", duration:0.3, ease:'backOut'}}} whileTap={{scale:0.95, transition: {duration:0.2, type:"spring"}}} type="submit" disabled={loading} className={`bg-brand-primary-500 border border-black/20 drop-shadow-lg text-white py-2 rounded-lg  transition-colors duration-200 disabled:cursor-not-allowed disabled:text-white/50`}>{loading ? 'Registering...' : 'Register'}</motion.button>
                </form>
                <p className="text-white/50 text-center text-sm mt-6">Already have an account? <a href="/login" className="text-white font-semibold">Login</a></p>
            </div>
        </main>
        </>
    )
}