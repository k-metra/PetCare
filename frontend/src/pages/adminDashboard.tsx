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
  FaExclamationTriangle,
  FaEye,
  FaTimes,
  FaTrash
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
  name?: string;
  grooming_details?: {
    [category: string]: Array<{
      service: string;
      size: string;
      price: number;
      package: string;
    }>;
  };
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

interface TestOption {
  name: string;
  price: number;
}

interface PetMedicalRecord {
  petId: number;
  petName: string;
  weight: string;
  symptoms: string;
  medication: string;
  treatment: string;
  diagnosis: string;
  testType: string;
  selectedTests: TestOption[];
  notes: string;
}

interface MedicalExamination {
  appointmentId: number;
  doctorName: string;
  petRecords: PetMedicalRecord[];
  totalCost: number;
}

const AdminDashboard: React.FC = () => {
  // Test options for each test type
  const testOptions = {
    'Laboratory Test': [
      { name: 'Direct Fecal Smear/Skin Scraping/Eye Straining/Ear Swab', price: 450.00 },
      { name: 'Complete Blood Count (CBC)', price: 500.00 },
      { name: 'Dermatophytest', price: 400.00 },
      { name: 'Otoscopy', price: 350.00 },
      { name: 'Woods Lump', price: 1700.00 },
      { name: 'Blood Chem Basic (Gluc, Creo, BUN, ALT, AST)', price: 400.00 },
      { name: 'Blood Chem Compre (16>)', price: 2600.00 },
      { name: 'CBC + Blood Chem Basic', price: 2300.00 },
      { name: 'CBC + Blood Chem Compre (16>)', price: 3000.00 },
      { name: 'CBC + Blood Chem +SDMA', price: 1300.00 },
      { name: 'Electrolyte Test (K,No,CI,P)', price: 3350.00 },
      { name: 'Glucose Test for Monitoring DM', price: 500.00 },
      { name: 'BUN / Crea / SGPT SGOT', price: 500.00 },
      { name: 'Skin Cytology / Vaginal Smear', price: 500.00 },
      { name: 'Ultrasound', price: 1000.00 },
      { name: 'Urinalysis / Urine Microscopy', price: 1550.00 },
      { name: 'Bacterial Culture and Antibiotic Sensitivity Test', price: 3500.00 },
      { name: 'Bacterial Culture (for Body Fluids)', price: 4700.00 },
      { name: 'Biopsy', price: 3500.00 },
    ],
    'Rapid Test Kits': [
      { name: 'Parvo/Distemper Ag Test', price: 700.00 },
      { name: 'Canine Heartworm Ag Test', price: 800.00 },
      { name: 'Canine Ehrlichia Ab Test', price: 750.00 },
      { name: 'Canine Combo Test (2way, 3way, 4way, 5way)', price: 1200.00 },
      { name: 'Feling Combo Test (2way,3way,4way)', price: 1200.00 },
      { name: 'FPV/FHV/FCV/Felv Ag Test', price: 1000.00 },
      { name: 'Leptospirosis Ag Test', price: 900.00 },
      { name: 'ICHV + CPV + CDV Titer Test', price: 1100.00 },
    ],
    'Immunoassay Test': [
      { name: 'Parvo/Distemper Ag Test (Single Test)', price: 650.00 },
      { name: 'Canine/ Combo Test (2-way,3-way,4-way)', price: 1000.00 },
      { name: 'Canine / Feline Titer Test (Single)', price: 1000.00 },
      { name: 'Canine / Feline Titer Test (3way)', price: 1200.00 },
      { name: 'FPV/FCV/FHV Ag Test (Single Test)', price: 600.00 },
      { name: 'CTSH, CTT4 / FTSH/ FTT4', price: 1200.00 },
      { name: 'C-Progresterone Test', price: 1000.00 },
      { name: 'CSDMA / FSDMA', price: 1000.00 },
      { name: 'CCRP / FSAA', price: 1000.00 },
      { name: 'CPL/FPL', price: 1200.00 },
    ],
    'Polymerase Chain Reaction Test': [
      { name: 'Canine Leptospirosis', price: 3300.00 },
      { name: 'Canine Rabies Virus', price: 3500.00 },
      { name: 'B. canis + B. gibsoni (Duplex)', price: 3700.00 },
      { name: 'E. canis + A. phago + A. platys (Triplex)', price: 4000.00 },
      { name: 'E. canis + B. canis + B. gibsoni (Triplex)', price: 4000.00 },
      { name: 'E. canis + B.canis + B. gibsoni + A. phoga + A. platys (Pentaplex)', price: 6500.00 },
    ],
  };

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [user, setUser] = useState<any>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [appointmentToComplete, setAppointmentToComplete] = useState<Appointment | null>(null);
  const [medicalExam, setMedicalExam] = useState<MedicalExamination | null>(null);
  const [activeTab, setActiveTab] = useState<'appointments' | 'petRecords' | 'analytics'>('appointments');
  const [petRecords, setPetRecords] = useState<any[]>([]);
  const [recordsSearchTerm, setRecordsSearchTerm] = useState('');
  const [selectedPetRecord, setSelectedPetRecord] = useState<any | null>(null);
  const [showPetRecordModal, setShowPetRecordModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [recentRecords, setRecentRecords] = useState<Appointment[]>([]);

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
    fetchPetRecords();
    fetchAnalyticsData();
    fetchRecentRecords();
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
    // If completing appointment, show medical examination modal instead
    if (newStatus === 'completed') {
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (appointment) {
        setAppointmentToComplete(appointment);
        initializeMedicalExam(appointment);
        setShowMedicalModal(true);
      }
      return;
    }

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

  const handleViewDetails = async (appointment: Appointment) => {
    // Debug logging for development
    console.log('Appointment data:', appointment);
    appointment.pets.forEach((pet, index) => {
      if (pet.grooming_details) {
        console.log(`Pet ${index} (${pet.name || 'unnamed'}) grooming details:`, pet.grooming_details);
      }
    });
    
    // If appointment is completed, fetch medical records
    let appointmentWithMedical = { ...appointment, medicalRecords: [] };
    if (appointment.status === 'completed') {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:8000/api/medical-records?appointment_id=${appointment.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        const data = await response.json();
        if (data.status && data.records) {
          appointmentWithMedical.medicalRecords = data.records.filter((record: any) => record.appointment_id === appointment.id);
        }
      } catch (error) {
        console.error('Error fetching medical records:', error);
      }
    }
    
    setSelectedAppointment(appointmentWithMedical);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setSelectedAppointment(null);
    setShowDetailsModal(false);
  };

  const deleteAppointment = async (appointmentId: number, appointmentStatus: string) => {
    // Only allow deletion of canceled or pending appointments
    if (!['cancelled', 'pending'].includes(appointmentStatus)) {
      alert('Only canceled or pending appointments can be deleted');
      return;
    }

    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      return;
    }

    setUpdatingStatus(appointmentId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/admin/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      if (data.status) {
        // Remove appointment from local state
        setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
        // Refresh stats
        fetchDashboardData();
        alert('Appointment deleted successfully');
      } else {
        alert(data.message || 'Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('An error occurred while deleting the appointment');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Helper function to safely parse grooming details
  const parseGroomingDetails = (groomingDetails: any) => {
    if (!groomingDetails) return {};
    
    if (typeof groomingDetails === 'string') {
      try {
        return JSON.parse(groomingDetails);
      } catch (e) {
        console.error('Failed to parse grooming details:', e);
        return {};
      }
    }
    
    return groomingDetails;
  };

  // Initialize medical examination
  const initializeMedicalExam = (appointment: Appointment) => {
    const petRecords: PetMedicalRecord[] = appointment.pets.map(pet => ({
      petId: pet.id,
      petName: pet.name || 'Unnamed Pet',
      weight: '',
      symptoms: '',
      medication: '',
      treatment: '',
      diagnosis: '',
      testType: '',
      selectedTests: [],
      notes: '',
    }));

    setMedicalExam({
      appointmentId: appointment.id,
      doctorName: '',
      petRecords,
      totalCost: 0,
    });
  };

  const updateMedicalExam = (field: string, value: any) => {
    if (!medicalExam) return;
    setMedicalExam({ ...medicalExam, [field]: value });
  };

  const updatePetRecord = (petIndex: number, field: string, value: any) => {
    if (!medicalExam) return;
    const updatedRecords = [...medicalExam.petRecords];
    updatedRecords[petIndex] = { ...updatedRecords[petIndex], [field]: value };
    
    // Calculate total cost
    const totalCost = updatedRecords.reduce((sum, record) => {
      return sum + record.selectedTests.reduce((testSum, test) => testSum + test.price, 0);
    }, 0);
    
    setMedicalExam({
      ...medicalExam,
      petRecords: updatedRecords,
      totalCost,
    });
  };

  const toggleTestSelection = (petIndex: number, test: TestOption) => {
    if (!medicalExam) return;
    const updatedRecords = [...medicalExam.petRecords];
    const currentTests = updatedRecords[petIndex].selectedTests;
    
    const isSelected = currentTests.some(t => t.name === test.name);
    if (isSelected) {
      updatedRecords[petIndex].selectedTests = currentTests.filter(t => t.name !== test.name);
    } else {
      updatedRecords[petIndex].selectedTests = [...currentTests, test];
    }
    
    // Calculate total cost
    const totalCost = updatedRecords.reduce((sum, record) => {
      return sum + record.selectedTests.reduce((testSum, test) => testSum + test.price, 0);
    }, 0);
    
    setMedicalExam({
      ...medicalExam,
      petRecords: updatedRecords,
      totalCost,
    });
  };

  const completeMedicalExamination = async () => {
    if (!medicalExam || !appointmentToComplete) return;

    // Check if any medical examination was performed
    const hasMedicalData = medicalExam.petRecords.some(record => 
      record.testType || record.weight || record.symptoms || record.diagnosis || 
      record.medication || record.treatment || record.selectedTests.length > 0
    );

    // If medical data exists, validate required fields
    if (hasMedicalData) {
      if (!medicalExam.doctorName.trim()) {
        alert('Please enter doctor\'s name for medical examination');
        return;
      }

      for (let i = 0; i < medicalExam.petRecords.length; i++) {
        const record = medicalExam.petRecords[i];
        
        // If any medical field is filled, validate required fields for that pet
        const petHasMedicalData = record.testType || record.weight || record.symptoms || 
                                  record.diagnosis || record.medication || record.treatment || 
                                  record.selectedTests.length > 0;
        
        if (petHasMedicalData) {
          if (!record.weight || !record.symptoms || !record.diagnosis) {
            alert(`Please complete all required medical fields for ${record.petName} (weight, symptoms, diagnosis)`);
            return;
          }
          if (!record.testType) {
            alert(`Please select test type for ${record.petName}`);
            return;
          }
        }
      }
    }

    try {
      setUpdatingStatus(appointmentToComplete.id);

      // If there's no medical data, skip saving medical records and just mark completed
      const token = localStorage.getItem('token');
      if (!hasMedicalData) {
        const statusResponse = await fetch(`http://127.0.0.1:8000/api/admin/appointments/${appointmentToComplete.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({ status: 'completed' })
        });

        if (statusResponse.ok) {
          // Update local state
          setAppointments(prev => 
            prev.map(apt => 
              apt.id === appointmentToComplete.id 
                ? { ...apt, status: 'completed' as any }
                : apt
            )
          );

          // Close modal and refresh data
          setShowMedicalModal(false);
          setMedicalExam(null);
          setAppointmentToComplete(null);
          fetchDashboardData();
        } else {
          alert('Failed to update appointment status');
        }
      } else {
        // Save medical records when medical data exists
        const response = await fetch('http://127.0.0.1:8000/api/medical-records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            appointment_id: appointmentToComplete.id,
            doctor_name: medicalExam.doctorName,
            pet_records: medicalExam.petRecords,
            total_cost: medicalExam.totalCost,
          })
        });

        if (response.ok) {
          // Update appointment status to completed
          const statusResponse = await fetch(`http://127.0.0.1:8000/api/admin/appointments/${appointmentToComplete.id}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            body: JSON.stringify({ status: 'completed' })
          });

          if (statusResponse.ok) {
            // Update local state
            setAppointments(prev => 
              prev.map(apt => 
                apt.id === appointmentToComplete.id 
                  ? { ...apt, status: 'completed' as any }
                  : apt
              )
            );
            
            // Close modal and refresh data
            setShowMedicalModal(false);
            setMedicalExam(null);
            setAppointmentToComplete(null);
            fetchDashboardData();
            fetchPetRecords();
          } else {
            alert('Failed to update appointment status');
          }
        } else {
          alert('Failed to save medical records');
        }
      }
    } catch (error) {
      console.error('Error completing medical examination:', error);
      alert('An error occurred while saving medical records');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const cancelMedicalExamination = () => {
    setShowMedicalModal(false);
    setMedicalExam(null);
    setAppointmentToComplete(null);
  };

  const fetchPetRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/medical-records', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      if (data.status) {
        setPetRecords(data.records || []);
      }
    } catch (error) {
      console.error('Error fetching pet records:', error);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access to analytics data');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status) {
        setAnalyticsData(data.analytics);
      } else {
        console.error('Analytics API returned error:', data.message);
        // Set empty analytics data to stop loading state
        setAnalyticsData({
          monthlyAppointments: {},
          todayEarnings: 0,
          monthlyEarnings: 0,
          avgMonthlyAppointments: 0
        });
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Set empty analytics data to stop loading state
      setAnalyticsData({
        monthlyAppointments: {},
        todayEarnings: 0,
        monthlyEarnings: 0,
        avgMonthlyAppointments: 0
      });
    }
  };

  const fetchRecentRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/admin/recent-appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access to recent records');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status) {
        setRecentRecords(data.appointments || []);
      } else {
        console.error('Recent records API returned error:', data.message);
        setRecentRecords([]);
      }
    } catch (error) {
      console.error('Error fetching recent records:', error);
      setRecentRecords([]);
    }
  };

  const handleViewPetRecord = (record: any) => {
    setSelectedPetRecord(record);
    setShowPetRecordModal(true);
  };

  const handleClosePetRecord = () => {
    setSelectedPetRecord(null);
    setShowPetRecordModal(false);
  };

  // Helper function to calculate grooming total for a pet
  const calculatePetGroomingTotal = (groomingDetails: any) => {
    const parsed = parseGroomingDetails(groomingDetails);
    
    // Handle flat structure (old format with direct properties)
    if (parsed.category && parsed.size && parsed.price !== undefined) {
      return typeof parsed.price === 'number' ? parsed.price : parseFloat(parsed.price) || 0;
    }
    
    // Handle nested structure (new format with categories and service arrays)
    return Object.values(parsed).reduce((total: number, services: any) => {
      if (Array.isArray(services)) {
        return total + services.reduce((sum: number, service: any) => {
          const price = typeof service.price === 'number' ? service.price : parseFloat(service.price) || 0;
          return sum + price;
        }, 0);
      }
      return total;
    }, 0);
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

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'appointments'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Appointments
                </button>
                <button
                  onClick={() => setActiveTab('petRecords')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'petRecords'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pet Records
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'analytics'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Analytics
                </button>
              </nav>
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Canceled Appointments</h3>
                <p className="text-3xl font-bold text-red-600">{stats.cancelled_appointments}</p>
              </div>
            </div>
          )}

          {/* Appointments Management */}
          {activeTab === 'appointments' && (
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
                            <strong>Pets:</strong> {appointment.pets.map((pet, index) => {
                              const petName = pet.name || `Pet #${index + 1}`;
                              return `${petName} (${pet.breed} ${pet.type})`;
                            }).join(', ')}
                          </div>
                          <div className="mb-1">
                            <strong>Services:</strong> {appointment.services.map(service => service.name).join(', ')}
                          </div>
                          {appointment.pets.some(pet => pet.grooming_details && Object.keys(pet.grooming_details).length > 0) && (
                            <div className="text-xs text-teal-600">
                              <strong>Grooming:</strong> {appointment.pets.filter(pet => pet.grooming_details).length} pet(s) with grooming services
                            </div>
                          )}
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
                          <button
                            onClick={() => handleViewDetails(appointment)}
                            className="text-teal-600 hover:text-teal-900 flex items-center"
                          >
                            <FaEye className="mr-1" />
                            Details
                          </button>
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
                          {['pending', 'cancelled'].includes(appointment.status) && (
                            <button
                              onClick={() => deleteAppointment(appointment.id, appointment.status)}
                              disabled={updatingStatus === appointment.id}
                              className="text-red-800 hover:text-red-900 disabled:opacity-50 flex items-center"
                              title="Delete appointment (pending/cancelled only)"
                            >
                              {updatingStatus === appointment.id ? <FaSpinner className="animate-spin" /> : (
                                <>
                                  <FaTrash className="mr-1" />
                                  Delete
                                </>
                              )}
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
        )}

          {/* Pet Records Management */}
          {activeTab === 'petRecords' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
                    Pet Medical Records
                  </h2>
                  
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by pet name..."
                      value={recordsSearchTerm}
                      onChange={(e) => setRecordsSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pet Information
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Diagnosis
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tests & Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {petRecords
                      .filter(record => 
                        recordsSearchTerm === '' || 
                        record.pet_name.toLowerCase().includes(recordsSearchTerm.toLowerCase())
                      )
                      .map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{record.pet_name}</div>
                              <div className="text-sm text-gray-500">Weight: {record.weight} kg</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(record.created_at).toLocaleDateString()}</div>
                            <div className="text-sm text-gray-500">Dr. {record.doctor_name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{record.diagnosis}</div>
                            <div className="text-sm text-gray-500">{record.symptoms}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{record.test_type}</div>
                            <div className="text-sm text-gray-500">
                              {record.selected_tests && record.selected_tests.length > 0 
                                ? `${record.selected_tests.length} test(s) - ₱${record.test_cost || 0}`
                                : 'No tests'
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewPetRecord(record)}
                              className="text-teal-600 hover:text-teal-900"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                
                {petRecords.length === 0 && (
                  <div className="text-center py-8">
                    <FaClipboardList className="mx-auto text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-500">No pet records found.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                      <p className="text-2xl font-bold text-gray-900">₱{analyticsData?.todayEarnings || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
                      <p className="text-2xl font-bold text-gray-900">₱{analyticsData?.monthlyEarnings || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FaCalendarAlt className="text-purple-600 text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Monthly Appointments</p>
                      <p className="text-2xl font-bold text-gray-900">{analyticsData?.avgMonthlyAppointments || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Appointments Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Appointments Report</h3>
                {analyticsData && analyticsData.monthlyAppointments ? (
                  <div className="space-y-4">
                    {Object.entries(analyticsData.monthlyAppointments).map(([month, count]: [string, any]) => {
                      const countNum = Number(count);
                      const maxCount = Math.max(1, ...Object.values(analyticsData.monthlyAppointments).map((val: any) => Number(val)));
                      const percentage = maxCount > 0 ? (countNum / maxCount) * 100 : 0;
                      
                      return (
                        <div key={month} className="flex items-center space-x-4">
                          <div className="w-24 text-sm font-medium text-gray-700">
                            {month}
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                            <div
                              className="bg-teal-600 h-6 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                              style={{ width: `${Math.max(percentage, countNum > 0 ? 10 : 0)}%` }}
                            >
                              {countNum > 0 && (
                                <span className="text-white text-sm font-medium">
                                  {countNum}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-16 text-sm text-gray-600">
                            {countNum} apt{countNum !== 1 ? 's' : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    {analyticsData === null ? (
                      <>
                        <FaSpinner className="animate-spin text-4xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Loading chart data...</p>
                      </>
                    ) : (
                      <>
                        <FaClipboardList className="mx-auto text-4xl text-gray-400 mb-4" />
                        <p className="text-gray-500">No appointment data available.</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Recent Records */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h3>
                <p className="text-sm text-gray-600 mb-4">Three most recent appointments (excluding cancelled)</p>
                
                {recentRecords.length > 0 ? (
                  <div className="space-y-4">
                    {recentRecords.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-medium text-gray-900">
                                {appointment.user.name}
                              </h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                {getStatusIcon(appointment.status)}
                                <span className="ml-1">{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <p><span className="font-medium">Email:</span> {appointment.user.email}</p>
                                <p><span className="font-medium">Date:</span> {new Date(appointment.appointment_date).toLocaleDateString()}</p>
                                <p><span className="font-medium">Time:</span> {appointment.appointment_time}</p>
                              </div>
                              <div>
                                <p><span className="font-medium">Pets:</span> {appointment.pets.map(pet => pet.name || 'Unnamed').join(', ')}</p>
                                <p><span className="font-medium">Services:</span> {appointment.services.map(service => service.name).join(', ')}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            {appointment.status === 'pending' && (
                              <button
                                onClick={() => handleViewDetails(appointment)}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                              >
                                View Details
                              </button>
                            )}
                            {appointment.status !== 'pending' && (
                              <button
                                onClick={() => handleViewDetails(appointment)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                              >
                                View Details
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaClipboardList className="mx-auto text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-500">No recent appointments found.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Appointment Details - #{selectedAppointment.id}
              </h3>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 space-y-6">
              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Name</p>
                    <p className="text-gray-900">{selectedAppointment.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-900">{selectedAppointment.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Date & Time</p>
                    <p className="text-gray-900">
                      {new Date(selectedAppointment.appointment_date).toLocaleDateString()} at {selectedAppointment.appointment_time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                      {getStatusIcon(selectedAppointment.status)}
                      <span className="ml-1">{selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}</span>
                    </span>
                  </div>
                </div>
                {selectedAppointment.notes && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-600">Notes</p>
                    <p className="text-gray-900">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>

              {/* Services */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Services</h4>
                <div className="space-y-2">
                  {selectedAppointment.services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center bg-white rounded p-3">
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-gray-600">{service.description}</p>
                        )}
                      </div>
                      <span className="text-blue-600 font-semibold">₱{service.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pet Information */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Pet Information</h4>
                <div className="space-y-4">
                  {selectedAppointment.pets.map((pet, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="font-semibold text-gray-900">
                            {pet.name || `Pet #${index + 1}`}
                          </h5>
                          <p className="text-gray-600">{pet.breed} ({pet.type})</p>
                        </div>
                      </div>

                      {/* Grooming Details */}
                      {pet.grooming_details && (
                        <div className="mt-4">
                          <h6 className="font-medium text-gray-900 mb-2">Grooming Services</h6>
                          {(() => {
                            const parsedDetails = parseGroomingDetails(pet.grooming_details);
                            
                            // Debug information
                            console.log(`Pet grooming details (raw):`, pet.grooming_details);
                            console.log(`Pet grooming details (parsed):`, parsedDetails);
                            console.log(`Pet grooming details keys:`, Object.keys(parsedDetails));
                            
                            // Check if this is the old flat structure (category, size, price, isPackage as direct properties)
                            const hasOldStructure = parsedDetails.category && parsedDetails.size && parsedDetails.price !== undefined;
                            
                            if (hasOldStructure) {
                              // Handle the flat structure
                              return (
                                <div className="bg-gray-50 rounded p-3">
                                  <div className="flex justify-between items-center text-sm">
                                    <div>
                                      <span className="text-gray-700">{parsedDetails.category || 'Grooming Service'}</span>
                                      <span className="text-gray-500 ml-2">({parsedDetails.size || 'N/A'})</span>
                                      {parsedDetails.isPackage && (
                                        <span className="text-teal-600 ml-2 text-xs bg-teal-100 px-2 py-1 rounded">
                                          Package
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-green-600 font-medium">
                                      ₱{typeof parsedDetails.price === 'number' ? parsedDetails.price : parseFloat(parsedDetails.price) || 0}
                                    </span>
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="flex justify-between items-center font-semibold">
                                      <span className="text-gray-800">Pet Grooming Total:</span>
                                      <span className="text-green-600">
                                        ₱{typeof parsedDetails.price === 'number' ? parsedDetails.price : parseFloat(parsedDetails.price) || 0}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            // Handle the new nested structure
                            if (!parsedDetails || Object.keys(parsedDetails).length === 0) {
                              return (
                                <div className="bg-yellow-50 rounded p-3">
                                  <p className="text-yellow-800 text-sm">
                                    Grooming services selected but details not available.
                                  </p>
                                  <p className="text-xs text-yellow-600 mt-1">
                                    Raw data: {JSON.stringify(pet.grooming_details)}
                                  </p>
                                </div>
                              );
                            }

                            return (
                              <>
                                <div className="space-y-3">
                                  {Object.entries(parsedDetails).map(([category, services]) => (
                                    <div key={category} className="bg-gray-50 rounded p-3">
                                      <p className="font-medium text-gray-800 mb-2">{category}</p>
                                      <div className="space-y-2">
                                        {Array.isArray(services) ? services.map((service: any, serviceIndex: number) => (
                                          <div key={serviceIndex} className="flex justify-between items-center text-sm">
                                            <div>
                                              <span className="text-gray-700">{service.service || service.name || 'Unknown Service'}</span>
                                              <span className="text-gray-500 ml-2">({service.size || 'N/A'})</span>
                                              {service.package && (
                                                <span className="text-teal-600 ml-2 text-xs bg-teal-100 px-2 py-1 rounded">
                                                  {service.package}
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-green-600 font-medium">
                                              ₱{typeof service.price === 'number' ? service.price : parseFloat(service.price) || 0}
                                            </span>
                                          </div>
                                        )) : (
                                          <p className="text-sm text-gray-500">No services in this category</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="flex justify-between items-center font-semibold">
                                    <span className="text-gray-800">Pet Grooming Total:</span>
                                    <span className="text-green-600">₱{calculatePetGroomingTotal(pet.grooming_details)}</span>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical Records (for completed appointments) */}
              {selectedAppointment.status === 'completed' && (selectedAppointment as any).medicalRecords && (selectedAppointment as any).medicalRecords.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Medical Examination Results</h4>
                  <div className="space-y-4">
                    {(selectedAppointment as any).medicalRecords.map((record: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Pet Name</p>
                            <p className="text-gray-900">{record.pet_name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Doctor</p>
                            <p className="text-gray-900">Dr. {record.doctor_name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Weight</p>
                            <p className="text-gray-900">{record.weight} kg</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Test Type</p>
                            <p className="text-gray-900">{record.test_type || 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Symptoms</p>
                            <p className="text-gray-900">{record.symptoms || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Diagnosis</p>
                            <p className="text-gray-900">{record.diagnosis || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Medication</p>
                            <p className="text-gray-900">{record.medication || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Treatment</p>
                            <p className="text-gray-900">{record.treatment || 'N/A'}</p>
                          </div>
                        </div>

                        {record.selected_tests && record.selected_tests.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-600 mb-2">Tests Performed</p>
                            <div className="space-y-2">
                              {record.selected_tests.map((test: any, testIndex: number) => (
                                <div key={testIndex} className="bg-gray-50 rounded p-2 flex justify-between items-center">
                                  <span className="text-sm text-gray-900">{test.name}</span>
                                  <span className="text-sm font-medium text-purple-600">₱{test.price}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <div className="flex justify-between text-sm font-medium">
                                <span>Test Cost for {record.pet_name}:</span>
                                <span className="text-purple-600">₱{record.test_cost || 0}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {record.notes && (
                          <div>
                            <p className="text-sm font-medium text-gray-600">Notes</p>
                            <p className="text-gray-900 text-sm">{record.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Summary */}
              <div className="bg-teal-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Appointment Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Services Total:</span>
                    <span className="font-medium">₱{selectedAppointment.services.reduce((sum, service) => sum + parseFloat(service.price), 0)}</span>
                  </div>
                  {selectedAppointment.pets.some(pet => pet.grooming_details) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grooming Total:</span>
                      <span className="font-medium">
                        ₱{selectedAppointment.pets.reduce((total, pet) => {
                          return total + calculatePetGroomingTotal(pet.grooming_details);
                        }, 0)}
                      </span>
                    </div>
                  )}
                  {selectedAppointment.status === 'completed' && (selectedAppointment as any).medicalRecords && (selectedAppointment as any).medicalRecords.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medical Tests Total:</span>
                      <span className="font-medium">
                        ₱{(selectedAppointment as any).medicalRecords.reduce((total: number, record: any) => {
                          return total + (parseFloat(record.test_cost) || 0);
                        }, 0)}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-300">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Grand Total:</span>
                      <span className="text-teal-600">
                        ₱{selectedAppointment.services.reduce((sum, service) => sum + parseFloat(service.price), 0) +
                          selectedAppointment.pets.reduce((total, pet) => {
                            return total + calculatePetGroomingTotal(pet.grooming_details);
                          }, 0) +
                          (selectedAppointment.status === 'completed' && (selectedAppointment as any).medicalRecords ? 
                            (selectedAppointment as any).medicalRecords.reduce((total: number, record: any) => {
                              return total + (parseFloat(record.test_cost) || 0);
                            }, 0) : 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseDetails}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {['pending', 'confirmed'].includes(selectedAppointment.status) && (
                  <div className="flex space-x-2">
                    {selectedAppointment.status === 'pending' && (
                      <button
                        onClick={() => {
                          updateAppointmentStatus(selectedAppointment.id, 'confirmed');
                          handleCloseDetails();
                        }}
                        disabled={updatingStatus === selectedAppointment.id}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {updatingStatus === selectedAppointment.id ? <FaSpinner className="animate-spin" /> : 'Confirm Appointment'}
                      </button>
                    )}
                    {selectedAppointment.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          updateAppointmentStatus(selectedAppointment.id, 'completed');
                          handleCloseDetails();
                        }}
                        disabled={updatingStatus === selectedAppointment.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {updatingStatus === selectedAppointment.id ? <FaSpinner className="animate-spin" /> : 'Mark Complete'}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        updateAppointmentStatus(selectedAppointment.id, 'cancelled');
                        handleCloseDetails();
                      }}
                      disabled={updatingStatus === selectedAppointment.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {updatingStatus === selectedAppointment.id ? <FaSpinner className="animate-spin" /> : 'Cancel Appointment'}
                    </button>
                  </div>
                )}
                {['pending', 'cancelled'].includes(selectedAppointment.status) && (
                  <button
                    onClick={() => {
                      deleteAppointment(selectedAppointment.id, selectedAppointment.status);
                      handleCloseDetails();
                    }}
                    disabled={updatingStatus === selectedAppointment.id}
                    className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 disabled:opacity-50 transition-colors flex items-center"
                    title="Delete appointment (pending/cancelled only)"
                  >
                    {updatingStatus === selectedAppointment.id ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <>
                        <FaTrash className="mr-2" />
                        Delete Appointment
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medical Examination Modal */}
      {showMedicalModal && medicalExam && appointmentToComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Complete Appointment #{appointmentToComplete.id}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Medical examination is optional - only fill if health checkup was performed
                </p>
              </div>
              <button
                onClick={cancelMedicalExamination}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 space-y-6">
              {/* Doctor Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Doctor Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Doctor's Name (required only for medical exams)
                    </label>
                    <input
                      type="text"
                      value={medicalExam.doctorName}
                      onChange={(e) => updateMedicalExam('doctorName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter doctor's name (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Date
                    </label>
                    <input
                      type="text"
                      value={new Date(appointmentToComplete.appointment_date).toLocaleDateString()}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Pet Records */}
              {medicalExam.petRecords.map((petRecord, petIndex) => (
                <div key={petIndex} className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Pet {petIndex + 1}: {petRecord.petName}
                  </h4>
                  
                  {/* Test Type Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Type (optional - for medical examinations only)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.keys(testOptions).map((testType) => (
                        <label key={testType} className="flex items-center">
                          <input
                            type="radio"
                            name={`testType-${petIndex}`}
                            value={testType}
                            checked={petRecord.testType === testType}
                            onChange={(e) => updatePetRecord(petIndex, 'testType', e.target.value)}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">{testType}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Test Options */}
                  {petRecord.testType && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Tests for {petRecord.testType}
                      </label>
                      <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded p-3">
                        {testOptions[petRecord.testType as keyof typeof testOptions].map((test, testIndex) => (
                          <label key={testIndex} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={petRecord.selectedTests.some(t => t.name === test.name)}
                                onChange={() => toggleTestSelection(petIndex, test)}
                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">{test.name}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">₱{test.price.toFixed(2)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Test Results */}
                  <div className="bg-white rounded p-4 mb-4">
                    <h5 className="font-medium text-gray-900 mb-3">Medical Examination (Optional)</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={petRecord.weight}
                          onChange={(e) => updatePetRecord(petIndex, 'weight', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter weight in kg (optional)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Symptoms
                        </label>
                        <input
                          type="text"
                          value={petRecord.symptoms}
                          onChange={(e) => updatePetRecord(petIndex, 'symptoms', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter symptoms (optional)"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Medication
                        </label>
                        <input
                          type="text"
                          value={petRecord.medication}
                          onChange={(e) => updatePetRecord(petIndex, 'medication', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter medication"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Treatment
                        </label>
                        <input
                          type="text"
                          value={petRecord.treatment}
                          onChange={(e) => updatePetRecord(petIndex, 'treatment', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter treatment"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Diagnosis
                      </label>
                      <input
                        type="text"
                        value={petRecord.diagnosis}
                        onChange={(e) => updatePetRecord(petIndex, 'diagnosis', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter diagnosis (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={petRecord.notes}
                        onChange={(e) => updatePetRecord(petIndex, 'notes', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter additional notes"
                      />
                    </div>
                  </div>

                  {/* Pet Test Summary */}
                  {petRecord.selectedTests.length > 0 && (
                    <div className="bg-gray-100 rounded p-3">
                      <h6 className="font-medium text-gray-900 mb-2">Selected Tests for {petRecord.petName}</h6>
                      <div className="space-y-1">
                        {petRecord.selectedTests.map((test, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-700">{test.name}</span>
                            <span className="text-gray-900 font-medium">₱{test.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-300 mt-2 pt-2">
                        <div className="flex justify-between font-medium">
                          <span>Pet Total:</span>
                          <span>₱{petRecord.selectedTests.reduce((sum, test) => sum + test.price, 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Billing Summary */}
              <div className="bg-teal-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Billing Summary</h4>
                
                {/* Original Services */}
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2">Original Services</h5>
                  {appointmentToComplete.services.map((service, index) => (
                    <div key={index} className="flex justify-between text-sm mb-1">
                      <span>{service.name}</span>
                      <span>₱{service.price}</span>
                    </div>
                  ))}
                  {appointmentToComplete.pets.some(pet => pet.grooming_details) && (
                    <div className="flex justify-between text-sm mb-1">
                      <span>Grooming Services</span>
                      <span>₱{appointmentToComplete.pets.reduce((total, pet) => total + calculatePetGroomingTotal(pet.grooming_details), 0)}</span>
                    </div>
                  )}
                </div>

                {/* Medical Tests */}
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2">Medical Tests</h5>
                  {medicalExam.petRecords.map((petRecord, index) => (
                    petRecord.selectedTests.length > 0 && (
                      <div key={index} className="mb-2">
                        <div className="text-sm font-medium text-gray-600 mb-1">{petRecord.petName}</div>
                        {petRecord.selectedTests.map((test, testIndex) => (
                          <div key={testIndex} className="flex justify-between text-sm ml-4 mb-1">
                            <span>{test.name}</span>
                            <span>₱{test.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Grand Total:</span>
                    <span className="text-teal-600">
                      ₱{(
                        appointmentToComplete.services.reduce((sum, service) => sum + parseFloat(service.price), 0) +
                        appointmentToComplete.pets.reduce((total, pet) => total + calculatePetGroomingTotal(pet.grooming_details), 0) +
                        medicalExam.totalCost
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelMedicalExamination}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={completeMedicalExamination}
                  disabled={updatingStatus === appointmentToComplete?.id}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                  {updatingStatus === appointmentToComplete?.id ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Complete Appointment'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pet Record Details Modal */}
      {showPetRecordModal && selectedPetRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Medical Record Details - {selectedPetRecord.pet_name}
              </h3>
              <button
                onClick={handleClosePetRecord}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Pet Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pet Name</p>
                    <p className="text-gray-900">{selectedPetRecord.pet_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Weight</p>
                    <p className="text-gray-900">{selectedPetRecord.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Date</p>
                    <p className="text-gray-900">{new Date(selectedPetRecord.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Doctor</p>
                    <p className="text-gray-900">Dr. {selectedPetRecord.doctor_name}</p>
                  </div>
                </div>
              </div>

              {/* Medical Details */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Medical Information</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Symptoms</p>
                    <p className="text-gray-900">{selectedPetRecord.symptoms || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Diagnosis</p>
                    <p className="text-gray-900">{selectedPetRecord.diagnosis || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Medication</p>
                    <p className="text-gray-900">{selectedPetRecord.medication || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Treatment</p>
                    <p className="text-gray-900">{selectedPetRecord.treatment || 'N/A'}</p>
                  </div>
                  {selectedPetRecord.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Notes</p>
                      <p className="text-gray-900">{selectedPetRecord.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Test Information */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Test Information</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Test Type</p>
                    <p className="text-gray-900">{selectedPetRecord.test_type || 'N/A'}</p>
                  </div>
                  {selectedPetRecord.selected_tests && selectedPetRecord.selected_tests.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Selected Tests</p>
                      <div className="space-y-2">
                        {selectedPetRecord.selected_tests.map((test: any, index: number) => (
                          <div key={index} className="bg-white rounded p-3 flex justify-between items-center">
                            <span className="text-gray-900">{test.name}</span>
                            <span className="text-green-600 font-medium">₱{test.price}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center font-semibold">
                          <span className="text-gray-800">Total Test Cost:</span>
                          <span className="text-green-600">₱{selectedPetRecord.test_cost || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex justify-end">
                <button
                  onClick={handleClosePetRecord}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;