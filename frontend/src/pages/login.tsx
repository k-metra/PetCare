import Header from '../components/header'
import InputField from '../components/inputField'

import home_image from '../assets/home/home_image.png'

import { motion } from 'framer-motion'

import { useNavigate } from 'react-router-dom';

import { useState, useEffect } from 'react'

export default function Login() {
    const [credentials, setCredentials] = useState({email: '', password: ''})
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('redirect') || '/';
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials(prev => ({...prev, [e.target.name]: e.target.value}))
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/home');
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        e.preventDefault();
        // Handle login logic here
        console.log('Logging in with credentials:', credentials);

        const response = await fetch('http://127.0.0.1:8000/api/login', {
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

            <div className="bg-gradient-to-tr from-[#019789] to-[#13AAAB] p-8 px-10 rounded-lg drop-shadow-lg relative">
                <h1 className="text-3xl text-center font-bold text-white">Welcome back!</h1>
                {error !== '' && <p className="text-red-400 text-sm text-center mt-5">* {error}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-10">
                    <InputField name="email" placeholder="Email" type="text" onChange={handleChange} />
                    <InputField name="password" placeholder="Password" type="password" onChange={handleChange} />
                    <motion.button whileHover={{scale:1.05, transition: {type:"tween", duration:0.3, ease:'backOut'}}} whileTap={{scale:0.95, transition: {duration:0.2, type:"spring"}}} type="submit" disabled={loading} className="bg-brand-primary-500 border border-black/20 drop-shadow-lg text-white py-2 rounded-lg disabled:text-brand-primary-400 disabled:cursor-not-allowed transition-colors duration-200">{loading ? "Logging in..." : "Log in"}</motion.button>
                </form>
                <p className="text-white/50 text-center text-sm mt-6">Don't have an account? <a href="/register" className="text-white font-semibold">Register</a></p>
            </div>
        </main>
        </>
    )
}