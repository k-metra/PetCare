import React, { useState, useRef, useEffect } from 'react';
import { FaUserAlt, FaSignOutAlt, FaUserTimes, FaCog, FaCalendarAlt, FaBook } from 'react-icons/fa';
import { logout, logoutAll } from '../utils/auth';
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

interface UserMenuProps {
    user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close menu when clicking outside - must be before any early returns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Safety check - if user data is missing or corrupted, force re-login
    if (!user || (!user.name && !user.username)) {
        console.error('UserMenu: User data is incomplete, forcing re-login', user);
        // Clear corrupted data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return null;
    }

    const handleLogout = async () => {
        setLoading(true);
        const result = await logout();
        
        if (result.success) {
            navigate('/home');
            window.location.reload();
        }
        setLoading(false);
        setIsOpen(false);
    };

    const handleLogoutAll = async () => {
        setLoading(true);
        const result = await logoutAll();
        
        if (result.success) {
            navigate('/home');
            window.location.reload();
        }
        setLoading(false);
        setIsOpen(false);
    };

    // Get display name with fallback - prioritize username from localStorage
    const displayName = user.username || user.name || user.email || 'User';
    const userInitial = displayName.charAt(0).toUpperCase();

    return (
        <div className="relative" ref={menuRef}>
            {/* User button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="hidden md:flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
            >
                <FaUserAlt />
                <span className="max-w-32 truncate">{displayName}</span>
                <svg 
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                    {/* User info section */}
                    <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {userInitial}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {displayName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user.email}
                                </p>
                                {user.role && (
                                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                                        user.role === 'admin' 
                                            ? 'bg-red-100 text-red-800' 
                                            : user.role === 'staff'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                        {/* My Appointments option for regular users */}
                        {user.role === 'user' && (
                            <>
                                <button 
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate('/my-appointments');
                                    }}
                                >
                                    <FaCalendarAlt className="text-gray-400" />
                                    My Appointments
                                </button>
                                
                                <button 
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    onClick={() => {
                                        setIsOpen(false);
                                        navigate('/my-booklet');
                                    }}
                                >
                                    <FaBook className="text-gray-400" />
                                    My Booklet
                                </button>
                            </>
                        )}

                        {/* Account Settings */}
                        <button 
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/account-settings');
                            }}
                        >
                            <FaCog className="text-gray-400" />
                            Account Settings
                        </button>

                        <hr className="my-1" />

                        {/* Logout options */}
                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left disabled:opacity-50"
                        >
                            <FaSignOutAlt className="text-gray-400" />
                            {loading ? 'Logging out...' : 'Logout'}
                        </button>

                        <button
                            onClick={handleLogoutAll}
                            disabled={loading}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left disabled:opacity-50"
                        >
                            <FaUserTimes className="text-gray-400" />
                            Logout All Devices
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}