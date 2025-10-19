import Header from '../components/header'
import InputField from '../components/inputField'

import home_image from '../assets/home/home_image.png'

import { motion } from 'framer-motion'

import { useState } from 'react'

export default function Register() {
    const [credentials, setCredentials] = useState({name: '', email: '', password: ''})

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials(prev => ({...prev, [e.target.name]: e.target.value}))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Handle login logic here

        await fetch('http://127.0.0.1:8000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        }).then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
    }

    return (
        <>
        <Header />
        <main className="min-h-screen overflow-hidden flex justify-center items-center relative">
            <img src={home_image} alt="Home Image" className="w-full absolute h-full object-cover mt-16"></img>

            <div className="bg-gradient-to-tr from-[#019789] to-[#13AAAB] p-8 px-10 rounded-lg drop-shadow-lg relative">
                <h1 className="text-3xl text-center font-bold text-white">Create account</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-10">
                    <InputField name="name" placeholder="Full Name" type="text" onChange={handleChange} />
                    <InputField name="email" placeholder="Email" type="text" onChange={handleChange} />
                    <InputField name="password" placeholder="Password" type="password" onChange={handleChange} />
                    <motion.button whileHover={{scale:1.05, transition: {type:"tween", duration:0.3, ease:'backOut'}}} whileTap={{scale:0.95, transition: {duration:0.2, type:"spring"}}} type="submit" className="bg-brand-primary-500 border border-black/20 drop-shadow-lg text-white py-2 rounded-lg  transition-colors duration-200">Register</motion.button>
                </form>
                <p className="text-white/50 text-center text-sm mt-6">Already have an account? <a href="/login" className="text-white font-semibold">Login</a></p>
            </div>
        </main>
        </>
    )
}