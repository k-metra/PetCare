import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000
}) => {
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimatingIn(true);
      setIsAnimatingOut(false);
      
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingIn(false);
      setIsAnimatingOut(false);
    }, 300);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          icon: '✓',
          iconBg: 'bg-green-600'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          icon: '✕',
          iconBg: 'bg-red-600'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          icon: '⚠',
          iconBg: 'bg-yellow-600'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500',
          icon: 'ℹ',
          iconBg: 'bg-blue-600'
        };
    }
  };

  const styles = getTypeStyles();

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
        isAnimatingIn && !isAnimatingOut
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-8 opacity-0 scale-95'
      }`}
    >
      <div className={`${styles.bg} text-white rounded-lg shadow-lg overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className={`${styles.iconBg} rounded-full p-1 mr-3 flex-shrink-0`}>
              <span className="text-white text-sm font-bold w-5 h-5 flex items-center justify-center">
                {styles.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight">{message}</p>
            </div>
            <button
              onClick={handleClose}
              className="ml-2 flex-shrink-0 text-white hover:text-gray-200 transition-colors"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-black bg-opacity-20">
          <div
            className="h-full bg-white bg-opacity-30 transition-all ease-linear"
            style={{
              width: isAnimatingOut ? '0%' : '100%',
              transition: `width ${duration}ms linear`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Notification;