import Header from '../components/header'
import InputField from '../components/inputField'
import { apiUrl } from '../utils/apiConfig'

import home_image from '../assets/home/home_image.png'

import { motion } from 'framer-motion'

import { useNavigate } from 'react-router-dom';

import { useState, useEffect } from 'react'

export default function Login() {
    const [credentials, setCredentials] = useState({email: '', password: ''})
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const [showResendLink, setShowResendLink] = useState(false);
    
    // Forgot password state
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
    const [forgotPasswordError, setForgotPasswordError] = useState('');

    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('redirect') || '/';
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials(prev => ({...prev, [e.target.name]: e.target.value}))
    }

    const handleResendVerification = async () => {
        if (!credentials.email) {
            setResendMessage('Please enter your email address first.');
            return;
        }

        setResendLoading(true);
        setResendMessage('');
        
        try {
            const resendResponse = await fetch(apiUrl.resendVerification(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: credentials.email
                }),
            });
            
            const resendData = await resendResponse.json();
            
            if (resendData.status) {
                setResendMessage('Verification email sent! Please check your inbox.');
                setShowResendLink(false);
            } else {
                setResendMessage(resendData.message || 'Failed to send verification email. Please try again.');
            }
        } catch (error) {
            setResendMessage('Network error. Please try again.');
        }
        
        setResendLoading(false);
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!forgotPasswordEmail) {
            setForgotPasswordError('Please enter your email address.');
            return;
        }

        setForgotPasswordLoading(true);
        setForgotPasswordError('');
        setForgotPasswordMessage('');

        try {
            const response = await fetch(apiUrl.forgotPassword(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: forgotPasswordEmail }),
            });

            const data = await response.json();

            if (data.status) {
                setForgotPasswordMessage(data.message);
                // Close modal after 3 seconds
                setTimeout(() => {
                    setShowForgotPasswordModal(false);
                    setForgotPasswordEmail('');
                    setForgotPasswordMessage('');
                }, 3000);
            } else {
                setForgotPasswordError(data.message || 'Failed to send reset link. Please try again.');
            }
        } catch (error) {
            setForgotPasswordError('Network error. Please try again.');
            console.error('Forgot password error:', error);
        } finally {
            setForgotPasswordLoading(false);
        }
    };

    const openForgotPasswordModal = () => {
        setShowForgotPasswordModal(true);
        setForgotPasswordEmail(credentials.email); // Pre-fill with login email if available
        setForgotPasswordError('');
        setForgotPasswordMessage('');
    };

    const closeForgotPasswordModal = () => {
        setShowForgotPasswordModal(false);
        setForgotPasswordEmail('');
        setForgotPasswordError('');
        setForgotPasswordMessage('');
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/home');
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        setShowResendLink(false);
        setResendMessage('');
        e.preventDefault();
        // Handle login logic here
        console.log('Logging in with credentials:', credentials);

        const response = await fetch(apiUrl.login(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();
        console.log('Login response:', data);

        if (!data.status) {
            setError(data.message || 'Login failed. Please try again.');
            
            // Check if it's an email verification error
            if (data.message && data.message.includes('Email not verified')) {
                setShowResendLink(true);
            }
        } else {
            setError('');
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));

            switch (redirectUrl) {
                case 'home':
                    navigate('/home');
                    break;
                case 'set-appointment':
                    navigate('/set-appointment');
                    break;
                case 'my-appointments':
                    navigate('/my-appointments');
                    break;
                default:
                    navigate('/home');
                    break;
            }
        }
        setLoading(false);
    }

    return (
        <>
        <Header />
        <main className="min-h-screen overflow-hidden flex justify-center items-center relative">
            <img src={home_image} alt="Home Image" className="w-full absolute h-full object-cover mt-16"></img>

            <div className="bg-gradient-to-tr from-[#019789] to-[#13AAAB] p-8 px-10 rounded-lg drop-shadow-lg relative w-full max-w-md mx-auto">
                <h1 className="text-3xl text-center font-bold text-white">Welcome back!</h1>
                
                {error !== '' && (
                    <div className="mt-5">
                        <p className="text-red-400 text-sm text-center">* {error}</p>
                        {showResendLink && (
                            <p className="text-center mt-2">
                                <a 
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleResendVerification();
                                    }}
                                    className={`text-white/80 text-sm underline hover:text-white transition-colors ${
                                        resendLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                                    }`}
                                >
                                    {resendLoading ? 'Sending...' : 'Resend verification email'}
                                </a>
                            </p>
                        )}
                    </div>
                )}
                
                {resendMessage && (
                    <p className={`text-sm text-center mt-3 ${
                        resendMessage.includes('sent') || resendMessage.includes('inbox') 
                            ? 'text-green-300' 
                            : 'text-red-400'
                    }`}>
                        {resendMessage}
                    </p>
                )}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-10">
                    <InputField name="email" placeholder="Email" type="text" onChange={handleChange} />
                    <InputField name="password" placeholder="Password" type="password" onChange={handleChange} />
                    <motion.button whileHover={{scale:1.05, transition: {type:"tween", duration:0.3, ease:'backOut'}}} whileTap={{scale:0.95, transition: {duration:0.2, type:"spring"}}} type="submit" disabled={loading} className="bg-brand-primary-500 border border-black/20 drop-shadow-lg text-white py-2 rounded-lg disabled:text-brand-primary-400 disabled:cursor-not-allowed transition-colors duration-200">{loading ? "Logging in..." : "Log in"}</motion.button>
                </form>
                
                {/* Forgot Password Link */}
                <div className="text-center mt-4">
                    <button
                        onClick={openForgotPasswordModal}
                        className="text-white/70 text-sm hover:text-white transition-colors underline"
                    >
                        Forgot your password?
                    </button>
                </div>
                
                <p className="text-white/50 text-center text-sm mt-6">Don't have an account? <a href="/register" className="text-white font-semibold">Register</a></p>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
                            <button
                                onClick={closeForgotPasswordModal}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <p className="text-gray-600 mb-4">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        {forgotPasswordError && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {forgotPasswordError}
                            </div>
                        )}

                        {forgotPasswordMessage && (
                            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                                {forgotPasswordMessage}
                            </div>
                        )}

                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={forgotPasswordEmail}
                                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="Enter your email address"
                                    required
                                />
                            </div>
                            
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={closeForgotPasswordModal}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    disabled={forgotPasswordLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={forgotPasswordLoading || !forgotPasswordEmail}
                                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
        </>
    )
}