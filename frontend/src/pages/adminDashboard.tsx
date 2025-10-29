import React, { useState, useEffect } from 'react';
import { apiUrl } from '../utils/apiConfig';
import Header from '../components/header';
import AdminNotifications from '../components/adminNotifications';
import { AdminNotificationProvider } from '../contexts/adminNotificationContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import petMedicsLogo from '../assets/home/pet_medics_logo.png';
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
  customBreed?: string;
  name?: string;
  grooming_details?: {
    [category: string]: Array<{
      service: string;
      size: string;
      price: number;
      package: string;
    }>;
  };
  dental_care_details?: {
    procedure: string;
    size: string;
    procedurePrice: number;
    anesthetic: string;
    anestheticPrice: number;
    totalPrice: number;
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
  phone_number?: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  products_count?: number;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category_id?: number;
  category?: Category;
  created_at: string;
  updated_at: string;
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

  // Helper function to check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };
  
  // Appointment completion inventory state
  const [selectedInventoryItems, setSelectedInventoryItems] = useState<Array<{
    product: Product;
    quantity: number;
  }>>([]);
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [inventoryFilterCategory, setInventoryFilterCategory] = useState<string>('');
  
  const [activeTab, setActiveTab] = useState<'appointments' | 'walkIn' | 'customers' | 'petRecords' | 'analytics' | 'inventory' | 'staff'>('appointments');
  const [petRecords, setPetRecords] = useState<any[]>([]);
  const [recordsSearchTerm, setRecordsSearchTerm] = useState('');
  const [selectedPetRecord, setSelectedPetRecord] = useState<any | null>(null);
  const [showPetRecordModal, setShowPetRecordModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [recentRecords, setRecentRecords] = useState<Appointment[]>([]);

  // Staff Management State
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    password: '',
    confirmPassword: ''
  });

  // Inventory Management State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventorySubTab, setInventorySubTab] = useState<'products' | 'categories'>('products');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'appointments' | 'income'>('appointments');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category_id: ''
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: ''
  });

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Simple notification function
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000); // Auto-hide after 5 seconds
  };

  // Walk-in appointment state
  const [walkInLoading, setWalkInLoading] = useState(false);
  const [walkInData, setWalkInData] = useState({
    customerName: '',
    customerEmail: '',
    selectedDate: undefined as Date | undefined,
    selectedTime: '',
    pets: [] as any[],
    services: [] as string[]
  });
  const [walkInPetCount, setWalkInPetCount] = useState(1);
  const [showWalkInGroomingModal, setShowWalkInGroomingModal] = useState(false);
  const [currentWalkInPetForGrooming, setCurrentWalkInPetForGrooming] = useState<number | null>(null);
  
  // Walk-in dental care state
  const [showWalkInDentalCareModal, setShowWalkInDentalCareModal] = useState(false);
  const [currentWalkInPetForDentalCare, setCurrentWalkInPetForDentalCare] = useState<number | null>(null);
  const [selectedWalkInDentalProcedure, setSelectedWalkInDentalProcedure] = useState<{procedure: string, size: string, price: number} | null>(null);

  // Reschedule appointment state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState<number | null>(null);
  const [newSelectedDate, setNewSelectedDate] = useState<Date | undefined>(undefined);
  const [newSelectedTime, setNewSelectedTime] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Customers tab state
  const [customers, setCustomers] = useState<any[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [expandedCustomer, setExpandedCustomer] = useState<number | null>(null);
  const [expandedPet, setExpandedPet] = useState<string | null>(null);
  
  // Customer search and filter state
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerFilterType, setCustomerFilterType] = useState<'all' | 'name' | 'email' | 'petName' | 'lastVisit'>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  // Grooming packages and services data
  const groomingPackages = {
    'Regular Grooming (No Bathing) - Not Matted Hair': {
      'X-Small': 450,
      'Small': 500,
      'Medium': 550,
      'Large': 700,
      'X-Large': 950
    },
    'Regular Grooming (No Bathing) - Matted Hair': {
      'X-Small': 500,
      'Small': 550,
      'Medium': 600,
      'Large': 800,
      'X-Large': 1100
    },
    'Complete Grooming (with Bath, Ear Cleaning, Nail Clip & Anal Sac Draining) - Not Matted Hair': {
      'X-Small': 500,
      'Small': 550,
      'Medium': 600,
      'Large': 750,
      'X-Large': 950
    },
    'Complete Grooming (with Bath, Ear Cleaning, Nail Clip & Anal Sac Draining) - Matted Hair': {
      'X-Small': 550,
      'Small': 600,
      'Medium': 650,
      'Large': 950,
      'X-Large': 1200
    },
    'Regular Bath': {
      'X-Small': 250,
      'Small': 300,
      'Medium': 350,
      'Large': 500,
      'X-Large': 600
    },
    'Sanitary Bath Package (No Haircut)': {
      'X-Small': 450,
      'Small': 550,
      'Medium': 650,
      'Large': 750,
      'X-Large': 950
    }
  };

  const individualServices = {
    'Sanitary Grooming (No Bath)': {
      'X-Small': 400,
      'Small': 450,
      'Medium': 500,
      'Large': 550,
      'X-Large': 650
    },
    'Facial Grooming': {
      'X-Small': 400,
      'Small': 450,
      'Medium': 500,
      'Large': 550,
      'X-Large': 650
    },
    'Underbelly Grooming (Pre-Natal)': {
      'X-Small': 50,
      'Small': 100,
      'Medium': 150,
      'Large': 200,
      'X-Large': 250
    },
    'Paw Grooming (Poodle Feet)': {
      'X-Small': 150,
      'Small': 200,
      'Medium': 300,
      'Large': 400,
      'X-Large': 400
    },
    'Underbelly and Bot': {
      'X-Small': 150,
      'Small': 200,
      'Medium': 300,
      'Large': 400,
      'X-Large': 400
    },
    'Nail Clip': {
      'Small': 100,
      'Medium': 150
    },
    'Ear Cleaning': {
      'Small': 200,
      'Medium': 300
    },
    'Anal Sac Draining': {
      'Small': 200,
      'Medium': 300
    },
    'Toothbrush (with personal toothbrush & toothpaste)': {
      'Any Size': 150
    }
  };

  // Dental care procedures and anesthetics data
  const dentalCareProcedures = {
    'Dental Fistula / Extraction': {
      '<5kg': 2000,
      '5.1-8.5kg': 2500,
      '8.6-17kg': 3000,
      '17.1-35kg': 4000,
      '35.1+': 6000
    },
    'Dental extraction of Deciduous + Local': {
      '<5kg': 1000,
      '5.1-8.5kg': 1500,
      '8.6-17kg': 2500,
      '17.1-35kg': 3000,
      '35.1+': 4000
    },
    'Dental Extraction of loosened tooth': {
      '<5kg': 0,
      '5.1-8.5kg': 0,
      '8.6-17kg': 0,
      '17.1-35kg': 0,
      '35.1+': 500
    }
  };

  const dentalCareAnesthetics = {
    'Local': {
      '<5kg': 500,
      '5.1-8.5kg': 600,
      '8.6-17kg': 700,
      '17.1-35kg': 800,
      '35.1+': 1000
    },
    'Sedative': {
      '<5kg': 700,
      '5.1-8.5kg': 850,
      '8.6-17kg': 1000,
      '17.1-35kg': 1200,
      '35.1+': 1500
    },
    'General': {
      '<5kg': 1800,
      '5.1-8.5kg': 2200,
      '8.6-17kg': 2600,
      '17.1-35kg': 2800,
      '35.1+': 3000
    }
  };

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

    // Initialize walk-in pets array with today's date and current time
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    setWalkInData(prev => ({
      ...prev,
      selectedDate: now,
      selectedTime: currentTime,
      pets: [{ id: 1, type: 'dog', breed: '', name: '' }]
    }));
  }, []);

  // Fetch customers when customers tab is accessed
  useEffect(() => {
    if (activeTab === 'customers') {
      fetchCustomers();
    }
  }, [activeTab]);

  // Fetch inventory data when inventory tab is accessed
  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchCategories();
      fetchProducts();
    }
  }, [activeTab, productSearchTerm, selectedCategory]);

  // Fetch staff data when staff tab is accessed
  useEffect(() => {
    if (activeTab === 'staff' && isAdmin()) {
      fetchStaffMembers();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl.adminDashboard(), {
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
      const response = await fetch(apiUrl.adminAppointments(), {
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

  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl.adminCustomers(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        setCustomers(data.customers);
      } else {
        console.error('Failed to fetch customers:', data.message);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setCustomersLoading(false);
    }
  };

  // Filter customers based on search criteria
  const getFilteredCustomers = () => {
    let filtered = customers;

    // Apply verification filter
    if (verificationFilter !== 'all') {
      filtered = filtered.filter(customer => {
        if (verificationFilter === 'verified') {
          return customer.email_verified_at !== null;
        } else {
          return customer.email_verified_at === null;
        }
      });
    }

    // Apply search filter
    if (customerSearchTerm.trim() !== '') {
      const searchTerm = customerSearchTerm.toLowerCase().trim();
      
      filtered = filtered.filter(customer => {
        switch (customerFilterType) {
          case 'name':
            return customer.name.toLowerCase().includes(searchTerm);
          
          case 'email':
            return customer.email.toLowerCase().includes(searchTerm);
          
          case 'petName':
            return customer.pets.some((pet: any) => 
              pet.name && pet.name.toLowerCase().includes(searchTerm)
            );
          
          case 'lastVisit':
            if (customer.last_appointment) {
              const lastVisitDate = new Date(customer.last_appointment).toLocaleDateString().toLowerCase();
              return lastVisitDate.includes(searchTerm);
            }
            return false;
          
          case 'all':
          default:
            // Search across all fields
            const nameMatch = customer.name.toLowerCase().includes(searchTerm);
            const emailMatch = customer.email.toLowerCase().includes(searchTerm);
            const petNameMatch = customer.pets.some((pet: any) => 
              pet.name && pet.name.toLowerCase().includes(searchTerm)
            );
            const lastVisitMatch = customer.last_appointment && 
              new Date(customer.last_appointment).toLocaleDateString().toLowerCase().includes(searchTerm);
            
            return nameMatch || emailMatch || petNameMatch || lastVisitMatch;
        }
      });
    }

    return filtered;
  };

  // Clear all filters
  const clearCustomerFilters = () => {
    setCustomerSearchTerm('');
    setCustomerFilterType('all');
    setVerificationFilter('all');
  };

  const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    // If completing appointment, show medical examination modal instead
    if (newStatus === 'completed') {
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (appointment) {
        setAppointmentToComplete(appointment);
        initializeMedicalExam(appointment);
        // Fetch products and categories for inventory selection
        await Promise.all([fetchProducts(), fetchCategories()]);
        setShowMedicalModal(true);
      }
      return;
    }

    setUpdatingStatus(appointmentId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl.appointmentStatus(appointmentId), {
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

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalkInLoading(true);

    try {
      // Validation
      if (!walkInData.customerName.trim()) {
        alert('Please enter customer name');
        return;
      }
      
      if (!walkInData.customerEmail.trim()) {
        alert('Please enter customer email');
        return;
      }
      
      if (!walkInData.selectedDate) {
        alert('Please select appointment date');
        return;
      }
      
      if (!walkInData.selectedTime) {
        alert('Please select appointment time');
        return;
      }
      
      if (walkInData.services.length === 0) {
        alert('Please select at least one service');
        return;
      }
      
      if (walkInData.pets.some(pet => !pet.name.trim() || !pet.breed || (pet.breed === 'Other' && !pet.customBreed?.trim()))) {
        alert('Please fill in all pet information including custom breed when "Other" is selected');
        return;
      }
      
      // Note: Grooming and dental care are optional per pet, no validation needed

      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        return;
      }

      // Format data for API
      const payload = {
        customer_name: walkInData.customerName,
        customer_email: walkInData.customerEmail,
        appointment_date: walkInData.selectedDate.toISOString().split('T')[0],
        appointment_time: walkInData.selectedTime,
        pets: walkInData.pets.map(pet => {
          let formattedGroomingDetails = null;
          
          // Transform grooming details to match backend expected structure
          if (pet.groomingDetails) {
            formattedGroomingDetails = {
              [pet.groomingDetails.category]: [{
                service: pet.groomingDetails.category,
                size: pet.groomingDetails.size,
                price: pet.groomingDetails.price,
                package: pet.groomingDetails.isPackage ? 'Package' : 'Individual'
              }]
            };
          }
          
          let formattedDentalCareDetails = null;
          
          // Transform dental care details to match backend expected structure
          if (pet.dentalCareDetails) {
            formattedDentalCareDetails = {
              procedure: pet.dentalCareDetails.procedure,
              size: pet.dentalCareDetails.size,
              procedurePrice: pet.dentalCareDetails.procedurePrice,
              anesthetic: pet.dentalCareDetails.anesthetic,
              anestheticPrice: pet.dentalCareDetails.anestheticPrice,
              totalPrice: pet.dentalCareDetails.totalPrice
            };
          }
          
          return {
            type: pet.type,
            breed: pet.breed === 'Other' && pet.customBreed ? pet.customBreed : pet.breed,
            name: pet.name,
            groomingDetails: formattedGroomingDetails,
            dentalCareDetails: formattedDentalCareDetails
          };
        }),
        services: walkInData.services,
        notes: `Walk-in appointment created by ${user?.name || 'staff'}`
      };

      const response = await fetch(apiUrl.adminWalkInAppointments(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.status) {
        // Reset form
        setWalkInData({
          customerName: '',
          customerEmail: '',
          selectedDate: undefined,
          selectedTime: '',
          pets: [{ id: 1, type: 'dog', breed: '', name: '' }],
          services: []
        });
        setWalkInPetCount(1);

        // Show success message with warning if present
        let message = 'Walk-in appointment created successfully!';
        if (data.warning) {
          message += '\n\n⚠️ ' + data.warning;
        }
        alert(message);
        
        // Refresh appointments and stats
        await fetchAppointments();
        await fetchDashboardData();
      } else {
        alert(data.message || 'Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating walk-in appointment:', error);
      alert('An error occurred while creating the appointment');
    } finally {
      setWalkInLoading(false);
    }
  };

  // Reschedule appointment functions
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
      alert('Please select both a date and time for the new appointment.');
      return;
    }

    setIsRescheduling(true);
    try {
      const token = localStorage.getItem('token');
      const time24h = convertTo24Hour(newSelectedTime);
      
      const response = await fetch(apiUrl.rescheduleAppointment(rescheduleAppointmentId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointment_date: newSelectedDate.toISOString().split('T')[0],
          appointment_time: time24h
        })
      });

      const data = await response.json();
      
      if (data.status) {
        // Update local state
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === rescheduleAppointmentId 
              ? { 
                  ...apt, 
                  appointment_date: newSelectedDate.toISOString().split('T')[0],
                  appointment_time: time24h
                }
              : apt
          )
        );
        
        closeRescheduleModal();
        alert('Appointment rescheduled successfully! 🎉');
        
        // Refresh appointments and stats
        await fetchAppointments();
        await fetchDashboardData();
      } else {
        alert(data.message || 'Failed to reschedule appointment. Please try again.');
      }
    } catch (err) {
      alert('Network error. Please try again.');
      console.error('Error rescheduling appointment:', err);
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleWalkInGroomingModalOpen = (petIndex: number) => {
    setCurrentWalkInPetForGrooming(petIndex);
    setShowWalkInGroomingModal(true);
  };

  const handleWalkInGroomingModalClose = () => {
    setShowWalkInGroomingModal(false);
    setCurrentWalkInPetForGrooming(null);
  };

  const updateWalkInPetGrooming = (petIndex: number, category: string, size: string, price: number, isPackage: boolean) => {
    const updatedPets = [...walkInData.pets];
    updatedPets[petIndex] = {
      ...updatedPets[petIndex],
      groomingDetails: { category, size, price, isPackage }
    };
    setWalkInData(prev => ({ ...prev, pets: updatedPets }));
  };

  const handleWalkInServiceToggle = (service: string) => {
    const currentServices = walkInData.services;
    
    if (service === 'Pet Grooming') {
      if (currentServices.includes(service)) {
        // Remove grooming service and clear all pet grooming details
        const updatedServices = currentServices.filter(s => s !== service);
        const updatedPets = walkInData.pets.map(pet => ({
          ...pet,
          groomingDetails: undefined
        }));
        setWalkInData(prev => ({ 
          ...prev, 
          services: updatedServices,
          pets: updatedPets
        }));
      } else {
        // Add grooming service
        const updatedServices = [...currentServices, service];
        setWalkInData(prev => ({ ...prev, services: updatedServices }));
      }
    } else if (service === 'Dental Care') {
      if (currentServices.includes(service)) {
        // Remove dental care service and clear all pet dental care details
        const updatedServices = currentServices.filter(s => s !== service);
        const updatedPets = walkInData.pets.map(pet => ({
          ...pet,
          dentalCareDetails: undefined
        }));
        setWalkInData(prev => ({ 
          ...prev, 
          services: updatedServices,
          pets: updatedPets
        }));
      } else {
        // Add dental care service
        const updatedServices = [...currentServices, service];
        setWalkInData(prev => ({ ...prev, services: updatedServices }));
      }
    } else {
      const updatedServices = currentServices.includes(service)
        ? currentServices.filter(s => s !== service)
        : [...currentServices, service];
      
      setWalkInData(prev => ({ ...prev, services: updatedServices }));
    }
  };

  // Walk-in dental care functions
  const handleWalkInDentalCareModalOpen = (petIndex: number) => {
    setCurrentWalkInPetForDentalCare(petIndex);
    setShowWalkInDentalCareModal(true);
    setSelectedWalkInDentalProcedure(null);
  };

  const handleWalkInDentalCareModalClose = () => {
    setShowWalkInDentalCareModal(false);
    setCurrentWalkInPetForDentalCare(null);
    setSelectedWalkInDentalProcedure(null);
  };

  const updateWalkInPetDentalCare = (petIndex: number, procedure: string, size: string, procedurePrice: number, anesthetic: string, anestheticPrice: number) => {
    const updatedPets = [...walkInData.pets];
    updatedPets[petIndex] = {
      ...updatedPets[petIndex],
      dentalCareDetails: { procedure, size, procedurePrice, anesthetic, anestheticPrice, totalPrice: procedurePrice + anestheticPrice }
    };
    setWalkInData(prev => ({ ...prev, pets: updatedPets }));
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
        const response = await fetch(apiUrl.medicalRecordsByAppointment(appointment.id), {
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

  // Handle customer appointment details (from customer tab)
  const handleCustomerAppointmentDetails = async (appointmentId: number) => {
    try {
      const token = localStorage.getItem('token');
      // Fetch full appointment details by ID
      const response = await fetch(`${apiUrl.adminAppointments()}/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.status && data.appointment) {
        // Use the full appointment data with the regular handleViewDetails function
        handleViewDetails(data.appointment);
      } else {
        console.error('Failed to fetch appointment details:', data.message);
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
    }
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
      const response = await fetch(apiUrl.deleteAppointment(appointmentId), {
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

  // Inventory item handling functions
  const addInventoryItem = (product: Product) => {
    const existingItem = selectedInventoryItems.find(item => item.product.id === product.id);
    if (existingItem) {
      // Check if we can increase quantity
      if (existingItem.quantity >= product.quantity) {
        alert(`Cannot add more ${product.name}. Only ${product.quantity} available in stock.`);
        return;
      }
      // Increase quantity if already exists
      setSelectedInventoryItems(prev => 
        prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // Add new item
      setSelectedInventoryItems(prev => [...prev, { product, quantity: 1 }]);
    }
  };

  const updateInventoryItemQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setSelectedInventoryItems(prev => prev.filter(item => item.product.id !== productId));
    } else {
      // Find the product to check stock
      const product = products.find(p => p.id === productId);
      if (product && quantity > product.quantity) {
        alert(`Cannot set quantity to ${quantity}. Only ${product.quantity} available in stock for ${product.name}.`);
        return;
      }
      
      setSelectedInventoryItems(prev => 
        prev.map(item => 
          item.product.id === productId 
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const removeInventoryItem = (productId: number) => {
    setSelectedInventoryItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const getFilteredInventoryProducts = () => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
                           product.id.toString().includes(inventorySearchTerm);
      const matchesCategory = !inventoryFilterCategory || 
                             (product.category_id ? product.category_id.toString() === inventoryFilterCategory : false);
      const hasStock = product.quantity > 0;
      return matchesSearch && matchesCategory && hasStock;
    });
  };

  const calculateInventoryItemsTotal = () => {
    return selectedInventoryItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
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

    // Validate inventory items quantities don't exceed stock
    for (const item of selectedInventoryItems) {
      if (item.quantity > item.product.quantity) {
        alert(`Quantity for ${item.product.name} (${item.quantity}) exceeds available stock (${item.product.quantity})`);
        return;
      }
    }

    try {
      setUpdatingStatus(appointmentToComplete.id);

      const token = localStorage.getItem('token');
      
      // Prepare completion data
      const completionData = {
        appointment_id: appointmentToComplete.id,
        inventory_items: selectedInventoryItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        }))
      };

      // Add medical data if it exists
      if (hasMedicalData) {
        Object.assign(completionData, {
          doctor_name: medicalExam.doctorName,
          pet_records: medicalExam.petRecords,
          total_cost: medicalExam.totalCost,
        });
      }

      // Call the backend to complete appointment (will save medical records and update inventory)
      const response = await fetch(apiUrl.completeAppointment(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(completionData)
      });

      if (response.ok) {
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
        setSelectedInventoryItems([]);
        setInventorySearchTerm('');
        setInventoryFilterCategory('');
        fetchDashboardData();
        fetchPetRecords();
        if (activeTab === 'inventory') {
          fetchProducts(); // Refresh inventory to show updated quantities
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to complete appointment');
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert('An error occurred while completing the appointment');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const cancelMedicalExamination = () => {
    setShowMedicalModal(false);
    setMedicalExam(null);
    setAppointmentToComplete(null);
    setSelectedInventoryItems([]);
    setInventorySearchTerm('');
    setInventoryFilterCategory('');
  };

  const fetchPetRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl.medicalRecords(), {
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
      const response = await fetch(apiUrl.adminAnalytics(), {
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
          monthlyIncome: {},
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
        monthlyIncome: {},
        todayEarnings: 0,
        monthlyEarnings: 0,
        avgMonthlyAppointments: 0
      });
    }
  };

  const fetchRecentRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl.adminRecentAppointments(), {
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

  // Inventory Management Functions
  const fetchProducts = async () => {
    setInventoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (productSearchTerm) {
        queryParams.append('search', productSearchTerm);
      }
      if (selectedCategory) {
        queryParams.append('category_id', selectedCategory);
      }
      
      const url = `${apiUrl.products()}?${queryParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        setProducts(data.products);
      } else {
        console.error('Failed to fetch products:', data.message);
        showNotification('Failed to fetch products', 'error');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showNotification('Error fetching products', 'error');
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl.categories(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        setCategories(data.categories);
      } else {
        console.error('Failed to fetch categories:', data.message);
        showNotification('Failed to fetch categories', 'error');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showNotification('Error fetching categories', 'error');
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInventoryLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = editingProduct ? apiUrl.product(editingProduct.id) : apiUrl.products();
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...productFormData,
          price: parseFloat(productFormData.price),
          quantity: parseInt(productFormData.quantity),
          category_id: productFormData.category_id || null
        }),
      });

      const data = await response.json();
      if (data.status) {
        showNotification(
          editingProduct ? 'Product updated successfully' : 'Product created successfully',
          'success'
        );
        setShowProductModal(false);
        setEditingProduct(null);
        setProductFormData({ name: '', description: '', price: '', quantity: '', category_id: '' });
        fetchProducts();
      } else {
        showNotification(data.message || 'Failed to save product', 'error');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showNotification('Error saving product', 'error');
    } finally {
      setInventoryLoading(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInventoryLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = editingCategory ? apiUrl.category(editingCategory.id) : apiUrl.categories();
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(categoryFormData),
      });

      const data = await response.json();
      if (data.status) {
        showNotification(
          editingCategory ? 'Category updated successfully' : 'Category created successfully',
          'success'
        );
        setShowCategoryModal(false);
        setEditingCategory(null);
        setCategoryFormData({ name: '', description: '' });
        fetchCategories();
        fetchProducts(); // Refresh products to update category relationships
      } else {
        showNotification(data.message || 'Failed to save category', 'error');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      showNotification('Error saving category', 'error');
    } finally {
      setInventoryLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: number, action: 'increment' | 'decrement') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl.productQuantity(productId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ action, amount: 1 }),
      });

      const data = await response.json();
      if (data.status) {
        fetchProducts(); // Refresh products list
      } else {
        showNotification(data.message || 'Failed to update quantity', 'error');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      showNotification('Error updating quantity', 'error');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl.product(productId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        showNotification('Product deleted successfully', 'success');
        fetchProducts();
      } else {
        showNotification(data.message || 'Failed to delete product', 'error');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('Error deleting product', 'error');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl.category(categoryId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        showNotification('Category deleted successfully', 'success');
        fetchCategories();
        fetchProducts(); // Refresh products to update category relationships
      } else {
        showNotification(data.message || 'Failed to delete category', 'error');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showNotification('Error deleting category', 'error');
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

  // Helper function to calculate dental care total for a pet
  const calculatePetDentalCareTotal = (dentalCareDetails: any) => {
    if (!dentalCareDetails) return 0;
    
    const dentalDetails = typeof dentalCareDetails === 'string' ? 
      JSON.parse(dentalCareDetails) : dentalCareDetails;
    
    return dentalDetails.totalPrice || 0;
  };

  // PDF Generation Function
  // Helper function to format peso amounts
  const formatPeso = (amount: number | string): string => {
    // Convert to number and ensure it's positive
    let numAmount = Number(amount);
    if (isNaN(numAmount)) numAmount = 0;
    
    // Remove any signs and format as peso
    const cleanAmount = Math.abs(numAmount);
    const formattedAmount = cleanAmount.toFixed(2);
    
    // Use 'P' instead of peso symbol to avoid encoding issues
    return `P${formattedAmount}`;
  };

  const generateAppointmentPDF = async (appointment: any) => {
    const doc = new jsPDF();
    let yPosition = 20;

    // Fetch medical records for this appointment
    let medicalRecords: any[] = [];
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl.medicalRecordsByAppointment(appointment.id), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      const data = await response.json();
      if (data.status && data.records) {
        medicalRecords = data.records.filter((record: any) => record.appointment_id === appointment.id);
      }
    } catch (error) {
      console.warn('Could not fetch medical records for PDF:', error);
    }

    // Header with teal colors
    doc.setFillColor(20, 184, 166); // Teal-500
    doc.rect(0, 0, 210, 40, 'F'); // Header background
    
    // Add logo if available with proper aspect ratio
    try {
      // Create image element to get actual dimensions
      const img = new Image();
      img.src = petMedicsLogo;
      
      // Wait for image to load to get dimensions
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        // If already loaded (cached), resolve immediately
        if (img.complete) resolve(img);
      });
      
      const logoHeight = 18; // desired height in mm
      const aspectRatio = img.width / img.height;
      const logoWidth = logoHeight * aspectRatio;

      doc.addImage(img, 'PNG', 15, 11, logoWidth, logoHeight);
    } catch (error) {
      console.warn('Could not add logo to PDF:', error);
      // Fallback: white rounded rectangle for logo space
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(15, 11, 35, 18, 3, 3, 'F');
    }
    
    // Subtitle under the logo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255); // White text
    doc.text('Professional Pet Care Services', 15, 33);
    
    // Reset text color to black for rest of document
    doc.setTextColor(0, 0, 0);
    yPosition = 55;

    // Document title with teal accent
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 184, 166); // Teal-500
    doc.text('APPOINTMENT SUMMARY REPORT', 105, yPosition, { align: 'center' });
    doc.setTextColor(0, 0, 0); // Reset to black
    yPosition += 15;

    // Appointment Details Box with teal border
    doc.setDrawColor(20, 184, 166); // Teal border
    doc.setLineWidth(0.5);
    doc.rect(15, yPosition - 5, 180, 30); // Increased height from 25 to 30
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 184, 166);
    doc.text('APPOINTMENT DETAILS', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Appointment ID: #${appointment.id}`, 20, yPosition);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 120, yPosition);
    yPosition += 6;
    doc.text(`Appointment Date: ${new Date(appointment.appointment_date).toLocaleDateString()}`, 20, yPosition);
    doc.text(`Time: ${appointment.appointment_time}`, 120, yPosition);
    yPosition += 6;
    doc.text(`Status: ${appointment.status.toUpperCase()}`, 20, yPosition);
    yPosition += 15;

    // Customer Information with teal header
    doc.setFillColor(240, 253, 250); // Very light teal background
    doc.rect(15, yPosition - 5, 180, 20, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 184, 166);
    doc.text('CUSTOMER INFORMATION', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${appointment.user?.name || 'N/A'}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Email: ${appointment.user?.email || 'N/A'}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Phone: ${appointment.user?.phone || 'Not provided'}`, 20, yPosition);
    yPosition += 15;

    // Pet Information with teal header
    doc.setFillColor(240, 253, 250);
    doc.rect(15, yPosition - 5, 180, 8 + (appointment.pets.length * 8), 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 184, 166);
    doc.text('PET INFORMATION', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8;

    appointment.pets.forEach((pet: any, index: number) => {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Pet #${index + 1}: ${pet.name || 'Unnamed'}`, 20, yPosition);
      yPosition += 6;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Type: ${pet.type} | Breed: ${pet.breed}`, 25, yPosition);
      yPosition += 8;
    });
    yPosition += 5;

    // Services with teal header
    doc.setFillColor(240, 253, 250);
    doc.rect(15, yPosition - 5, 180, 8 + (appointment.services.length * 5), 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 184, 166);
    doc.text('SERVICES PROVIDED', 20, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    appointment.services.forEach((service: any) => {
      doc.text(`• ${service.name}`, 25, yPosition);
      yPosition += 5;
    });
    yPosition += 10;

    // Medical Records (if available) - Enhanced section
    if (appointment.status === 'completed' && medicalRecords && medicalRecords.length > 0) {
      // Check if we need a new page
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFillColor(240, 253, 250);
      doc.rect(15, yPosition - 5, 180, 25, 'F');
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 184, 166);
      doc.text('MEDICAL EXAMINATION RESULTS', 20, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 8;

      medicalRecords.forEach((record: any, index: number) => {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(20, 184, 166);
        doc.text(`Examination #${index + 1}`, 20, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`Pet: ${record.pet_name || 'Unknown Pet'}`, 25, yPosition);
        yPosition += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        if (record.doctor_name) {
          doc.text(`Doctor: ${record.doctor_name}`, 25, yPosition);
          yPosition += 5;
        }
        
        if (record.examination_date) {
          doc.text(`Examination Date: ${new Date(record.examination_date).toLocaleDateString()}`, 25, yPosition);
          yPosition += 5;
        }
        
        if (record.weight) {
          doc.text(`Weight: ${record.weight}`, 25, yPosition);
          yPosition += 5;
        }
        
        if (record.temperature) {
          doc.text(`Temperature: ${record.temperature}`, 25, yPosition);
          yPosition += 5;
        }
        
        if (record.symptoms) {
          doc.text(`Symptoms:`, 25, yPosition);
          yPosition += 5;
          const symptomsLines = doc.splitTextToSize(record.symptoms, 160);
          doc.text(symptomsLines, 35, yPosition);
          yPosition += symptomsLines.length * 5;
        }
        
        if (record.diagnosis) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(20, 184, 166);
          doc.text(`Diagnosis:`, 25, yPosition);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          yPosition += 5;
          const diagnosisLines = doc.splitTextToSize(record.diagnosis, 160);
          doc.text(diagnosisLines, 35, yPosition);
          yPosition += diagnosisLines.length * 5;
        }
        
        if (record.test_type) {
          doc.text(`Test Type: ${record.test_type}`, 25, yPosition);
          yPosition += 5;
        }
        
        if (record.test_result) {
          doc.text(`Test Result:`, 25, yPosition);
          yPosition += 5;
          const testResultLines = doc.splitTextToSize(record.test_result, 160);
          doc.text(testResultLines, 35, yPosition);
          yPosition += testResultLines.length * 5;
        }
        
        if (record.test_cost && parseFloat(record.test_cost) > 0) {
          doc.setTextColor(20, 184, 166);
          doc.text(`Test Cost: ${formatPeso(record.test_cost)}`, 25, yPosition);
          doc.setTextColor(0, 0, 0);
          yPosition += 5;
        }
        
        if (record.medication) {
          doc.text(`Medication:`, 25, yPosition);
          yPosition += 5;
          const medicationLines = doc.splitTextToSize(record.medication, 160);
          doc.text(medicationLines, 35, yPosition);
          yPosition += medicationLines.length * 5;
        }
        
        if (record.treatment) {
          doc.text(`Treatment:`, 25, yPosition);
          yPosition += 5;
          const treatmentLines = doc.splitTextToSize(record.treatment, 160);
          doc.text(treatmentLines, 35, yPosition);
          yPosition += treatmentLines.length * 5;
        }
        
        if (record.notes) {
          doc.text(`Notes:`, 25, yPosition);
          yPosition += 5;
          const notesLines = doc.splitTextToSize(record.notes, 160);
          doc.text(notesLines, 35, yPosition);
          yPosition += notesLines.length * 5;
        }
        
        if (record.follow_up_date) {
          doc.text(`Follow-up Date: ${new Date(record.follow_up_date).toLocaleDateString()}`, 25, yPosition);
          yPosition += 5;
        }
        
        yPosition += 8; // Space between records

        // Check if we need a new page
        if (yPosition > 250 && index < medicalRecords.length - 1) {
          doc.addPage();
          yPosition = 20;
        }
      });
    } else if (appointment.status === 'completed') {
      // Show message when no medical records are available
      doc.setFillColor(245, 245, 245);
      doc.rect(15, yPosition - 5, 180, 15, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('No medical examination records available for this appointment.', 20, yPosition + 5);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      yPosition += 20;
    }

    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Grooming Services Detail
    const groomingPets = appointment.pets.filter((pet: any) => pet.grooming_details && Object.keys(pet.grooming_details).length > 0);
    if (groomingPets.length > 0) {
      doc.setFillColor(240, 253, 250);
      doc.rect(15, yPosition - 5, 180, 20, 'F');
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 184, 166);
      doc.text('GROOMING SERVICES DETAIL', 20, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 8;

      groomingPets.forEach((pet: any) => {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${pet.name} (${pet.type})`, 20, yPosition);
        yPosition += 6;

        const groomingDetails = parseGroomingDetails(pet.grooming_details);
        const hasOldStructure = groomingDetails.category && groomingDetails.size && groomingDetails.price !== undefined;

        if (hasOldStructure) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(`Service: ${groomingDetails.category}`, 25, yPosition);
          yPosition += 5;
          doc.text(`Size: ${groomingDetails.size}`, 25, yPosition);
          yPosition += 5;
          doc.setTextColor(20, 184, 166);
          doc.text(`Price: ₱${groomingDetails.price}`, 25, yPosition);
          doc.setTextColor(0, 0, 0);
          yPosition += 5;
          if (groomingDetails.isPackage) {
            doc.text('Type: Package', 25, yPosition);
            yPosition += 5;
          }
        } else if (groomingDetails && Object.keys(groomingDetails).length > 0) {
          Object.entries(groomingDetails).forEach(([category, services]: [string, any]) => {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`Category: ${category}`, 25, yPosition);
            yPosition += 5;
            
            if (Array.isArray(services)) {
              services.forEach((service: any) => {
                doc.setFont('helvetica', 'normal');
                doc.text(`- ${service.service || service.name || 'Unknown Service'} (${service.size || 'N/A'})`, 30, yPosition);
                doc.setTextColor(20, 184, 166);
                doc.text(`₱${service.price || 0}`, 160, yPosition);
                doc.setTextColor(0, 0, 0);
                yPosition += 5;
              });
            }
          });
        }
        yPosition += 5;
      });
    }

    // Dental Care Services Detail
    const dentalPets = appointment.pets.filter((pet: any) => pet.dental_care_details);
    if (dentalPets.length > 0) {
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFillColor(240, 253, 250);
      doc.rect(15, yPosition - 5, 180, 20, 'F');
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 184, 166);
      doc.text('DENTAL CARE SERVICES DETAIL', 20, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 8;

      dentalPets.forEach((pet: any) => {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${pet.name} (${pet.type})`, 20, yPosition);
        yPosition += 6;

        const dentalDetails = typeof pet.dental_care_details === 'string' ? 
          JSON.parse(pet.dental_care_details) : pet.dental_care_details;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Procedure: ${dentalDetails.procedure}`, 25, yPosition);
        yPosition += 5;
        doc.text(`Pet Size: ${dentalDetails.size}`, 25, yPosition);
        yPosition += 5;
        doc.setTextColor(20, 184, 166);
        doc.text(`Procedure Price: ₱${dentalDetails.procedurePrice}`, 25, yPosition);
        yPosition += 5;
        doc.setTextColor(0, 0, 0);
        doc.text(`Anesthetic: ${dentalDetails.anesthetic}`, 25, yPosition);
        yPosition += 5;
        doc.setTextColor(20, 184, 166);
        doc.text(`Anesthetic Price: ₱${dentalDetails.anestheticPrice}`, 25, yPosition);
        yPosition += 5;
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: ₱${dentalDetails.totalPrice}`, 25, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        yPosition += 8;
      });
    }

    // Products Used (if any)
    if (appointment.status === 'completed' && (appointment as any).inventory_usage && (appointment as any).inventory_usage.length > 0) {
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFillColor(240, 253, 250);
      doc.rect(15, yPosition - 5, 180, 15, 'F');
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 184, 166);
      doc.text('PRODUCTS USED', 20, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 10;

      // Create table for products with teal theme
      const productData = (appointment as any).inventory_usage.map((usage: any) => [
        usage.product_name,
        usage.quantity_used.toString(),
        `₱${usage.unit_price}`,
        `₱${usage.total_price}`
      ]);

      autoTable(doc, {
        head: [['Product Name', 'Quantity', 'Unit Price', 'Total Price']],
        body: productData,
        startY: yPosition,
        styles: { fontSize: 10 },
        headStyles: { 
          fillColor: [20, 184, 166], // Teal header
          textColor: [255, 255, 255] // White text
        },
        alternateRowStyles: { fillColor: [240, 253, 250] }, // Light teal alternate rows
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Financial Summary with teal theme
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(20, 184, 166); // Teal background
    doc.rect(15, yPosition - 5, 180, 15, 'F'); // Reduced height from 25 to 15
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255); // White text on teal
    doc.text('BILLING SUMMARY', 20, yPosition + 3); // Adjusted position
    doc.setTextColor(0, 0, 0);
    yPosition += 15; // Reduced spacing from 20 to 15

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Base services cost
    const baseServicesTotal = appointment.services
      .filter((service: any) => service.name !== 'Pet Grooming' && service.name !== 'Dental Care')
      .reduce((sum: number, service: any) => sum + (parseFloat(service.price) || 0), 0);
    
    doc.text(`Base Services:`, 20, yPosition);
    doc.setTextColor(20, 184, 166);
    doc.text(formatPeso(baseServicesTotal), 160, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 6;

    // Grooming total
    const groomingTotal = appointment.pets.reduce((total: number, pet: any) => {
      return total + calculatePetGroomingTotal(pet.grooming_details);
    }, 0);
    
    if (groomingTotal > 0) {
      doc.text(`Grooming Services:`, 20, yPosition);
      doc.setTextColor(20, 184, 166);
      doc.text(formatPeso(groomingTotal), 160, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 6;
    }

    // Dental care total
    const dentalTotal = appointment.pets.reduce((total: number, pet: any) => {
      return total + calculatePetDentalCareTotal(pet.dental_care_details);
    }, 0);
    
    if (dentalTotal > 0) {
      doc.text(`Dental Care Services:`, 20, yPosition);
      doc.setTextColor(20, 184, 166);
      doc.text(formatPeso(dentalTotal), 160, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 6;
    }

    // Medical tests total
    let medicalTestsTotal = 0;
    if (appointment.status === 'completed' && medicalRecords && medicalRecords.length > 0) {
      medicalTestsTotal = medicalRecords.reduce((total: number, record: any) => {
        return total + (parseFloat(record.test_cost) || 0);
      }, 0);
      
      if (medicalTestsTotal > 0) {
        doc.text(`Medical Tests:`, 20, yPosition);
        doc.setTextColor(20, 184, 166);
        doc.text(formatPeso(medicalTestsTotal), 160, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 6;
      }
    }

    // Products total
    let productsTotal = 0;
    if (appointment.status === 'completed' && (appointment as any).inventory_usage) {
      productsTotal = (appointment as any).inventory_usage.reduce((total: number, usage: any) => {
        return total + (parseFloat(usage.total_price) || 0);
      }, 0);
      
      if (productsTotal > 0) {
        doc.text(`Products Used:`, 20, yPosition);
        doc.setTextColor(20, 184, 166);
        doc.text(formatPeso(productsTotal), 160, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 6;
      }
    }

    // Grand total with teal highlight
    const grandTotal = baseServicesTotal + groomingTotal + dentalTotal + medicalTestsTotal + productsTotal;
    
    yPosition += 5;
    doc.setFillColor(20, 184, 166);
    doc.rect(15, yPosition - 3, 180, 12, 'F');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`GRAND TOTAL:`, 20, yPosition + 5);
    doc.text(formatPeso(grandTotal), 160, yPosition + 5);

    // Footer with teal accent
    yPosition = 280;
    doc.setFillColor(20, 184, 166);
    doc.rect(0, yPosition - 5, 210, 20, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text('This is a computer-generated document. Thank you for choosing PetMedics Veterinary Clinic.', 105, yPosition + 3, { align: 'center' });
    doc.text('Email: petmedicsvetclinic21@gmail.com | Phone: +63 968 388 2727', 105, yPosition + 10, { align: 'center' });

    // Save the PDF
    const filename = `PetMedics_Appointment_${appointment.id}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  // Staff Management Functions
  const fetchStaffMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl.staff(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        setStaffMembers(data.staff || []);
      } else {
        showNotification('Failed to fetch staff members', 'error');
      }
    } catch (error) {
      console.error('Error fetching staff members:', error);
      showNotification('Error fetching staff members', 'error');
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (staffFormData.password !== staffFormData.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingStaff ? apiUrl.staffMember(editingStaff.id) : apiUrl.staff();
      const method = editingStaff ? 'PUT' : 'POST';
      
      const payload = {
        name: staffFormData.name,
        email: staffFormData.email,
        phone: staffFormData.phone,
        role: staffFormData.role,
        ...(staffFormData.password && { password: staffFormData.password })
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.status) {
        showNotification(
          editingStaff ? 'Staff member updated successfully' : 'Staff member created successfully', 
          'success'
        );
        fetchStaffMembers();
        setShowStaffModal(false);
        setEditingStaff(null);
        setStaffFormData({
          name: '',
          email: '',
          phone: '',
          role: 'staff',
          password: '',
          confirmPassword: ''
        });
      } else {
        showNotification(data.message || 'Failed to save staff member', 'error');
      }
    } catch (error) {
      console.error('Error saving staff member:', error);
      showNotification('Error saving staff member', 'error');
    }
  };

  const handleEditStaff = (staff: any) => {
    setEditingStaff(staff);
    setStaffFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone || '',
      role: staff.role,
      password: '',
      confirmPassword: ''
    });
    setShowStaffModal(true);
  };

  const handleDeleteStaff = async (staffId: number) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(apiUrl.staffMember(staffId), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        const data = await response.json();
        if (data.status) {
          showNotification('Staff member deleted successfully', 'success');
          fetchStaffMembers();
        } else {
          showNotification(data.message || 'Failed to delete staff member', 'error');
        }
      } catch (error) {
        console.error('Error deleting staff member:', error);
        showNotification('Error deleting staff member', 'error');
      }
    }
  };

  const filteredStaffMembers = staffMembers.filter(staff =>
    staff.name.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(staffSearchTerm.toLowerCase())
  );

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
      
      {/* Success/Error Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 max-w-sm w-full p-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <FaCheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <FaExclamationTriangle className="w-5 h-5 mr-2" />
              )}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-3 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user?.role === 'admin' ? 'Admin' : 'Staff'} Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, {user?.name}! Here's what's happening at PetCare.
                </p>
              </div>
              
              {/* Live Notifications */}
              <div className="flex items-center">
                <AdminNotifications />
              </div>
            </div>
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
                  onClick={() => setActiveTab('walkIn')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'walkIn'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Walk-In
                </button>
                <button
                  onClick={() => setActiveTab('customers')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'customers'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Customers
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
                {/* Analytics tab - only visible to admin */}
                {isAdmin() && (
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
                )}
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'inventory'
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Inventory
                </button>
                {/* Staff Management tab - only visible to admin */}
                {isAdmin() && (
                  <button
                    onClick={() => setActiveTab('staff')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'staff'
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Staff Management
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* Stats Cards - Only show on appointments tab */}
          {stats && activeTab === 'appointments' && (
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
                          {appointment.pets.some(pet => pet.dental_care_details && Object.keys(pet.dental_care_details).length > 0) && (
                            <div className="text-xs text-blue-600">
                              <strong>Dental Care:</strong> {appointment.pets.filter(pet => pet.dental_care_details).length} pet(s) with dental services
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
                          {appointment.status === 'completed' && (
                            <button
                              onClick={() => generateAppointmentPDF(appointment)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                              title="Download PDF Report"
                            >
                              📄 PDF
                            </button>
                          )}
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

          {/* Walk-In Appointments */}
          {activeTab === 'walkIn' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Walk-In Appointment Registration
                </h2>
                <p className="text-gray-600 mt-1">Register walk-in customers and book appointments on their behalf</p>
              </div>

              <div className="p-6">
                <form onSubmit={handleWalkInSubmit} className="space-y-8">
                  {/* Customer Information */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Customer Name *
                        </label>
                        <input
                          type="text"
                          value={walkInData.customerName}
                          onChange={(e) => setWalkInData(prev => ({...prev, customerName: e.target.value}))}
                          placeholder="Enter customer's full name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={walkInData.customerEmail}
                          onChange={(e) => setWalkInData(prev => ({...prev, customerEmail: e.target.value}))}
                          placeholder="customer@email.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Appointment Scheduling */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h3>
                    
                    {/* Date and Time Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Appointment Date *
                        </label>
                        <input
                          type="date"
                          value={walkInData.selectedDate ? walkInData.selectedDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : undefined;
                            setWalkInData(prev => ({...prev, selectedDate: date}));
                          }}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Appointment Time *
                        </label>
                        <input
                          type="time"
                          value={(() => {
                            // Convert 12-hour format back to 24-hour for input display
                            if (!walkInData.selectedTime) return '';
                            const time12 = walkInData.selectedTime;
                            if (time12.includes('AM') || time12.includes('PM')) {
                              const [time, period] = time12.split(' ');
                              const [hours, minutes] = time.split(':');
                              let hour24 = parseInt(hours);
                              if (period === 'PM' && hour24 !== 12) hour24 += 12;
                              if (period === 'AM' && hour24 === 12) hour24 = 0;
                              return `${hour24.toString().padStart(2, '0')}:${minutes}`;
                            }
                            return time12; // Return as-is if already in 24-hour format
                          })()}
                          onChange={(e) => {
                            // Store time in 12-hour format for consistency
                            const time24 = e.target.value;
                            if (time24) {
                              const [hours, minutes] = time24.split(':');
                              const hour = parseInt(hours);
                              const ampm = hour >= 12 ? 'PM' : 'AM';
                              const hour12 = hour % 12 || 12;
                              const time12 = `${hour12}:${minutes} ${ampm}`;
                              setWalkInData(prev => ({...prev, selectedTime: time12}));
                            } else {
                              setWalkInData(prev => ({...prev, selectedTime: ''}));
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter the exact time when the walk-in appointment occurred
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Services Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Services</h3>
                    <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700">
                        <strong>Note:</strong> After selecting services below, you can choose which specific pets receive each service. 
                        Not all pets need to have every selected service.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {['Pet Grooming', 'Health Checkups', 'Vaccination', 'Dental Care'].map((service) => (
                        <label
                          key={service}
                          className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={walkInData.services.includes(service)}
                            onChange={() => handleWalkInServiceToggle(service)}
                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-gray-700 font-medium">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Pet Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Pet Information</h3>
                    
                    {/* Number of Pets */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Pets
                      </label>
                      <select
                        value={walkInPetCount}
                        onChange={(e) => {
                          const count = Number(e.target.value);
                          setWalkInPetCount(count);
                          const newPets: any[] = [];
                          for (let i = 0; i < count; i++) {
                            if (walkInData.pets[i]) {
                              newPets.push(walkInData.pets[i]);
                            } else {
                              newPets.push({ id: i + 1, type: 'dog', breed: '', name: '' });
                            }
                          }
                          setWalkInData(prev => ({ ...prev, pets: newPets }));
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      >
                        {[1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>

                    {/* Pet Details Forms */}
                    <div className="space-y-4">
                      {walkInData.pets.map((pet, index) => (
                        <div key={pet.id} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-800 mb-3">Pet #{index + 1}</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Pet Name */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pet Name *
                              </label>
                              <input
                                type="text"
                                value={pet.name}
                                onChange={(e) => {
                                  const updatedPets = [...walkInData.pets];
                                  updatedPets[index] = { ...updatedPets[index], name: e.target.value };
                                  setWalkInData(prev => ({ ...prev, pets: updatedPets }));
                                }}
                                placeholder="Enter pet's name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                required
                              />
                            </div>

                            {/* Pet Type */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pet Type
                              </label>
                              <select
                                value={pet.type}
                                onChange={(e) => {
                                  const updatedPets = [...walkInData.pets];
                                  updatedPets[index] = { ...updatedPets[index], type: e.target.value, breed: '' };
                                  setWalkInData(prev => ({ ...prev, pets: updatedPets }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              >
                                <option value="dog">Dog</option>
                                <option value="cat">Cat</option>
                              </select>
                            </div>

                            {/* Breed */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Breed *
                              </label>
                              <select
                                value={pet.breed}
                                onChange={(e) => {
                                  const updatedPets = [...walkInData.pets];
                                  updatedPets[index] = { ...updatedPets[index], breed: e.target.value };
                                  setWalkInData(prev => ({ ...prev, pets: updatedPets }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                required
                              >
                                <option value="">Select a breed</option>
                                {(pet.type === 'dog' 
                                  ? ['Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Bulldog',
                                     'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund',
                                     'Siberian Husky', 'Boxer', 'Border Collie', 'Mixed Breed', 'Other']
                                  : ['Persian', 'Maine Coon', 'British Shorthair', 'Ragdoll', 'Bengal',
                                     'Siamese', 'Abyssinian', 'Russian Blue', 'Scottish Fold', 'Sphynx',
                                     'American Shorthair', 'Domestic Shorthair', 'Mixed Breed', 'Other']
                                ).map(breed => (
                                  <option key={breed} value={breed}>{breed}</option>
                                ))}
                              </select>
                              
                              {/* Custom breed input when "Other" is selected */}
                              {pet.breed === 'Other' && (
                                <div className="mt-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Specify Breed
                                  </label>
                                  <input
                                    type="text"
                                    value={pet.customBreed || ''}
                                    onChange={(e) => {
                                      const updatedPets = [...walkInData.pets];
                                      updatedPets[index] = { ...updatedPets[index], customBreed: e.target.value };
                                      setWalkInData(prev => ({ ...prev, pets: updatedPets }));
                                    }}
                                    placeholder="Enter the specific breed"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    required
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Grooming Details - Show when Pet Grooming is selected */}
                          {walkInData.services.includes('Pet Grooming') && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="text-sm font-semibold text-gray-700">
                                  Pet Grooming Details for {pet.name || `Pet #${index + 1}`}
                                  <span className="text-xs text-gray-500 font-normal ml-2">(Optional)</span>
                                </h5>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleWalkInGroomingModalOpen(index)}
                                    className="text-sm bg-teal-100 text-teal-700 px-3 py-1 rounded-full hover:bg-teal-200 transition-colors"
                                  >
                                    {pet.groomingDetails ? 'Edit Package' : 'Select Package'}
                                  </button>
                                  {pet.groomingDetails && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedPets = [...walkInData.pets];
                                        updatedPets[index] = { ...updatedPets[index], groomingDetails: undefined };
                                        setWalkInData(prev => ({ ...prev, pets: updatedPets }));
                                      }}
                                      className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              {pet.groomingDetails ? (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                    <div>
                                      <span className="font-medium text-gray-600">Package:</span>
                                      <p className="text-gray-800">{pet.groomingDetails.category}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-600">Size:</span>
                                      <p className="text-gray-800">{pet.groomingDetails.size}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-600">Price:</span>
                                      <p className="text-gray-800 font-semibold">₱{pet.groomingDetails.price}</p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                  <p className="text-sm text-gray-500">No grooming service selected for this pet</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Dental Care Details - Show when Dental Care is selected */}
                          {walkInData.services.includes('Dental Care') && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="text-sm font-semibold text-gray-700">
                                  Dental Care Details for {pet.name || `Pet #${index + 1}`}
                                  <span className="text-xs text-gray-500 font-normal ml-2">(Optional)</span>
                                </h5>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleWalkInDentalCareModalOpen(index)}
                                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                                  >
                                    {pet.dentalCareDetails ? 'Edit Procedure' : 'Select Procedure'}
                                  </button>
                                  {pet.dentalCareDetails && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedPets = [...walkInData.pets];
                                        updatedPets[index] = { ...updatedPets[index], dentalCareDetails: undefined };
                                        setWalkInData(prev => ({ ...prev, pets: updatedPets }));
                                      }}
                                      className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              {pet.dentalCareDetails ? (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                                    <div>
                                      <span className="font-medium text-blue-600">Procedure:</span>
                                      <p className="text-gray-800">{pet.dentalCareDetails.procedure}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-blue-600">Pet Size:</span>
                                      <p className="text-gray-800">{pet.dentalCareDetails.size}</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                    <div>
                                      <span className="font-medium text-blue-600">Anesthetic:</span>
                                      <p className="text-gray-800">{pet.dentalCareDetails.anesthetic}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium text-blue-600">Total Price:</span>
                                      <p className="text-gray-800 font-semibold">₱{pet.dentalCareDetails.totalPrice}</p>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      <p>Procedure: ₱{pet.dentalCareDetails.procedurePrice}</p>
                                      <p>Anesthetic: ₱{pet.dentalCareDetails.anestheticPrice}</p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-blue-50 p-3 rounded-lg text-center">
                                  <p className="text-sm text-gray-500">No dental care service selected for this pet</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grooming Cost Summary */}
                  {walkInData.services.includes('Pet Grooming') && walkInData.pets.some(pet => pet.groomingDetails) && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-3">Grooming Services Summary</h3>
                      {walkInData.pets.map((pet, index) => {
                        if (!pet.groomingDetails) return null;
                        
                        return (
                          <div key={index} className="mb-3 last:mb-0">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-gray-700">
                                {pet.name || `Pet ${index + 1}`}
                              </span>
                              <span className="text-teal-600 font-semibold">₱{pet.groomingDetails.price}</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="ml-4 flex justify-between">
                                <span>{pet.groomingDetails.category} ({pet.groomingDetails.size})</span>
                                <span>₱{pet.groomingDetails.price}</span>
                              </div>
                              <div className="ml-4 text-xs text-gray-500">
                                {pet.groomingDetails.isPackage ? 'Package Service' : 'Individual Service'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div className="pt-3 border-t border-gray-300 mt-3">
                        <div className="flex justify-between items-center font-semibold text-lg">
                          <span className="text-gray-800">Total Grooming Cost:</span>
                          <span className="text-teal-600">
                            ₱{walkInData.pets.reduce((total, pet) => {
                              return total + (pet.groomingDetails?.price || 0);
                            }, 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dental Care Cost Summary */}
                  {walkInData.services.includes('Dental Care') && walkInData.pets.some(pet => pet.dentalCareDetails) && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-gray-800 mb-3">Dental Care Services Summary</h3>
                      {walkInData.pets.map((pet, index) => {
                        if (!pet.dentalCareDetails) return null;
                        
                        return (
                          <div key={index} className="mb-3 last:mb-0">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-gray-700">
                                {pet.name || `Pet #${index + 1}`}
                              </span>
                              <span className="text-blue-600 font-semibold">₱{pet.dentalCareDetails.totalPrice}</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="ml-4 flex justify-between">
                                <span>{pet.dentalCareDetails.procedure} ({pet.dentalCareDetails.size})</span>
                                <span>₱{pet.dentalCareDetails.procedurePrice}</span>
                              </div>
                              <div className="ml-4 flex justify-between">
                                <span>{pet.dentalCareDetails.anesthetic} Anesthetic</span>
                                <span>₱{pet.dentalCareDetails.anestheticPrice}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div className="pt-3 border-t border-blue-300 mt-3">
                        <div className="flex justify-between items-center font-semibold text-lg">
                          <span className="text-gray-800">Total Dental Care Cost:</span>
                          <span className="text-blue-600">
                            ₱{walkInData.pets.reduce((total, pet) => {
                              return total + (pet.dentalCareDetails?.totalPrice || 0);
                            }, 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Grand Total Summary */}
                  {((walkInData.services.includes('Pet Grooming') && walkInData.pets.some(pet => pet.groomingDetails)) || 
                    (walkInData.services.includes('Dental Care') && walkInData.pets.some(pet => pet.dentalCareDetails))) && (
                    <div className="bg-gray-100 p-4 rounded-lg border-2 border-gray-300">
                      <h3 className="font-semibold text-gray-800 mb-3">Appointment Summary</h3>
                      
                      {/* Services Base Cost */}
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Services Total:</span>
                          <span className="font-medium">₱0</span>
                        </div>
                        
                        {walkInData.services.includes('Pet Grooming') && walkInData.pets.some(pet => pet.groomingDetails) && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Grooming Total:</span>
                            <span className="font-medium text-teal-600">
                              ₱{walkInData.pets.reduce((total, pet) => {
                                return total + (pet.groomingDetails?.price || 0);
                              }, 0)}
                            </span>
                          </div>
                        )}
                        
                        {walkInData.services.includes('Dental Care') && walkInData.pets.some(pet => pet.dentalCareDetails) && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Dental Care Total:</span>
                            <span className="font-medium text-blue-600">
                              ₱{walkInData.pets.reduce((total, pet) => {
                                return total + (pet.dentalCareDetails?.totalPrice || 0);
                              }, 0)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-3 border-t border-gray-400">
                        <div className="flex justify-between items-center text-xl font-bold">
                          <span className="text-gray-900">Grand Total:</span>
                          <span className="text-indigo-600">
                            ₱{walkInData.pets.reduce((total, pet) => {
                              return total + (pet.groomingDetails?.price || 0) + (pet.dentalCareDetails?.totalPrice || 0);
                            }, 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={walkInLoading}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                        walkInLoading 
                          ? 'bg-gray-400 text-white cursor-not-allowed' 
                          : 'bg-teal-600 text-white hover:bg-teal-700'
                      }`}
                    >
                      {walkInLoading ? 'Creating Appointment...' : 'Create Walk-In Appointment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Customers Management */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
                    Customer Management
                  </h2>
                  <button
                    onClick={fetchCustomers}
                    disabled={customersLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
                  >
                    {customersLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      'Refresh Customers'
                    )}
                  </button>
                </div>
                <p className="text-gray-600 mt-1">View all customers and their pet appointment history</p>
                
                {/* Search and Filter Section */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Search Input */}
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search customers..."
                        value={customerSearchTerm}
                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Filter Type Dropdown */}
                  <div>
                    <select
                      value={customerFilterType}
                      onChange={(e) => setCustomerFilterType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="all">Search All Fields</option>
                      <option value="name">Customer Name</option>
                      <option value="email">Email Address</option>
                      <option value="petName">Pet Name</option>
                      <option value="lastVisit">Last Visit Date</option>
                    </select>
                  </div>

                  {/* Verification Filter */}
                  <div>
                    <select
                      value={verificationFilter}
                      onChange={(e) => setVerificationFilter(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="all">All Customers</option>
                      <option value="verified">Verified Only</option>
                      <option value="unverified">Unverified Only</option>
                    </select>
                  </div>
                </div>

                {/* Filter Actions and Results Count */}
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-4">
                    {(customerSearchTerm || customerFilterType !== 'all' || verificationFilter !== 'all') && (
                      <button
                        onClick={clearCustomerFilters}
                        className="text-sm text-teal-600 hover:text-teal-800 transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-2 sm:mt-0">
                    Showing {getFilteredCustomers().length} of {customers.length} customers
                  </div>
                </div>
              </div>

              <div className="p-6">
                {customersLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <FaSpinner className="animate-spin text-2xl text-teal-600" />
                  </div>
                ) : getFilteredCustomers().length === 0 ? (
                  <div className="text-center py-8">
                    {customers.length === 0 ? (
                      <p className="text-gray-500">No customers found.</p>
                    ) : (
                      <div>
                        <p className="text-gray-500 mb-2">No customers match your search criteria.</p>
                        <button
                          onClick={clearCustomerFilters}
                          className="text-teal-600 hover:text-teal-800 text-sm"
                        >
                          Clear filters to show all customers
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getFilteredCustomers().map((customer) => (
                      <div key={customer.id} className="border border-gray-200 rounded-lg">
                        {/* Customer Header */}
                        <div 
                          className="px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                <FaUsers className="text-teal-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                                <p className="text-sm text-gray-500">{customer.email}</p>
                                <p className="text-sm text-gray-500">
                                  📞 {customer.phone_number || 'No phone number set'}
                                </p>
                                {customer.email_verified_at && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                    Verified
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {customer.total_appointments} appointment{customer.total_appointments !== 1 ? 's' : ''}
                              </p>
                              {customer.last_appointment && (
                                <p className="text-xs text-gray-400">
                                  Last: {new Date(customer.last_appointment).toLocaleDateString()}
                                </p>
                              )}
                              <div className="mt-1">
                                {expandedCustomer === customer.id ? (
                                  <FaTimes className="text-gray-400" />
                                ) : (
                                  <FaEye className="text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Customer Details */}
                        {expandedCustomer === customer.id && (
                          <div className="px-4 py-4 border-t border-gray-200">
                            {customer.pets.length === 0 ? (
                              <p className="text-gray-500 text-center py-4">No pets registered yet.</p>
                            ) : (
                              <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Pets & Appointment History</h4>
                                {customer.pets.map((pet: any, petIndex: number) => (
                                  <div key={petIndex} className="border border-gray-100 rounded-lg">
                                    {/* Pet Header */}
                                    <div 
                                      className="px-3 py-2 bg-gray-25 cursor-pointer hover:bg-gray-50 transition-colors"
                                      onClick={() => setExpandedPet(expandedPet === `${customer.id}-${petIndex}` ? null : `${customer.id}-${petIndex}`)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 text-sm font-medium">
                                              {pet.type === 'dog' ? '🐕' : '🐱'}
                                            </span>
                                          </div>
                                          <div>
                                            <p className="font-medium text-gray-800">{pet.name || 'Unnamed Pet'}</p>
                                            <p className="text-sm text-gray-500">{pet.breed} ({pet.type})</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm text-gray-500">
                                            {pet.appointments.length} visit{pet.appointments.length !== 1 ? 's' : ''}
                                          </p>
                                          <div className="mt-1">
                                            {expandedPet === `${customer.id}-${petIndex}` ? (
                                              <FaTimes className="text-gray-400 text-sm" />
                                            ) : (
                                              <FaEye className="text-gray-400 text-sm" />
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Expanded Pet Appointment History */}
                                    {expandedPet === `${customer.id}-${petIndex}` && (
                                      <div className="px-3 py-3 border-t border-gray-100">
                                        {pet.appointments.length === 0 ? (
                                          <p className="text-gray-400 text-sm text-center py-2">No appointment history</p>
                                        ) : (
                                          <div className="space-y-2">
                                            <h5 className="text-sm font-medium text-gray-700 mb-2">Appointment History</h5>
                                            {pet.appointments.map((appointment: any, appIndex: number) => (
                                              <div key={appIndex} className="bg-white border border-gray-100 rounded p-3 text-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                  <div className="flex items-center space-x-2">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                      appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                      'bg-red-100 text-red-800'
                                                    }`}>
                                                      {appointment.status}
                                                    </span>
                                                    <span className="text-gray-600">
                                                      {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time}
                                                    </span>
                                                  </div>
                                                  <button
                                                    onClick={() => handleCustomerAppointmentDetails(appointment.id)}
                                                    className="px-3 py-1 bg-teal-100 text-teal-700 rounded hover:bg-teal-200 transition-colors text-xs font-medium"
                                                  >
                                                    Details
                                                  </button>
                                                </div>
                                                <div className="text-gray-600">
                                                  <p><strong>Services:</strong> {appointment.services.join(', ')}</p>
                                                  {appointment.notes && (
                                                    <p><strong>Notes:</strong> {appointment.notes}</p>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
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
                        Pet & Owner
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
                              <div className="text-sm text-gray-500">Owner: {record.owner_name || 'Unknown'}</div>
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

          {/* Analytics Tab - Admin Only */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {!isAdmin() ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Access Restricted</h3>
                  <p className="text-red-600">Analytics are only available to administrator accounts.</p>
                </div>
              ) : (
                <>
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
                      <p className="text-sm font-medium text-gray-600">This Month's Earnings</p>
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

              {/* Analytics Reports */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Analytics Reports</h3>
                      <p className="text-sm text-gray-600 mt-1">Detailed monthly reports and trends</p>
                    </div>
                    
                    {/* Sub-tab Navigation */}
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => setAnalyticsSubTab('appointments')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          analyticsSubTab === 'appointments'
                            ? 'bg-white text-teal-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Monthly Appointments
                      </button>
                      <button
                        onClick={() => setAnalyticsSubTab('income')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          analyticsSubTab === 'income'
                            ? 'bg-white text-teal-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Monthly Income
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Monthly Appointments Report */}
                {analyticsSubTab === 'appointments' && (
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Monthly Appointments Report</h4>
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
                )}

                {/* Monthly Income Report */}
                {analyticsSubTab === 'income' && (
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Monthly Income Report</h4>
                    {analyticsData && analyticsData.monthlyIncome ? (
                      <div className="space-y-4">
                        {Object.entries(analyticsData.monthlyIncome).map(([month, income]: [string, any]) => {
                          const incomeNum = Number(income);
                          const maxIncome = Math.max(1, ...Object.values(analyticsData.monthlyIncome).map((val: any) => Number(val)));
                          const percentage = maxIncome > 0 ? (incomeNum / maxIncome) * 100 : 0;
                          
                          return (
                            <div key={month} className="flex items-center space-x-4">
                              <div className="w-24 text-sm font-medium text-gray-700">
                                {month}
                              </div>
                              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                                <div
                                  className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                                  style={{ width: `${Math.max(percentage, incomeNum > 0 ? 10 : 0)}%` }}
                                >
                                  {incomeNum > 0 && (
                                    <span className="text-white text-sm font-medium">
                                      ₱{incomeNum.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="w-20 text-sm text-gray-600">
                                ₱{incomeNum.toLocaleString()}
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
                            <p className="text-gray-500">Loading income data...</p>
                          </>
                        ) : (
                          <>
                            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <p className="text-gray-500">No income data available.</p>
                          </>
                        )}
                      </div>
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
                                <p><span className="font-medium">Phone:</span> {appointment.user.phone_number || 'No phone number set'}</p>
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
              </>
              )}
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Inventory Management</h3>
                      <p className="text-sm text-gray-600 mt-1">Manage products and categories for your veterinary clinic</p>
                    </div>
                    
                    {/* Sub-tab Navigation */}
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => setInventorySubTab('products')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          inventorySubTab === 'products'
                            ? 'bg-white text-teal-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Products
                      </button>
                      <button
                        onClick={() => setInventorySubTab('categories')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          inventorySubTab === 'categories'
                            ? 'bg-white text-teal-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Categories
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Products Management */}
                {inventorySubTab === 'products' && (
                  <div className="p-6">
                    {/* Stock Status Summary */}
                    {(() => {
                      const outOfStock = products.filter(p => p.quantity === 0);
                      const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= 5);
                      
                      if (outOfStock.length > 0 || lowStock.length > 0) {
                        return (
                          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {outOfStock.length > 0 && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                      {outOfStock.length} Product{outOfStock.length > 1 ? 's' : ''} Out of Stock
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                      <p>These products are unavailable for appointments.</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {lowStock.length > 0 && (
                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <div className="ml-3">
                                    <h3 className="text-sm font-medium text-orange-800">
                                      {lowStock.length} Product{lowStock.length > 1 ? 's' : ''} Low Stock
                                    </h3>
                                    <div className="mt-2 text-sm text-orange-700">
                                      <p>5 or fewer items remaining. Consider restocking soon.</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Search and Filter Controls */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Search by name, description, or ID..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                      <div className="w-full md:w-48">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                          <option value="">All Categories</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id.toString()}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          setEditingProduct(null);
                          setProductFormData({ name: '', description: '', price: '', quantity: '', category_id: '' });
                          setShowProductModal(true);
                        }}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap"
                      >
                        Add Product
                      </button>
                    </div>

                    {/* Products Table */}
                    {inventoryLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading products...</p>
                      </div>
                    ) : products.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                              <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">#{product.id}</td>
                                <td className="px-4 py-4">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                    {product.description && (
                                      <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  {product.category ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {product.category.name}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-gray-400">No category</span>
                                  )}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">₱{product.price}</td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleUpdateQuantity(product.id, 'decrement')}
                                      className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                                      disabled={product.quantity === 0}
                                    >
                                      -
                                    </button>
                                    <div className="min-w-[5rem] text-center">
                                      <span className={`text-sm font-medium ${
                                        product.quantity === 0 
                                          ? 'text-red-600' 
                                          : product.quantity <= 5 
                                          ? 'text-orange-600' 
                                          : 'text-gray-900'
                                      }`}>
                                        {product.quantity}
                                      </span>
                                      {product.quantity === 0 && (
                                        <div className="text-xs text-red-600 font-medium">OUT OF STOCK</div>
                                      )}
                                      {product.quantity > 0 && product.quantity <= 5 && (
                                        <div className="text-xs text-orange-600 font-medium">LOW STOCK</div>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => handleUpdateQuantity(product.id, 'increment')}
                                      className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => {
                                        setEditingProduct(product);
                                        setProductFormData({
                                          name: product.name,
                                          description: product.description || '',
                                          price: product.price.toString(),
                                          quantity: product.quantity.toString(),
                                          category_id: product.category_id?.toString() || ''
                                        });
                                        setShowProductModal(true);
                                      }}
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(product.id)}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 5l7 3" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-500 mb-4">
                          {productSearchTerm || selectedCategory ? 'No products match your current filters.' : 'Get started by adding your first product.'}
                        </p>
                        <button
                          onClick={() => {
                            setEditingProduct(null);
                            setProductFormData({ name: '', description: '', price: '', quantity: '', category_id: '' });
                            setShowProductModal(true);
                          }}
                          className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                        >
                          Add Product
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Categories Management */}
                {inventorySubTab === 'categories' && (
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-lg font-medium text-gray-900">Product Categories</h4>
                      <button
                        onClick={() => {
                          setEditingCategory(null);
                          setCategoryFormData({ name: '', description: '' });
                          setShowCategoryModal(true);
                        }}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        Add Category
                      </button>
                    </div>

                    {categories.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((category) => (
                          <div key={category.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h5 className="text-lg font-medium text-gray-900">{category.name}</h5>
                                {category.description && (
                                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                                )}
                              </div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {category.products_count || 0} products
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingCategory(category);
                                  setCategoryFormData({
                                    name: category.name,
                                    description: category.description || ''
                                  });
                                  setShowCategoryModal(true);
                                }}
                                className="flex-1 px-3 py-2 text-sm bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                        <p className="text-gray-500 mb-4">Create categories to organize your products.</p>
                        <button
                          onClick={() => {
                            setEditingCategory(null);
                            setCategoryFormData({ name: '', description: '' });
                            setShowCategoryModal(true);
                          }}
                          className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                        >
                          Add Category
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Staff Management Tab - Admin Only */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              {!isAdmin() ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Access Restricted</h3>
                  <p className="text-red-600">Staff management is only available to administrator accounts.</p>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Staff Management</h3>
                          <p className="text-sm text-gray-600 mt-1">Manage staff accounts and permissions</p>
                        </div>
                        <button
                          onClick={() => {
                            setEditingStaff(null);
                            setStaffFormData({
                              name: '',
                              email: '',
                              phone: '',
                              role: 'staff',
                              password: '',
                              confirmPassword: ''
                            });
                            setShowStaffModal(true);
                          }}
                          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Staff Member
                        </button>
                      </div>

                      {/* Search Bar */}
                      <div className="mt-4">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search staff by name or email..."
                            value={staffSearchTerm}
                            onChange={(e) => setStaffSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                          />
                          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Staff List */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Staff Member
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredStaffMembers.map((staff) => {
                            const isCurrentUser = user?.id === staff.id;
                            return (
                              <tr key={staff.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                                      <span className="text-sm font-medium text-teal-800">
                                        {staff.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {staff.name} {isCurrentUser && '(You)'}
                                      </div>
                                      <div className="text-sm text-gray-500">{staff.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    staff.role === 'admin' 
                                      ? 'bg-purple-100 text-purple-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {staff.role}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(staff.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  {!isCurrentUser ? (
                                    <>
                                      <button
                                        onClick={() => handleEditStaff(staff)}
                                        className="text-teal-600 hover:text-teal-900 mr-4"
                                      >
                                        Edit
                                      </button>
                                      {staff.email !== (process.env.REACT_APP_MAIN_ADMIN_EMAIL || 'admin@petcare.com') && (
                                        <button
                                          onClick={() => handleDeleteStaff(staff.id)}
                                          className="text-red-600 hover:text-red-900"
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-gray-400 text-xs">Cannot edit own account</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          {filteredStaffMembers.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                No staff members found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Staff Member Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
            </div>
            <form onSubmit={handleStaffSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={staffFormData.name}
                  onChange={(e) => setStaffFormData({...staffFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={staffFormData.email}
                  onChange={(e) => setStaffFormData({...staffFormData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={staffFormData.phone}
                  onChange={(e) => setStaffFormData({...staffFormData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={staffFormData.role}
                  onChange={(e) => setStaffFormData({...staffFormData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingStaff && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  required={!editingStaff}
                  value={staffFormData.password}
                  onChange={(e) => setStaffFormData({...staffFormData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required={!editingStaff || Boolean(staffFormData.password)}
                  value={staffFormData.confirmPassword}
                  onChange={(e) => setStaffFormData({...staffFormData, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Confirm password"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowStaffModal(false);
                    setEditingStaff(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                  {editingStaff ? 'Update Staff' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={productFormData.name}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={productFormData.description}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter product description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₱) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={productFormData.price}
                      onChange={(e) => setProductFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productFormData.quantity}
                      onChange={(e) => setProductFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={productFormData.category_id}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter category description"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    {editingCategory ? 'Update Category' : 'Add Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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

                      {/* Dental Care Details */}
                      {pet.dental_care_details && (
                        <div className="mt-4">
                          <h6 className="font-medium text-gray-900 mb-2">Dental Care Services</h6>
                          {(() => {
                            const dentalDetails = typeof pet.dental_care_details === 'string' ? 
                              JSON.parse(pet.dental_care_details) : pet.dental_care_details;
                            
                            return (
                              <div className="bg-blue-50 rounded p-3">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-sm">
                                    <div>
                                      <span className="text-gray-700">{dentalDetails.procedure}</span>
                                      <span className="text-gray-500 ml-2">({dentalDetails.size})</span>
                                    </div>
                                    <span className="text-blue-600 font-medium">
                                      ₱{dentalDetails.procedurePrice}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <div>
                                      <span className="text-gray-700">{dentalDetails.anesthetic} Anesthetic</span>
                                    </div>
                                    <span className="text-blue-600 font-medium">
                                      ₱{dentalDetails.anestheticPrice}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-blue-200">
                                  <div className="flex justify-between items-center font-semibold">
                                    <span className="text-gray-800">Pet Dental Care Total:</span>
                                    <span className="text-blue-600">₱{dentalDetails.totalPrice}</span>
                                  </div>
                                </div>
                              </div>
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
              {/* Inventory Products Used */}
              {selectedAppointment.status === 'completed' && (selectedAppointment as any).inventory_usage && (selectedAppointment as any).inventory_usage.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Products Used</h4>
                  <div className="space-y-2">
                    {(selectedAppointment as any).inventory_usage.map((usage: any, index: number) => (
                      <div key={index} className="flex justify-between items-center bg-white rounded p-3">
                        <div>
                          <p className="font-medium text-gray-900">{usage.product_name}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {usage.quantity_used} × ₱{parseFloat(usage.unit_price).toFixed(2)}
                          </p>
                        </div>
                        <span className="text-purple-600 font-semibold">₱{parseFloat(usage.total_price).toFixed(2)}</span>
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
                    <span className="font-medium">₱{selectedAppointment.services
                      .filter(service => service.name !== 'Pet Grooming')
                      .reduce((sum, service) => sum + (parseFloat(service.price) || 0), 0)}</span>
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
                  {selectedAppointment.pets.some(pet => pet.dental_care_details) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dental Care Total:</span>
                      <span className="font-medium">
                        ₱{selectedAppointment.pets.reduce((total, pet) => {
                          return total + calculatePetDentalCareTotal(pet.dental_care_details);
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
                  {selectedAppointment.status === 'completed' && (selectedAppointment as any).inventory_usage && (selectedAppointment as any).inventory_usage.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Products Used Total:</span>
                      <span className="font-medium">
                        ₱{(selectedAppointment as any).inventory_usage.reduce((total: number, usage: any) => {
                          return total + (parseFloat(usage.total_price) || 0);
                        }, 0)}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-300">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Grand Total:</span>
                      <span className="text-teal-600">
                        ₱{selectedAppointment.services
                          .filter(service => service.name !== 'Pet Grooming' && service.name !== 'Dental Care')
                          .reduce((sum, service) => sum + (parseFloat(service.price) || 0), 0) +
                          selectedAppointment.pets.reduce((total, pet) => {
                            return total + calculatePetGroomingTotal(pet.grooming_details);
                          }, 0) +
                          selectedAppointment.pets.reduce((total, pet) => {
                            return total + calculatePetDentalCareTotal(pet.dental_care_details);
                          }, 0) +
                          (selectedAppointment.status === 'completed' && (selectedAppointment as any).medicalRecords ? 
                            (selectedAppointment as any).medicalRecords.reduce((total: number, record: any) => {
                              return total + (parseFloat(record.test_cost) || 0);
                            }, 0) : 0) +
                          (selectedAppointment.status === 'completed' && (selectedAppointment as any).inventory_usage ? 
                            (selectedAppointment as any).inventory_usage.reduce((total: number, usage: any) => {
                              return total + (parseFloat(usage.total_price) || 0);
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
                    {['pending', 'confirmed'].includes(selectedAppointment.status) && (
                      <button
                        onClick={() => {
                          handleRescheduleClick(selectedAppointment.id);
                          handleCloseDetails();
                        }}
                        disabled={updatingStatus === selectedAppointment.id}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                      >
                        Reschedule
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

              {/* Inventory Products Section */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Inventory Products (Optional)</h4>
                <p className="text-sm text-gray-600 mb-4">Add products used/dispensed during this appointment</p>
                
                {/* Search and Filter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Products (by name or ID)
                    </label>
                    <input
                      type="text"
                      value={inventorySearchTerm}
                      onChange={(e) => setInventorySearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Search products..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Category
                    </label>
                    <select
                      value={inventoryFilterCategory}
                      onChange={(e) => setInventoryFilterCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id.toString()}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Available Products */}
                {getFilteredInventoryProducts().length > 0 ? (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-700 mb-2">Available Products</h5>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded p-3">
                      <div className="space-y-2">
                        {getFilteredInventoryProducts().map(product => (
                          <div key={product.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <div className="font-medium text-sm">{product.name}</div>
                                {product.quantity <= 5 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    LOW STOCK
                                  </span>
                                )}
                              </div>
                              <div className={`text-xs ${product.quantity <= 5 ? 'text-orange-600' : 'text-gray-500'}`}>
                                ID: {product.id} | Stock: {product.quantity} | ₱{product.price}
                                {product.quantity <= 5 && (
                                  <span className="font-medium"> - Only {product.quantity} left!</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400">
                                {product.category_id ? 
                                  categories.find(cat => cat.id === product.category_id)?.name || 'Unknown Category'
                                  : 'No Category'
                                }
                              </div>
                            </div>
                            <button
                              onClick={() => addInventoryItem(product)}
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-sm font-medium"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 text-center py-4 text-gray-500 text-sm">
                    {inventorySearchTerm || inventoryFilterCategory ? 'No products found matching your criteria' : 'Search for products to add'}
                  </div>
                )}

                {/* Selected Products */}
                {selectedInventoryItems.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-700 mb-2">Selected Products</h5>
                    <div className="space-y-2 border border-gray-200 rounded p-3">
                      {selectedInventoryItems.map(item => (
                        <div key={item.product.id} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <div className="font-medium text-sm">{item.product.name}</div>
                              {item.product.quantity <= 5 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  LOW STOCK
                                </span>
                              )}
                            </div>
                            <div className={`text-xs ${item.product.quantity <= 5 ? 'text-orange-600' : 'text-gray-500'}`}>
                              ₱{item.product.price} each | Available: {item.product.quantity}
                              {item.quantity >= item.product.quantity && (
                                <span className="font-medium text-red-600"> - Using all available stock!</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="1"
                              max={item.product.quantity}
                              value={item.quantity}
                              onChange={(e) => updateInventoryItemQuantity(item.product.id, parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                            />
                            <span className="text-sm font-medium">
                              ₱{(item.product.price * item.quantity).toFixed(2)}
                            </span>
                            <button
                              onClick={() => removeInventoryItem(item.product.id)}
                              className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="border-t border-gray-300 mt-3 pt-3">
                        <div className="flex justify-between font-medium">
                          <span>Products Total:</span>
                          <span>₱{calculateInventoryItemsTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

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

                {/* Inventory Products */}
                {selectedInventoryItems.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-700 mb-2">Products Used</h5>
                    {selectedInventoryItems.map(item => (
                      <div key={item.product.id} className="flex justify-between text-sm mb-1">
                        <span>{item.product.name} (x{item.quantity})</span>
                        <span>₱{(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Grand Total:</span>
                    <span className="text-teal-600">
                      ₱{(
                        appointmentToComplete.services
                          .filter(service => service.name !== 'Pet Grooming' && service.name !== 'Dental Care')
                          .reduce((sum, service) => sum + (parseFloat(service.price) || 0), 0) +
                        appointmentToComplete.pets.reduce((total, pet) => total + calculatePetGroomingTotal(pet.grooming_details), 0) +
                        appointmentToComplete.pets.reduce((total, pet) => total + calculatePetDentalCareTotal(pet.dental_care_details), 0) +
                        medicalExam.totalCost +
                        calculateInventoryItemsTotal()
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

              {/* Inventory Products Used */}
              {(selectedPetRecord as any).inventory_usage && (selectedPetRecord as any).inventory_usage.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Products Used</h4>
                  <div className="space-y-2">
                    {(selectedPetRecord as any).inventory_usage.map((usage: any, index: number) => (
                      <div key={index} className="bg-white rounded p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{usage.product_name}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {usage.quantity_used} × ₱{parseFloat(usage.unit_price).toFixed(2)}
                          </p>
                        </div>
                        <span className="text-purple-600 font-semibold">₱{parseFloat(usage.total_price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-gray-800">Total Products Cost:</span>
                      <span className="text-purple-600">
                        ₱{(selectedPetRecord as any).inventory_usage.reduce((total: number, usage: any) => {
                          return total + (parseFloat(usage.total_price) || 0);
                        }, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Cost Summary */}
              <div className="bg-teal-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Cost Summary</h4>
                <div className="space-y-2">
                  {selectedPetRecord.test_cost && parseFloat(selectedPetRecord.test_cost) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medical Tests:</span>
                      <span className="font-medium">₱{parseFloat(selectedPetRecord.test_cost).toFixed(2)}</span>
                    </div>
                  )}
                  {(selectedPetRecord as any).inventory_usage && (selectedPetRecord as any).inventory_usage.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Products Used:</span>
                      <span className="font-medium">
                        ₱{(selectedPetRecord as any).inventory_usage.reduce((total: number, usage: any) => {
                          return total + (parseFloat(usage.total_price) || 0);
                        }, 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-300">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Grand Total:</span>
                      <span className="text-teal-600">
                        ₱{(
                          (parseFloat(selectedPetRecord.test_cost) || 0) +
                          ((selectedPetRecord as any).inventory_usage ? 
                            (selectedPetRecord as any).inventory_usage.reduce((total: number, usage: any) => {
                              return total + (parseFloat(usage.total_price) || 0);
                            }, 0) : 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
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
      
      {/* Walk-In Grooming Selection Modal */}
      {showWalkInGroomingModal && currentWalkInPetForGrooming !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Select Grooming Package for {walkInData.pets[currentWalkInPetForGrooming]?.name || `Pet #${currentWalkInPetForGrooming + 1}`}
                </h3>
                <button
                  onClick={handleWalkInGroomingModalClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Package Services */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Package Services</h4>
                <div className="space-y-6">
                  {Object.entries(groomingPackages).map(([packageName, sizes]) => (
                    <div key={packageName} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-700 mb-3">{packageName}</h5>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {Object.entries(sizes).map(([size, price]) => {
                          const getWeightRange = (size: string) => {
                            switch(size) {
                              case 'X-Small': return '<5kg';
                              case 'Small': return '5.1-8.5kg';
                              case 'Medium': return '8.6-17kg';
                              case 'Large': return '17.1-35kg';
                              case 'X-Large': return '35.1kg+';
                              default: return '';
                            }
                          };
                          
                          return (
                            <button
                              key={`${packageName}-${size}`}
                              type="button"
                              onClick={() => {
                                updateWalkInPetGrooming(currentWalkInPetForGrooming, packageName, size, price, true);
                                handleWalkInGroomingModalClose();
                              }}
                              className="p-3 border border-gray-300 rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-colors text-center"
                            >
                              <div className="font-medium text-gray-800">{size}</div>
                              <div className="text-xs text-gray-500 mb-1">({getWeightRange(size)})</div>
                              <div className="text-teal-600 font-semibold">₱{price}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Services */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Individual Services</h4>
                <div className="space-y-6">
                  {Object.entries(individualServices).map(([serviceName, sizes]) => (
                    <div key={serviceName} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-700 mb-3">{serviceName}</h5>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {Object.entries(sizes).map(([size, price]) => {
                          const getWeightRange = (size: string) => {
                            switch(size) {
                              case 'X-Small': return '<5kg';
                              case 'Small': return '5.1-8.5kg';
                              case 'Medium': return '8.6-17kg';
                              case 'Large': return '17.1-35kg';
                              case 'X-Large': return '35.1kg+';
                              case 'Any Size': return 'Any Size';
                              default: return '';
                            }
                          };
                          
                          return (
                            <button
                              key={`${serviceName}-${size}`}
                              type="button"
                              onClick={() => {
                                updateWalkInPetGrooming(currentWalkInPetForGrooming, serviceName, size, price, false);
                                handleWalkInGroomingModalClose();
                              }}
                              className="p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-center"
                            >
                              <div className="font-medium text-gray-800">{size}</div>
                              <div className="text-xs text-gray-500 mb-1">({getWeightRange(size)})</div>
                              <div className="text-blue-600 font-semibold">₱{price}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Select a package or individual service for your pet
                </p>
                <button
                  onClick={handleWalkInGroomingModalClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Walk-in Dental Care Selection Modal */}
      {showWalkInDentalCareModal && currentWalkInPetForDentalCare !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Select Dental Procedure for {walkInData.pets[currentWalkInPetForDentalCare]?.name || `Pet #${currentWalkInPetForDentalCare + 1}`}
                </h3>
                <button
                  onClick={handleWalkInDentalCareModalClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {!selectedWalkInDentalProcedure ? (
                /* Step 1: Select Procedure */
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Step 1: Select Dental Procedure</h4>
                  <p className="text-sm text-gray-600 mb-4">Choose a procedure based on your pet's weight category</p>
                  <div className="space-y-6">
                    {Object.entries(dentalCareProcedures).map(([procedureName, sizes]) => (
                      <div key={procedureName} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-700 mb-3">{procedureName}</h5>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {Object.entries(sizes).map(([size, price]) => (
                            <button
                              key={`${procedureName}-${size}`}
                              type="button"
                              onClick={() => setSelectedWalkInDentalProcedure({procedure: procedureName, size, price})}
                              className="p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-center"
                            >
                              <div className="font-medium text-gray-800">{size}</div>
                              <div className="text-blue-600 font-semibold">
                                {price === 0 ? 'Free' : `₱${price}`}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Step 2: Select Anesthetic */
                <div>
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h4 className="text-lg font-semibold text-blue-800 mb-2">Selected Procedure</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">{selectedWalkInDentalProcedure.procedure} ({selectedWalkInDentalProcedure.size})</span>
                      <span className="font-semibold text-blue-600">
                        {selectedWalkInDentalProcedure.price === 0 ? 'Free' : `₱${selectedWalkInDentalProcedure.price}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedWalkInDentalProcedure(null)}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                    >
                      ← Change Procedure
                    </button>
                  </div>

                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Step 2: Select Anesthetic Type</h4>
                  <p className="text-sm text-gray-600 mb-4">Choose the appropriate anesthetic for your pet</p>
                  <div className="space-y-6">
                    {Object.entries(dentalCareAnesthetics).map(([anestheticType, sizes]) => (
                      <div key={anestheticType} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-700 mb-3">{anestheticType} Anesthetic</h5>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {Object.entries(sizes).map(([size, price]) => (
                            <button
                              key={`${anestheticType}-${size}`}
                              type="button"
                              onClick={() => {
                                updateWalkInPetDentalCare(
                                  currentWalkInPetForDentalCare,
                                  selectedWalkInDentalProcedure.procedure,
                                  selectedWalkInDentalProcedure.size,
                                  selectedWalkInDentalProcedure.price,
                                  anestheticType,
                                  price
                                );
                                handleWalkInDentalCareModalClose();
                              }}
                              className="p-3 border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors text-center"
                            >
                              <div className="font-medium text-gray-800">{size}</div>
                              <div className="text-green-600 font-semibold">₱{price}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                Total: ₱{selectedWalkInDentalProcedure.price + price}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {!selectedWalkInDentalProcedure ? 
                    'Select a dental procedure to continue' : 
                    'Select an anesthetic type to complete the configuration'
                  }
                </p>
                <button
                  onClick={handleWalkInDentalCareModalClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Reschedule Appointment</h2>
                <button
                  onClick={closeRescheduleModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Appointment Date
                  </label>
                  <input
                    type="date"
                    value={newSelectedDate ? newSelectedDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setNewSelectedDate(e.target.value ? new Date(e.target.value) : undefined)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Appointment Time
                  </label>
                  <select
                    value={newSelectedTime}
                    onChange={(e) => setNewSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    <option value="">Select time</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                    <option value="5:00 PM">5:00 PM</option>
                  </select>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Please note: Appointments cannot be scheduled on Sundays.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeRescheduleModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isRescheduling}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescheduleSubmit}
                  disabled={!newSelectedDate || !newSelectedTime || isRescheduling}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isRescheduling ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Rescheduling...
                    </>
                  ) : (
                    'Reschedule Appointment'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const AdminDashboardWithNotifications: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <AdminNotificationProvider userRole={user?.role}>
      <AdminDashboard />
    </AdminNotificationProvider>
  );
};

export default AdminDashboardWithNotifications;