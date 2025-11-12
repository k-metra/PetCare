import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { apiUrl } from '../utils/apiConfig';
import Header from '../components/header';
import { useNotification } from '../contexts/notificationContext';
import { 
    FaCalendarAlt, 
    FaClock, 
    FaDog, 
    FaCat, 
    FaCheckCircle, 
    FaExclamationCircle, 
    FaTimesCircle,
    FaSpinner,
    FaPlus,
    FaClipboardList,
    FaEye,
    FaBook,
    FaUserMd,
    FaSyringe,
    FaBone,
    FaEdit,
    FaHistory
} from 'react-icons/fa';

interface Pet {
    id: number;
    type: string;
    breed: string;
    name: string;
}

interface Service {
    id: number;
    name: string;
}

interface TestOption {
    name: string;
    price: number;
}

interface MedicalRecord {
    id: number;
    appointment_id: number;
    pet_id: number;
    pet_name: string;
    doctor_name: string | null;
    weight: string | null;
    symptoms: string | null;
    medication: string | null;
    treatment: string | null;
    diagnosis: string | null;
    test_type: string | null;
    selected_tests: TestOption[];
    test_cost: number | null;
    notes: string | null;
    created_at: string;
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
    medical_records?: MedicalRecord[];
}

interface PetAppointmentGroup {
    pet_name: string;
    pet_type: string;
    pet_breed: string;
    appointments: Appointment[];
}

export default function MyAppointments() {
    const { showNotification } = useNotification();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Pet selection state (like My Booklet)
    const [selectedPetData, setSelectedPetData] = useState<PetAppointmentGroup | null>(null);
    
    // Pending appointments expansion state
    const [showAllPending, setShowAllPending] = useState(false);
    
    // Reschedule modal state
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState<number | null>(null);
    const [newSelectedDate, setNewSelectedDate] = useState<Date | undefined>(undefined);
    const [newSelectedTime, setNewSelectedTime] = useState<string>('');
    
    // Medical records state
    const [expandedMedicalRecords, setExpandedMedicalRecords] = useState<number | null>(null);

    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const appointmentId = params.get('id');

    const navigate = useNavigate();

    // Available time slots from 8 AM to 3 PM
    const timeSlots = [
        '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
        '2:00 PM', '2:30 PM', '3:00 PM'
    ];

    // Disable Sundays and past dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const disabledDays = [
        { before: tomorrow },
        { dayOfWeek: [0] }
    ];

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login?redirect=my-appointments');
            return;
        }

        fetchAppointments();
    }, [navigate]);

    useEffect(() => {
        if (action && appointmentId) {
            if (action === 'reschedule') {
                setRescheduleAppointmentId(parseInt(appointmentId));
                setShowRescheduleModal(true);
            }
        }
    }, [action, appointmentId]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch(apiUrl.appointments(), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.status) {
                // Fetch medical records for completed appointments
                const appointmentsWithMedical = await Promise.all(
                    data.appointments.map(async (appointment: Appointment) => {
                        if (appointment.status === 'completed') {
                            try {
                                const medicalResponse = await fetch(apiUrl.medicalRecordsByAppointment(appointment.id), {
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Accept': 'application/json'
                                    }
                                });
                                const medicalData = await medicalResponse.json();
                                if (medicalData.status && medicalData.records) {
                                    appointment.medical_records = medicalData.records;
                                }
                            } catch (error) {
                                console.error('Error fetching medical records:', error);
                            }
                        }
                        return appointment;
                    })
                );
                
                setAppointments(appointmentsWithMedical);
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

    // Helper function to get pet type icon
    const getPetTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'dog':
                return '🐕';
            case 'cat':
                return '🐱';
            case 'bird':
                return '🐦';
            case 'rabbit':
                return '🐰';
            case 'hamster':
                return '🐹';
            default:
                return '🐾';
        }
    };

    // Helper function to organize appointments
    const organizeAppointments = () => {
        const pending = appointments
            .filter(apt => apt.status === 'pending')
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const confirmedAndCompleted = appointments
            .filter(apt => apt.status === 'confirmed' || apt.status === 'completed')
            .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());

        return { pending, confirmedAndCompleted };
    };

    // Helper function to group appointments by pet (like My Booklet)
    const groupAppointmentsByPet = (appointments: Appointment[]): PetAppointmentGroup[] => {
        const petGroups: { [key: string]: PetAppointmentGroup } = {};

        appointments.forEach(appointment => {
            appointment.pets.forEach(pet => {
                const petKey = `${pet.name}-${pet.breed}`.toLowerCase();
                
                if (!petGroups[petKey]) {
                    petGroups[petKey] = {
                        pet_name: pet.name,
                        pet_type: pet.type,
                        pet_breed: pet.breed,
                        appointments: []
                    };
                }
                
                // Only add appointment if it's not already in the group
                if (!petGroups[petKey].appointments.find(apt => apt.id === appointment.id)) {
                    petGroups[petKey].appointments.push(appointment);
                }
            });
        });

        // Sort appointments within each pet group by date (newest first)
        Object.values(petGroups).forEach(group => {
            group.appointments.sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
        });

        return Object.values(petGroups);
    };

    // Format date helper
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format time helper
    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;    
        return `${displayHour}:${minutes}`;
    };

    // Status helpers
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

    // Reschedule functions
    const handleRescheduleClick = (appointmentId: number) => {
        setRescheduleAppointmentId(appointmentId);
        setNewSelectedDate(undefined);
        setNewSelectedTime('');
        setShowRescheduleModal(true);
    };

    const closeRescheduleModal = () => {
        setShowRescheduleModal(false);
        setRescheduleAppointmentId(null);
        setNewSelectedDate(undefined);
        setNewSelectedTime('');
        // Clear URL parameters
        navigate('/my-appointments', { replace: true });
    };

    const convertTo24Hour = (time12h: string): string => {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') {
            hours = '00';
        }
        if (modifier === 'PM') {
            hours = String(parseInt(hours, 10) + 12);
        }
        return `${hours}:${minutes}`;
    };

    const handleRescheduleSubmit = async () => {
        if (!newSelectedDate || !newSelectedTime || !rescheduleAppointmentId) {
            showNotification('Please select both a date and time for the new appointment.', 'error');
            return;
        }

        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const time24h = convertTo24Hour(newSelectedTime);
            
            // Format date in local timezone to avoid timezone issues
            const year = newSelectedDate.getFullYear();
            const month = String(newSelectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(newSelectedDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            
            const response = await fetch(apiUrl.rescheduleAppointment(rescheduleAppointmentId), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    appointment_date: formattedDate,
                    appointment_time: time24h
                })
            });

            const data = await response.json();
            
            if (data.status) {
                showNotification('Appointment rescheduled successfully! 🎉', 'success');
                closeRescheduleModal();
                fetchAppointments();
            } else {
                showNotification(data.message || 'Failed to reschedule appointment. Please try again.', 'error');
            }
        } catch (err) {
            showNotification('Network error. Please try again.', 'error');
            console.error('Error rescheduling appointment:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    // Cancel appointment function
    const handleCancelAppointment = async (appointmentId: number) => {
        if (!window.confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
            return;
        }

        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(apiUrl.cancelAppointment(appointmentId), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.status) {
                showNotification('Appointment cancelled successfully', 'success');
                fetchAppointments();
            } else {
                showNotification(data.message || 'Failed to cancel appointment. Please try again.', 'error');
            }
        } catch (err) {
            showNotification('Network error. Please try again.', 'error');
            console.error('Error cancelling appointment:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-50 pt-20">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="flex items-center justify-center h-64">
                            <FaSpinner className="animate-spin text-4xl text-blue-500" />
                            <span className="ml-3 text-xl text-gray-600">Loading appointments...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const { pending, confirmedAndCompleted } = organizeAppointments();
    const pendingToShow = showAllPending ? pending : pending.slice(0, 3);
    const petGroups = groupAppointmentsByPet(confirmedAndCompleted);

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    <FaCalendarAlt className="text-blue-600" />
                                    My Appointments
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Track your pets' appointment history and medical records
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/my-booklet')}
                                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <FaBook />
                                    My Booklet
                                </button>
                                <button
                                    onClick={() => navigate('/set-appointment')}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <FaPlus />
                                    Book New Appointment
                                </button>
                            </div>
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Sidebar - Pets and Pending Appointments */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    {/* Pending Appointments Section */}
                                    {pending.length > 0 && (
                                        <div className="mb-8">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <FaClock className="text-yellow-500" />
                                                    Pending Appointments
                                                </h3>
                                                {pending.length > 3 && (
                                                    <button
                                                        onClick={() => setShowAllPending(!showAllPending)}
                                                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                                    >
                                                        {showAllPending ? 'Collapse' : `+${pending.length - 3} more`}
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {pendingToShow.map((appointment) => (
                                                    <div key={appointment.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-yellow-800">
                                                                {formatDate(appointment.appointment_date)}
                                                            </span>
                                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                                                {formatTime(appointment.appointment_time)}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-yellow-700">
                                                            {appointment.pets.map(pet => pet.name).join(', ')}
                                                        </div>
                                                        <div className="mt-2 flex gap-2">
                                                            <button
                                                                onClick={() => handleRescheduleClick(appointment.id)}
                                                                className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded transition-colors"
                                                            >
                                                                Reschedule
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancelAppointment(appointment.id)}
                                                                className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Your Pets Section */}
                                    <h3 className="font-semibold text-gray-900 mb-4">Your Pets</h3>
                                    <div className="space-y-3">
                                        {petGroups.map((petGroup, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedPetData(petGroup)}
                                                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                                    selectedPetData?.pet_name === petGroup.pet_name && 
                                                    selectedPetData?.pet_breed === petGroup.pet_breed
                                                        ? 'border-blue-300 bg-blue-50 shadow-sm' 
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-2xl">{getPetTypeIcon(petGroup.pet_type)}</span>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{petGroup.pet_name}</h4>
                                                        <p className="text-sm text-gray-600">{petGroup.pet_breed} • {petGroup.pet_type}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {petGroup.appointments.length} appointment{petGroup.appointments.length !== 1 ? 's' : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {petGroups.length === 0 && pending.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <FaHistory className="text-3xl mx-auto mb-3" />
                                            <p>No appointment history found</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Content - Selected Pet Appointments */}
                            <div className="lg:col-span-2">
                                {selectedPetData ? (
                                    <div className="bg-white rounded-lg shadow-sm p-6">
                                        <div className="flex items-center space-x-3 mb-6">
                                            <span className="text-3xl">{getPetTypeIcon(selectedPetData.pet_type)}</span>
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900">{selectedPetData.pet_name}</h2>
                                                <p className="text-gray-600">{selectedPetData.pet_breed} • {selectedPetData.pet_type}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {selectedPetData.appointments.map((appointment) => (
                                                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center space-x-2">
                                                                <FaCalendarAlt className="text-blue-600" />
                                                                <div>
                                                                    <p className="text-sm text-gray-600">Date & Time</p>
                                                                    <p className="font-medium text-gray-900">
                                                                        {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center space-x-2">
                                                                {getStatusIcon(appointment.status)}
                                                                <div>
                                                                    <p className="text-sm text-gray-600">Status</p>
                                                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                                                                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="flex items-start space-x-2">
                                                                <FaClipboardList className="text-purple-600 mt-1" />
                                                                <div>
                                                                    <p className="text-sm text-gray-600">Services</p>
                                                                    <div className="font-medium text-gray-900">
                                                                        {appointment.services.map((service, idx) => (
                                                                            <span key={service.id}>
                                                                                {service.name}
                                                                                {idx < appointment.services.length - 1 && ', '}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {appointment.status === 'completed' && appointment.medical_records && appointment.medical_records.length > 0 && (
                                                                <button
                                                                    onClick={() => setExpandedMedicalRecords(
                                                                        expandedMedicalRecords === appointment.id ? null : appointment.id
                                                                    )}
                                                                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                                                >
                                                                    <FaEye />
                                                                    <span>View Medical Records</span>
                                                                </button>
                                                            )}

                                                            {appointment.status === 'pending' && (
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleRescheduleClick(appointment.id)}
                                                                        className="flex items-center space-x-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded transition-colors"
                                                                    >
                                                                        <FaEdit />
                                                                        <span>Reschedule</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleCancelAppointment(appointment.id)}
                                                                        className="flex items-center space-x-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded transition-colors"
                                                                    >
                                                                        <FaTimesCircle />
                                                                        <span>Cancel</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Expandable Medical Records */}
                                                    {expandedMedicalRecords === appointment.id && appointment.medical_records && (
                                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                                <FaUserMd className="text-green-600" />
                                                                Medical Records
                                                            </h4>
                                                            <div className="space-y-3">
                                                                {appointment.medical_records.map((record) => (
                                                                    <div key={record.id} className="bg-gray-50 rounded-lg p-3">
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                                            {record.doctor_name && (
                                                                                <div>
                                                                                    <span className="font-medium text-gray-700">Doctor:</span>
                                                                                    <p className="text-gray-900">{record.doctor_name}</p>
                                                                                </div>
                                                                            )}
                                                                            {record.weight && (
                                                                                <div>
                                                                                    <span className="font-medium text-gray-700">Weight:</span>
                                                                                    <p className="text-gray-900">{record.weight}</p>
                                                                                </div>
                                                                            )}
                                                                            {record.symptoms && (
                                                                                <div className="md:col-span-2">
                                                                                    <span className="font-medium text-gray-700">Symptoms:</span>
                                                                                    <p className="text-gray-900">{record.symptoms}</p>
                                                                                </div>
                                                                            )}
                                                                            {record.diagnosis && (
                                                                                <div className="md:col-span-2">
                                                                                    <span className="font-medium text-gray-700">Diagnosis:</span>
                                                                                    <p className="text-gray-900">{record.diagnosis}</p>
                                                                                </div>
                                                                            )}
                                                                            {record.treatment && (
                                                                                <div className="md:col-span-2">
                                                                                    <span className="font-medium text-gray-700">Treatment:</span>
                                                                                    <p className="text-gray-900">{record.treatment}</p>
                                                                                </div>
                                                                            )}
                                                                            {record.medication && (
                                                                                <div className="md:col-span-2">
                                                                                    <span className="font-medium text-gray-700">Medication:</span>
                                                                                    <p className="text-gray-900">{record.medication}</p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <p className="text-xs text-gray-500">
                                                            Appointment #{appointment.id} • Created {new Date(appointment.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {selectedPetData.appointments.length === 0 && (
                                            <div className="text-center py-8">
                                                <FaCalendarAlt className="text-gray-400 text-3xl mx-auto mb-3" />
                                                <p className="text-gray-600">No appointments found for {selectedPetData.pet_name}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                        <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            Select a Pet
                                        </h3>
                                        <p className="text-gray-600">
                                            Choose a pet from the sidebar to view their appointment history and medical records.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Reschedule Modal */}
                    {showRescheduleModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900">Reschedule Appointment</h2>
                                </div>
                                
                                <div className="p-6 space-y-6">
                                    {/* Date Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select New Date
                                        </label>
                                        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                            <DayPicker
                                                mode="single"
                                                selected={newSelectedDate}
                                                onSelect={setNewSelectedDate}
                                                disabled={disabledDays}
                                                className="mx-auto"
                                                modifiersClassNames={{
                                                    selected: 'bg-blue-600 text-white hover:bg-blue-700',
                                                    today: 'bg-blue-100 text-blue-900 font-semibold'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Time Selection */}
                                    {newSelectedDate && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select New Time
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {timeSlots.map((time) => (
                                                    <button
                                                        key={time}
                                                        onClick={() => setNewSelectedTime(time)}
                                                        className={`p-2 text-sm border rounded-lg transition-colors ${
                                                            newSelectedTime === time
                                                                ? 'bg-blue-600 text-white border-blue-600'
                                                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                                                        }`}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                                    <button
                                        onClick={closeRescheduleModal}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRescheduleSubmit}
                                        disabled={!newSelectedDate || !newSelectedTime || isProcessing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isProcessing ? <FaSpinner className="animate-spin" /> : null}
                                        {isProcessing ? 'Rescheduling...' : 'Reschedule Appointment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};