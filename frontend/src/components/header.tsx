import HeroIcon from "./HeroIcon"
import NavBar from "./navbar"
import UserMenu from "./userMenu"

import { useState, useEffect } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    role?: string;
}

export default function Header() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

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