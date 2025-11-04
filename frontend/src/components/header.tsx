import HeroIcon from "./HeroIcon"
import NavBar from "./navbar"
import UserMenu from "./userMenu"

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    id: number;
    name?: string;        // Optional - some responses use 'name'
    username?: string;    // Optional - localStorage uses 'username'
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    role?: string;
}

export default function Header() {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                // Validate user data integrity
                if (parsedUser && parsedUser.id && (parsedUser.name || parsedUser.username) && parsedUser.email) {
                    setUser(parsedUser);
                } else {
                    console.error('Header: Invalid user data structure, forcing re-login', parsedUser);
                    // Clear corrupted data and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Header: Failed to parse user data, forcing re-login', error);
                // Clear corrupted data and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            }
        }
    }, [navigate]);

    return (
        <header className="fixed p-4 px-7 left-0 bg-[#1BA3AB] flex flex-row justify-between items-center top-0 w-screen h-16 md:h-20 z-50">
            <HeroIcon />

            <div className="flex flex-row items-center gap-4">
                <NavBar />
               
               {user && (
                <UserMenu user={user} />
               )}
            </div>
        </header>
    )
}