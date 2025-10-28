import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiUrl } from '../utils/apiConfig';
import Header from '../components/header';
import home_image from '../assets/home/home_image.png';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        password: '',
        password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState<any>({});
    
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        // Check if we have the required parameters
        if (!token || !email) {
            setError('Invalid or missing reset token. Please request a new password reset link.');
        }
    }, [token, email]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear validation errors as user types
        if (validationErrors[name]) {
            setValidationErrors((prev: any) => ({ ...prev, [name]: '' }));
        }
        
        // Clear general error
        if (error) setError('');
    };

    const validateForm = () => {
        const errors: any = {};
        
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }
        
        if (!formData.password_confirmation) {
            errors.password_confirmation = 'Password confirmation is required';
        } else if (formData.password !== formData.password_confirmation) {
            errors.password_confirmation = 'Passwords do not match';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        if (!token || !email) {
            setError('Invalid reset token. Please request a new password reset link.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(apiUrl.resetPassword(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    email,
                    password: formData.password,
                    password_confirmation: formData.password_confirmation
                }),
            });

            const data = await response.json();

            if (data.status) {
                setSuccess(data.message);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                if (data.errors) {
                    setValidationErrors(data.errors);
                } else {
                    setError(data.message || 'Failed to reset password. Please try again.');
                }
            }
        } catch (error) {
            setError('Network error. Please try again.');
            console.error('Reset password error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    if (!token || !email) {
        return (
            <>
                <Header />
                <main className="min-h-screen overflow-hidden flex justify-center items-center relative">
                    <img src={home_image} alt="Home Image" className="w-full absolute h-full object-cover mt-16"></img>
                    
                    <div className="bg-gradient-to-tr from-[#019789] to-[#13AAAB] p-8 px-10 rounded-lg drop-shadow-lg relative w-full max-w-md mx-auto">
                        <h1 className="text-3xl text-center font-bold text-white mb-6">Invalid Reset Link</h1>
                        
                        <div className="text-center">
                            <p className="text-white/90 mb-6">
                                This password reset link is invalid or has expired. Please request a new one.
                            </p>
                            
                            <motion.button
                                whileHover={{ scale: 1.05, transition: { type: "tween", duration: 0.3, ease: 'backOut' } }}
                                whileTap={{ scale: 0.95, transition: { duration: 0.2, type: "spring" } }}
                                onClick={handleBackToLogin}
                                className="bg-brand-primary-500 border border-black/20 drop-shadow-lg text-white py-2 px-6 rounded-lg transition-colors duration-200"
                            >
                                Back to Login
                            </motion.button>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="min-h-screen overflow-hidden flex justify-center items-center relative">
                <img src={home_image} alt="Home Image" className="w-full absolute h-full object-cover mt-16"></img>
                
                <div className="bg-gradient-to-tr from-[#019789] to-[#13AAAB] p-8 px-10 rounded-lg drop-shadow-lg relative w-full max-w-md mx-auto">
                    <h1 className="text-3xl text-center font-bold text-white mb-2">Reset Password</h1>
                    <p className="text-white/80 text-center text-sm mb-6">
                        Enter your new password for <strong>{email}</strong>
                    </p>
                    
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                            {error}
                        </div>
                    )}
                    
                    {success && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                            {success}
                            <br />
                            <span className="text-xs">Redirecting to login in 3 seconds...</span>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                name="password"
                                placeholder="New Password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-lg border ${
                                    validationErrors.password ? 'border-red-400' : 'border-gray-300'
                                } focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors`}
                                required
                            />
                            {validationErrors.password && (
                                <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
                            )}
                        </div>
                        
                        <div>
                            <input
                                type="password"
                                name="password_confirmation"
                                placeholder="Confirm New Password"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-lg border ${
                                    validationErrors.password_confirmation ? 'border-red-400' : 'border-gray-300'
                                } focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors`}
                                required
                            />
                            {validationErrors.password_confirmation && (
                                <p className="text-red-400 text-xs mt-1">{validationErrors.password_confirmation}</p>
                            )}
                        </div>
                        
                        <div className="pt-2">
                            <motion.button
                                whileHover={{ scale: 1.05, transition: { type: "tween", duration: 0.3, ease: 'backOut' } }}
                                whileTap={{ scale: 0.95, transition: { duration: 0.2, type: "spring" } }}
                                type="submit"
                                disabled={loading || success !== ''}
                                className="w-full bg-brand-primary-500 border border-black/20 drop-shadow-lg text-white py-3 rounded-lg disabled:text-brand-primary-400 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {loading ? 'Resetting Password...' : 'Reset Password'}
                            </motion.button>
                        </div>
                    </form>
                    
                    <div className="text-center mt-6">
                        <button
                            onClick={handleBackToLogin}
                            className="text-white/70 text-sm hover:text-white transition-colors underline"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}