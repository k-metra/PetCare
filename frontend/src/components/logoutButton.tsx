import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, logoutAll } from '../utils/auth';
import { FaSignOutAlt, FaUserTimes } from 'react-icons/fa';

interface LogoutButtonProps {
  className?: string;
  showText?: boolean;
  showDropdown?: boolean;
}

export default function LogoutButton({ 
  className = "", 
  showText = true, 
  showDropdown = false 
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    const result = await logout();
    
    if (result.success) {
      // Redirect to home page
      navigate('/home');
      // Reload to clear any cached user state
      window.location.reload();
    }
    setLoading(false);
    setShowOptions(false);
  };

  const handleLogoutAll = async () => {
    setLoading(true);
    const result = await logoutAll();
    
    if (result.success) {
      // Redirect to home page
      navigate('/home');
      // Reload to clear any cached user state
      window.location.reload();
    }
    setLoading(false);
    setShowOptions(false);
  };

  if (showDropdown) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className={`flex items-center gap-2 text-white hover:text-gray-200 transition-colors ${className}`}
          disabled={loading}
        >
          <FaSignOutAlt />
          {showText && <span>Logout</span>}
        </button>
        
        {showOptions && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border">
            <div className="py-1">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <FaSignOutAlt className="text-gray-400" />
                Logout
              </button>
              <button
                onClick={handleLogoutAll}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
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

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center gap-2 text-white hover:text-gray-200 transition-colors ${className}`}
    >
      <FaSignOutAlt />
      {showText && <span>{loading ? 'Logging out...' : 'Logout'}</span>}
    </button>
  );
}