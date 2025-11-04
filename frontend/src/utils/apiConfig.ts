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
  
  // Account Settings
  updateProfile: () => getApiUrl('api/profile'),
  changePassword: () => getApiUrl('api/change-password'),
  
  // Appointments
  appointments: () => getApiUrl('api/appointments'),
  appointment: (id: number) => getApiUrl(`api/appointments/${id}`),
  cancelAppointment: (id: number) => getApiUrl(`api/appointments/${id}/cancel`),
  availableTimeSlots: () => getApiUrl('api/appointments/available-slots'),
  services: () => getApiUrl('api/services'),
  vaccines: () => getApiUrl('api/appointments/vaccines'),
  availableVaccines: () => getApiUrl('api/appointments/vaccines'),
  adminAppointments: () => getApiUrl('api/admin/appointments'),
  appointmentStatus: (id: number) => getApiUrl(`api/admin/appointments/${id}/status`),
  rescheduleAppointment: (id: number) => getApiUrl(`api/admin/appointments/${id}/reschedule`),
  editAppointment: (id: number) => getApiUrl(`api/admin/appointments/${id}/edit`),
  deleteAppointment: (id: number) => getApiUrl(`api/admin/appointments/${id}`),
  completeAppointment: () => getApiUrl('api/admin/appointments/complete'),
  
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
  
  // Inventory Management
  categories: () => getApiUrl('api/categories'),
  category: (id: number) => getApiUrl(`api/categories/${id}`),
  products: () => getApiUrl('api/products'),
  product: (id: number) => getApiUrl(`api/products/${id}`),
  productQuantity: (id: number) => getApiUrl(`api/products/${id}/quantity`),
  
  // Staff Management
  staff: () => getApiUrl('api/admin/staff'),
  staffMember: (id: number) => getApiUrl(`api/admin/staff/${id}`),
};

export default API_BASE_URL;