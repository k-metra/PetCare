// Logout utility functions
import { apiUrl } from './apiConfig';

export const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Already logged out
      clearAuthData();
      return { success: true, message: 'Already logged out' };
    }

    // Call logout API
    const response = await fetch(apiUrl.logout(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    
    // Clear local storage regardless of API response
    clearAuthData();
    
    return { 
      success: true, 
      message: data.message || 'Logout successful' 
    };
    
  } catch (error) {
    console.error('Logout error:', error);
    // Clear local storage even if API call fails
    clearAuthData();
    return { 
      success: true, 
      message: 'Logout successful (local)' 
    };
  }
};

export const logoutAll = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      clearAuthData();
      return { success: true, message: 'Already logged out' };
    }

    const response = await fetch(apiUrl.logoutAll(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    
    clearAuthData();
    
    return { 
      success: true, 
      message: data.message || 'Logout from all devices successful' 
    };
    
  } catch (error) {
    console.error('Logout all error:', error);
    clearAuthData();
    return { 
      success: true, 
      message: 'Logout from all devices successful (local)' 
    };
  }
};

const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

export const getUser = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};