import Header from '../components/header'
import InputField from '../components/inputField'

import home_image from '../assets/home/home_image.png'

import { useState } from 'react'

export default function Login() {
    const [credentials, setCredentials] = useState({username: '', password: ''})

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials(prev => ({...prev, [e.target.name]: e.target.value}))
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Handle login logic here
    }

    return (
        <>
        <Header />
        <main className="min-h-screen overflow-hidden flex justify-center items-center relative">
            <img src={home_image} alt="Home Image" className="w-full absolute h-full object-cover mt-16"></img>

            <div className="bg-gradient-to-tr from-[#019789] to-[#13AAAB] p-8 px-10 rounded-lg drop-shadow-lg relative">
                <h1 className="text-3xl text-center font-bold text-white">Welcome back!</h1>
                <form className="flex flex-col gap-6 mt-10">
                    <InputField name="username" placeholder="Username" type="text" onChange={handleChange} />
                    <InputField name="password" placeholder="Password" type="password" onChange={handleChange} />
                </form>
            </div>
        </main>
        </>
    )
}