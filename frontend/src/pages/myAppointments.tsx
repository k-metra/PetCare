import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header';
import { 
    FaCalendarAlt, 
    FaClock, 
    FaDog, 
    FaCat, 
    FaCheckCircle, 
    FaExclamationCircle, 
    FaTimesCircle,
    FaSpinner,
    FaPlus
} from 'react-icons/fa';

interface Pet {
    id: number;
    type: string;
    breed: string;
}

interface Service {
    id: number;
    name: string;
}

interface Appointment {
    id: number;
    appointment_date: string;
    appointment_time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes: string | null;
    pets: Pet[];
    services: Service[];
    created_at: string;
}

export default function MyAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login?redirect=my-appointments');
            return;
        }

        fetchAppointments();
    }, [navigate]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch('http://petcare-production-2613.up.railway.app/api/appointments', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.status) {
                setAppointments(data.appointments);
                setError('');
            } else {
                setError('Failed to fetch appointments');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Error fetching appointments:', err);
        } finally {
            setLoading(false);
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
                return <FaTimesCircle className="text-red-500" />;
            default:
                return <FaExclamationCircle className="text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        // Convert 24-hour format to 12-hour format
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const isUpcoming = (dateString: string, timeString: string) => {
        const appointmentDateTime = new Date(`${dateString} ${timeString}`);
        return appointmentDateTime > new Date();
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 pt-20">
                    <div className="max-w-4xl mx-auto px-4 py-8">
                        <div className="flex items-center justify-center h-64">
                            <FaSpinner className="animate-spin text-4xl text-blue-500" />
                            <span className="ml-3 text-xl text-gray-600">Loading appointments...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    <FaCalendarAlt className="text-blue-600" />
                                    My Appointments
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    View and track the status of your veterinary appointments
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/set-appointment')}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <FaPlus />
                                Book New Appointment
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                            <button 
                                onClick={fetchAppointments}
                                className="ml-4 underline hover:no-underline"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Appointments List */}
                    {appointments.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                            <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No appointments yet
                            </h3>
                            <p className="text-gray-600 mb-6">
                                You haven't booked any appointments. Schedule your first visit with us!
                            </p>
                            <button
                                onClick={() => navigate('/set-appointment')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                            >
                                Book Your First Appointment
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {appointments.map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="p-6">
                                        {/* Appointment Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(appointment.status)}
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {formatDate(appointment.appointment_date)}
                                                    </h3>
                                                    <p className="text-gray-600 flex items-center gap-1">
                                                        <FaClock className="text-sm" />
                                                        {formatTime(appointment.appointment_time)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {isUpcoming(appointment.appointment_date, appointment.appointment_time) && (
                                                    <span className="text-sm text-blue-600 font-medium">
                                                        Upcoming
                                                    </span>
                                                )}
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Pets Section */}
                                        <div className="mb-4">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Pets:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {appointment.pets.map((pet, index) => (
                                                    <div
                                                        key={pet.id}
                                                        className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full text-sm"
                                                    >
                                                        {pet.type === 'dog' ? (
                                                            <FaDog className="text-brown-500" />
                                                        ) : (
                                                            <FaCat className="text-gray-600" />
                                                        )}
                                                        <span className="font-medium">
                                                            Pet #{index + 1}:
                                                        </span>
                                                        <span>
                                                            {pet.breed} ({pet.type})
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Services Section */}
                                        <div className="mb-4">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Services:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {appointment.services.map((service) => (
                                                    <span
                                                        key={service.id}
                                                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                                    >
                                                        {service.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Notes Section */}
                                        {appointment.notes && (
                                            <div className="border-t border-gray-200 pt-4">
                                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes:</h4>
                                                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                                                    {appointment.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Appointment Footer */}
                                    <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500">
                                        Booked on: {new Date(appointment.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Help Section */}
                    <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                            Need help with your appointment?
                        </h3>
                        <p className="text-blue-700 mb-4">
                            If you need to cancel or reschedule your appointment, please contact us directly.
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <span className="text-blue-600">📞 Phone: (+63) 968 388 2727</span>
                            <span className="text-blue-600">✉️ Email: petmedicsvetclinic21@gmail.com</span>
                            <span className="text-blue-600">🕒 Hours: Mon-Sat 8AM-6PM</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}