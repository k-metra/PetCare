import NavItem from "./navitem"
import LogoutButton from "./logoutButton"
import { GiHamburgerMenu } from "react-icons/gi";

import { useState, useRef, useEffect } from 'react';

export default function NavBar() {
    const [topbarOpen, setTopbarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const menuButton = useRef(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {

            if (menuButton.current && menuButton.current.contains(e.target)) {
                setTopbarOpen(prev => !prev);
                return;
            }

            if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setTopbarOpen(false);
            }
        }

        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("touchstart", handleClickOutside);
        }
    }, [topbarOpen])

    return (
        <>
        <nav>
            <ul className="hidden md:flex flex-row text-center gap-2 text-white">
                <NavItem href="/home">Home</NavItem>
                <NavItem href="/home#about">About</NavItem>
                <NavItem href="/home#services">Services</NavItem>
                {/* Only show Book Appointment for regular users or when not logged in */}
                {(!user || user.role === 'user') && (
                    <NavItem href="/set-appointment">Book Appointment</NavItem>
                )}
                {user && user.role === 'user' && (
                    <NavItem href="/my-appointments">My Appointments</NavItem>
                )}
                {user && ['admin', 'staff'].includes(user.role) && (
                    <NavItem href="/admin-dashboard">Dashboard</NavItem>
                )}
                {/* Only show Contact for regular users or when not logged in */}
                {(!user || user.role === 'user') && (
                    <NavItem href="/home#contact">Contact</NavItem>
                )}
                {!localStorage.getItem('token') && (
                    <NavItem href="/login">Login</NavItem>
                )}
            </ul>
        </nav>

        <div className="md:hidden flex">
            <button ref={menuButton} className="z-50">
                <GiHamburgerMenu className="text-3xl z-30 text-white"/>
            </button>
        </div>
        <div ref={sidebarRef} className={`md:hidden drop-shadow-lg rounded-sm flex flex-col px-2 gap-1 py-2 min-h-[200%] z-[-3] bg-brand-primary w-full absolute top-[64px] right-0 shadow-lg transform transition-transform text-white duration-300 ease-in-out origin-top ${topbarOpen ? "scale-y-100 " : "scale-y-0"}`}>
            <NavItem href="/home">Home</NavItem>
            <NavItem href="/home#about">About</NavItem>
            <NavItem href="/home#services">Services</NavItem>
            {/* Only show Book Appointment for regular users or when not logged in */}
            {(!user || user.role === 'user') && (
                <NavItem href="/set-appointment">Book Appointment</NavItem>
            )}
            {user && user.role === 'user' && (
                <NavItem href="/my-appointments">My Appointments</NavItem>
            )}
            {user && ['admin', 'staff'].includes(user.role) && (
                <NavItem href="/admin-dashboard">Dashboard</NavItem>
            )}
            {/* Only show Contact for regular users or when not logged in */}
            {(!user || user.role === 'user') && (
                <NavItem href="/home#contact">Contact</NavItem>
            )}
            {!localStorage.getItem('token') ? (
                <NavItem href="/login">Login</NavItem>
            ) : (
                <div className="px-4 py-2">
                    <LogoutButton showText={true} className="w-full justify-start" />
                </div>
            )}
        </div>
        </>
    )
}