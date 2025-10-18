import NavItem from "./navitem"
import { GiHamburgerMenu } from "react-icons/gi";

import { useState, useRef, useEffect } from 'react';

export default function NavBar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const menuButton = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {

            if (menuButton.current && menuButton.current.contains(e.target)) {
                return;
            }

            if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setSidebarOpen(false);
            }
        }

        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("touchstart", handleClickOutside);
        }
    }, [sidebarOpen])

    return (
        <>
        <nav>
            <ul className="hidden md:flex flex-row text-center gap-2 text-white">
                <NavItem href="/">Home</NavItem>
                <NavItem href="/about">About</NavItem>
                <NavItem href="/services">Services</NavItem>
                <NavItem href="/contact">Contact</NavItem>
            </ul>
        </nav>

        <div className="md:hidden flex">
            <button ref={menuButton} onClick={() => setSidebarOpen(prev => !prev)}>
                <GiHamburgerMenu className="text-3xl text-white"/>
            </button>
        </div>
        <div ref={sidebarRef} className={`md:hidden drop-shadow-lg rounded-sm flex flex-col bg-gray-100 px-2 gap-6 py-2 h-screen w-2/3 absolute top-[64px] right-0 shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
            <NavItem href="/">Home</NavItem>
            <NavItem href="/about">About</NavItem>
            <NavItem href="/services">Services</NavItem>
            <NavItem href="/contact">Contact</NavItem>
        </div>
        </>
    )
}