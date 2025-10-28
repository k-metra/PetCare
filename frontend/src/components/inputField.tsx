import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";


import { useState } from 'react';

export default function InputField({name,  placeholder, type = "text", onChange }: { name: string; placeholder: string; type?: string; onChange?: ((e: React.ChangeEvent<HTMLInputElement>) => void) }) {
    const [showPassword, setShowPassword] = useState(false);   

    return (
        <div className="w-full">
            <label className="relative block w-full">
                <input 
                    required 
                    type={type === "password" && showPassword ? "text" : type} 
                    name={name} 
                    onChange={onChange} 
                    className={`w-full px-4 py-2 text-brand-primary-100 text-lg outline-none border border-black/20 rounded-lg hover:border-black/50 focus:border-brand-primary-300 transition-all bg-white/10 duration-200 peer ${
                        type === 'password' ? 'pr-12' : ''
                    }`}
                />
                <span className="absolute left-0 top-2.5 ml-2 px-1 text-lg peer-focus:text-sm text-brand-primary-100 duration-200 peer-valid:-translate-y-8 peer-valid:-translate-x-2 peer-valid:text-sm peer-focus:-translate-y-8 peer-focus:-translate-x-2 pointer-events-none bg-transparent">{placeholder}</span>

                {type === "password" && (
                    <button type="button" onClick={() => {setShowPassword(prev => !prev)}} className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl text-brand-primary-100 hover:text-black/90 transition-colors duration-200">
                        {showPassword ? <IoMdEye /> : <IoMdEyeOff />}
                    </button>
                )}
            </label>
        </div>
    )
}