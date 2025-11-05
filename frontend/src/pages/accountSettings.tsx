import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../utils/apiConfig';
import Header from '../components/header';
import { useNotification } from '../contexts/notificationContext';

interface User {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  phone_verified_at?: string | null;
  email_verified_at: string | null;
  role?: string;
}

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'phone'>('profile');

  // Profile form data
  const [profileData, setProfileData] = useState({
    phone_number: ''
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  // Phone verification data
  const [phoneVerificationData, setPhoneVerificationData] = useState({
    phone_number: '',
    verification_code: ''
  });
  const [phoneVerificationStatus, setPhoneVerificationStatus] = useState<{
    is_verified: boolean;
    verified_at: string | null;
  } | null>(null);
  const [verificationStep, setVerificationStep] = useState<'enter_phone' | 'enter_code'>('enter_phone');
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login?redirect=account-settings');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setProfileData({
      phone_number: parsedUser.phone_number || ''
    });
  }, [navigate]);

  const validatePhoneNumber = (phoneNumber: string): boolean => {
    if (!phoneNumber) return true; // Optional field
    
    // Remove all spaces and special characters except +
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Valid Philippine phone number patterns (local clinic focus)
    const patterns = [
      /^639\d{9}$/,           // 639939928496 (12 digits total)
      /^09\d{9}$/,            // 09939928496 (11 digits total) - FIXED
      /^9\d{9}$/,             // 9939928496 (10 digits total)
      /^\+639\d{9}$/,         // +639939928496
      /^\d{9}$/,              // 993992496 (9 digits - core number)
      /^0\d{9}$/              // 0993992496 (10 digits with leading 0)
    ];
    
    return patterns.some(pattern => pattern.test(cleanNumber));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number format
    if (profileData.phone_number && !validatePhoneNumber(profileData.phone_number)) {
      showNotification('Please enter a valid Philippine phone number format (e.g., 09939928496, 639939928496, 993 992 8496, etc.)', 'error');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl.updateProfile(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (data.status) {
        // Update user data in localStorage
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        showNotification('Profile updated successfully! 🎉', 'success');
      } else {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          errorMessages.forEach((error: any) => {
            showNotification(error, 'error');
          });
        } else {
          showNotification(data.message || 'Failed to update profile', 'error');
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('An error occurred while updating your profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      showNotification('New passwords do not match', 'error');
      return;
    }

    if (passwordData.new_password.length < 8) {
      showNotification('New password must be at least 8 characters long', 'error');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl.changePassword(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();

      if (data.status) {
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
        showNotification('Password changed successfully! 🎉', 'success');
      } else {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          errorMessages.forEach((error: any) => {
            showNotification(error, 'error');
          });
        } else {
          showNotification(data.message || 'Failed to change password', 'error');
        }
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showNotification('An error occurred while changing your password', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Phone verification functions
  const fetchPhoneVerificationStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl.phoneVerificationStatus(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      if (data.status) {
        setPhoneVerificationStatus(data.data);
        setPhoneVerificationData(prev => ({
          ...prev,
          phone_number: data.data.phone_number || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching phone verification status:', error);
    }
  };

  const sendVerificationCode = async () => {
    if (!phoneVerificationData.phone_number) {
      showNotification('Please enter a phone number', 'error');
      return;
    }

    if (!validatePhoneNumber(phoneVerificationData.phone_number)) {
      showNotification('Please enter a valid Philippine phone number', 'error');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl.sendPhoneVerification(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ phone_number: phoneVerificationData.phone_number })
      });

      const data = await response.json();
      console.log('Phone verification response:', data); // Debug log

      if (data.status) {
        setCodeSent(true);
        setVerificationStep('enter_code');
        const debugCode = data.debug?.code;
        showNotification(
          `Verification code sent to ${phoneVerificationData.phone_number}!${debugCode ? ` Code: ${debugCode}` : ''}`, 
          'success'
        );
      } else {
        showNotification(data.message || 'Failed to send verification code', 'error');
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      showNotification('An error occurred while sending verification code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneCode = async () => {
    if (!phoneVerificationData.verification_code) {
      showNotification('Please enter the verification code', 'error');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl.verifyPhone(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ verification_code: phoneVerificationData.verification_code })
      });

      const data = await response.json();

      if (data.status) {
        showNotification('Phone number verified successfully! 🎉', 'success');
        setPhoneVerificationStatus({
          is_verified: true,
          verified_at: data.phone_verified_at
        });
        setVerificationStep('enter_phone');
        setCodeSent(false);
        setPhoneVerificationData(prev => ({
          ...prev,
          verification_code: ''
        }));
        
        // Update user data in localStorage
        const updatedUser: User = { 
          ...user, 
          phone_verified_at: data.phone_verified_at 
        } as User;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        showNotification(data.message || 'Invalid verification code', 'error');
      }
    } catch (error) {
      console.error('Error verifying phone code:', error);
      showNotification('An error occurred while verifying code', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch phone verification status on component mount
  useEffect(() => {
    if (user) {
      fetchPhoneVerificationStatus();
    }
  }, [user]);

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8 mt-[56px]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-teal-600 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">Account Settings</h1>
              <p className="text-teal-100 mt-1">Manage your account information and security</p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-2 px-4 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`py-2 px-4 border-b-2 font-medium text-sm ${
                    activeTab === 'password'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Change Password
                </button>
                <button
                  onClick={() => setActiveTab('phone')}
                  className={`py-2 px-4 border-b-2 font-medium text-sm ${
                    activeTab === 'phone'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Phone Verification
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="max-w-md">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                  
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    {/* Read-only fields */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={user.name}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>

                    {/* Editable phone number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone_number}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone_number: e.target.value }))}
                        placeholder="Enter your phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Valid formats: 09939928496, 639939928496, 993 992 8496, +63 993 992 8496, etc.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                        loading
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-teal-600 text-white hover:bg-teal-700'
                      }`}
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </form>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div className="max-w-md">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                  
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                        required
                        minLength={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Must be at least 8 characters long
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.new_password_confirmation}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, new_password_confirmation: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                        loading
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-teal-600 text-white hover:bg-teal-700'
                      }`}
                    >
                      {loading ? 'Changing Password...' : 'Change Password'}
                    </button>
                  </form>
                </div>
              )}

              {/* Phone Verification Tab */}
              {activeTab === 'phone' && (
                <div className="max-w-md">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Phone Verification</h3>
                  
                  {/* Current Status */}
                  {phoneVerificationStatus && (
                    <div className={`mb-6 p-4 rounded-lg ${
                      phoneVerificationStatus.is_verified 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          phoneVerificationStatus.is_verified ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          phoneVerificationStatus.is_verified ? 'text-green-800' : 'text-yellow-800'
                        }`}>
                          {phoneVerificationStatus.is_verified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                      {phoneVerificationStatus.is_verified && phoneVerificationStatus.verified_at && (
                        <p className="text-xs text-green-600 mt-1">
                          Verified on {new Date(phoneVerificationStatus.verified_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Phone Number Input */}
                  {verificationStep === 'enter_phone' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={phoneVerificationData.phone_number}
                          onChange={(e) => setPhoneVerificationData(prev => ({ ...prev, phone_number: e.target.value }))}
                          placeholder="e.g., 09123456789"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter a valid Philippine phone number
                        </p>
                      </div>

                      <button
                        onClick={sendVerificationCode}
                        disabled={loading || !phoneVerificationData.phone_number}
                        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                          loading || !phoneVerificationData.phone_number
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-teal-600 text-white hover:bg-teal-700'
                        }`}
                      >
                        {loading ? 'Sending Code...' : 'Send Verification Code'}
                      </button>
                    </div>
                  )}

                  {/* Verification Code Input */}
                  {verificationStep === 'enter_code' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Verification Code
                        </label>
                        <input
                          type="text"
                          value={phoneVerificationData.verification_code}
                          onChange={(e) => setPhoneVerificationData(prev => ({ ...prev, verification_code: e.target.value }))}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center text-2xl tracking-widest"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Check your phone for the verification code sent to {phoneVerificationData.phone_number}
                        </p>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            setVerificationStep('enter_phone');
                            setCodeSent(false);
                            setPhoneVerificationData(prev => ({ ...prev, verification_code: '' }));
                          }}
                          className="flex-1 py-2 px-4 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={verifyPhoneCode}
                          disabled={loading || phoneVerificationData.verification_code.length !== 6}
                          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                            loading || phoneVerificationData.verification_code.length !== 6
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-teal-600 text-white hover:bg-teal-700'
                          }`}
                        >
                          {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                      </div>

                      <button
                        onClick={sendVerificationCode}
                        disabled={loading}
                        className="w-full py-2 px-4 border border-teal-600 text-teal-600 rounded-md font-medium hover:bg-teal-50 transition-colors"
                      >
                        Resend Code
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountSettings;