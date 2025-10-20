import React, { useState, useEffect } from 'react';
import Header from '../components/header';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaUserMd, 
  FaClipboardList,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaBan,
  FaExclamationTriangle
} from 'react-icons/fa';

interface DashboardStats {
  total_appointments: number;
  pending_appointments: number;
  confirmed_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  total_users: number;
  total_staff: number;
  today_appointments: number;
  this_week_appointments: number;
}

interface Pet {
  id: number;
  type: string;
  breed: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Appointment {
  id: number;
  user_id: number;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  user: User;
  pets: Pet[];
  services: Service[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      window.location.href = '/login?redirect=admin-dashboard';
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Check if user has admin/staff role
    if (!['admin', 'staff'].includes(parsedUser.role)) {
      alert('Access denied. Admin/Staff role required.');
      window.location.href = '/home';
      return;
    }

    fetchDashboardData();
    fetchAppointments();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      if (data.status) {
        setStats(data.stats);
      } else {
        console.error('Failed to fetch dashboard stats:', data.message);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/admin/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      if (data.status) {
        setAppointments(data.appointments);
      } else {
        console.error('Failed to fetch appointments:', data.message);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    setUpdatingStatus(appointmentId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/admin/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.status) {
        // Update appointment in local state
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: newStatus as any }
              : apt
          )
        );
        // Refresh stats
        fetchDashboardData();
      } else {
        alert(data.message || 'Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('An error occurred while updating the appointment status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'confirmed':
        return <FaCheckCircle className="text-blue-500" />;
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'cancelled':
        return <FaBan className="text-red-500" />;
      default:
        return <FaExclamationTriangle className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center mt-16">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-teal-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'admin' ? 'Admin' : 'Staff'} Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.name}! Here's what's happening at PetCare.
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaCalendarAlt className="text-blue-600 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_appointments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FaClock className="text-yellow-600 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending_appointments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FaCheckCircle className="text-green-600 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completed_appointments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <FaUsers className="text-teal-600 text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Today's Appointments</h3>
                <p className="text-3xl font-bold text-teal-600">{stats.today_appointments}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">This Week</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.this_week_appointments}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Staff Members</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.total_staff}</p>
              </div>
            </div>
          )}

          {/* Appointments Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
                  Appointment Management
                </h2>
                
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === status
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                      {status !== 'all' && stats && (
                        <span className="ml-1">
                          ({stats[`${status}_appointments` as keyof DashboardStats] || 0})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient & Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pets & Services
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.user.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="mb-1">
                            <strong>Pets:</strong> {appointment.pets.map(pet => `${pet.breed} (${pet.type})`).join(', ')}
                          </div>
                          <div>
                            <strong>Services:</strong> {appointment.services.map(service => service.name).join(', ')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1">{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {appointment.status === 'pending' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                              disabled={updatingStatus === appointment.id}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            >
                              {updatingStatus === appointment.id ? <FaSpinner className="animate-spin" /> : 'Confirm'}
                            </button>
                          )}
                          {appointment.status === 'confirmed' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                              disabled={updatingStatus === appointment.id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              {updatingStatus === appointment.id ? <FaSpinner className="animate-spin" /> : 'Complete'}
                            </button>
                          )}
                          {['pending', 'confirmed'].includes(appointment.status) && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                              disabled={updatingStatus === appointment.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {updatingStatus === appointment.id ? <FaSpinner className="animate-spin" /> : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredAppointments.length === 0 && (
                <div className="text-center py-8">
                  <FaClipboardList className="mx-auto text-4xl text-gray-400 mb-4" />
                  <p className="text-gray-500">No appointments found for the selected filter.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;