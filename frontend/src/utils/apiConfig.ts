// API Configuration utility
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export const apiUrl = {
  // Authentication
  login: () => getApiUrl('api/login'),
  register: () => getApiUrl('api/register'),
  logout: () => getApiUrl('api/logout'),
  logoutAll: () => getApiUrl('api/logout-all'),
  resendVerification: () => getApiUrl('api/email/resend-verification'),
  forgotPassword: () => getApiUrl('api/forgot-password'),
  resetPassword: () => getApiUrl('api/reset-password'),
  
  // Appointments
  appointments: () => getApiUrl('api/appointments'),
  appointment: (id: number) => getApiUrl(`api/appointments/${id}`),
  cancelAppointment: (id: number) => getApiUrl(`api/appointments/${id}/cancel`),
  adminAppointments: () => getApiUrl('api/admin/appointments'),
  appointmentStatus: (id: number) => getApiUrl(`api/admin/appointments/${id}/status`),
  rescheduleAppointment: (id: number) => getApiUrl(`api/admin/appointments/${id}/reschedule`),
  deleteAppointment: (id: number) => getApiUrl(`api/admin/appointments/${id}`),
  
  // Medical Records
  medicalRecords: () => getApiUrl('api/medical-records'),
  medicalRecordsByAppointment: (appointmentId: number) => getApiUrl(`api/medical-records?appointment_id=${appointmentId}`),
  
  // Admin Dashboard
  adminDashboard: () => getApiUrl('api/admin/dashboard'),
  adminAnalytics: () => getApiUrl('api/admin/analytics'),
  adminRecentAppointments: () => getApiUrl('api/admin/recent-appointments'),
  adminWalkInAppointments: () => getApiUrl('api/admin/walk-in-appointments'),
  adminCustomers: () => getApiUrl('api/admin/customers'),
  
  // Notifications
  adminNotifications: () => getApiUrl('api/admin/notifications'),
  adminNotificationsStream: () => getApiUrl('api/admin/notifications/stream'),
  adminNotificationsClear: () => getApiUrl('api/admin/notifications'),
};

export default API_BASE_URL;