import React, { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../utils/apiConfig';
import Header from '../components/header';
import { useNotification } from '../contexts/notificationContext';

import bg_appointment from '../assets/home/bg_appointment.jpg';

interface Pet {
  id: number;
  type: 'dog' | 'cat';
  breed: string;
  customBreed?: string;
  name: string;
  groomingDetails?: {
    category: string;
    size: string;
    price: number;
    isPackage: boolean;
  };
  dentalCareDetails?: {
    procedure: string;
    size: string;
    procedurePrice: number;
    anesthetic: string;
    anestheticPrice: number;
    totalPrice: number;
  };
  vaccineDetails?: Vaccine[];
}

interface AppointmentData {
  selectedDate: Date | undefined;
  selectedTime: string;
  pets: Pet[];
  services: string[];
}

interface TimeSlot {
  time: string;
  available: boolean;
  booked_count: number;
  max_capacity: number;
  remaining_slots: number;
}

interface Vaccine {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
}

const SetAppointment: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    selectedDate: undefined,
    selectedTime: '',
    pets: [],
    services: []
  });

  const [petCount, setPetCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState<boolean>(false);
  
  // Vaccine selection state
  const [availableVaccines, setAvailableVaccines] = useState<Vaccine[]>([]);
  const [showVaccineModal, setShowVaccineModal] = useState<boolean>(false);
  const [isLoadingVaccines, setIsLoadingVaccines] = useState<boolean>(false);

  // Available time slots from 8 AM to 3 PM
  const timeSlots = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM'
  ];

  const availableServices = [
    'Pet Grooming',
    'Health Checkups',
    'Vaccination',
    'Dental Care'
  ];

  const dogBreeds = [
    'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Bulldog',
    'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund',
    'Siberian Husky', 'Boxer', 'Border Collie', 'Mixed Breed', 'Other'
  ];

  const catBreeds = [
    'Persian', 'Maine Coon', 'British Shorthair', 'Ragdoll', 'Bengal',
    'Siamese', 'Abyssinian', 'Russian Blue', 'Scottish Fold', 'Sphynx',
    'American Shorthair', 'Domestic Shorthair', 'Mixed Breed', 'Other'
  ];

  // Disable Sundays and past dates (including today)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const disabledDays = [
    { before: tomorrow }, // Past dates and today
    { dayOfWeek: [0] } // Sundays (0 = Sunday)
  ];

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

  const petSizes = ['X-Small', 'Small', 'Medium', 'Large', 'X-Large'];

  // Modal state
  const [showGroomingModal, setShowGroomingModal] = useState(false);
  const [currentPetForGrooming, setCurrentPetForGrooming] = useState<number | null>(null);
  const [showDentalCareModal, setShowDentalCareModal] = useState(false);
  const [currentPetForDentalCare, setCurrentPetForDentalCare] = useState<number | null>(null);
  const [selectedDentalProcedure, setSelectedDentalProcedure] = useState<{procedure: string, size: string, price: number} | null>(null);
  const [currentPetForVaccination, setCurrentPetForVaccination] = useState<number | null>(null);
  const [tempSelectedVaccines, setTempSelectedVaccines] = useState<Vaccine[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState<{
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  } | null>(null);

  // Custom confirm function
  const showCustomConfirm = (message: string, onConfirm: () => void, onCancel?: () => void) => {
    setConfirmModalData({
      message,
      onConfirm,
      onCancel: onCancel || (() => {})
    });
    setShowConfirmModal(true);
  };

  const handleConfirmModalClose = () => {
    setShowConfirmModal(false);
    setConfirmModalData(null);
  };

  // Function to fetch available time slots for a given date
  const fetchAvailableTimeSlots = async (date: Date) => {
    try {
      setIsLoadingTimeSlots(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        showNotification('Please login to check available time slots.', 'error');
        return;
      }

      // Format date without timezone conversion to prevent day shifting
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`; // Format as YYYY-MM-DD
      
      const response = await fetch(`${apiUrl.availableTimeSlots()}?date=${dateString}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.status) {
        setAvailableTimeSlots(data.available_slots);
        
        // If currently selected time is no longer available, clear it
        if (appointmentData.selectedTime) {
          const selectedSlot = data.available_slots.find((slot: TimeSlot) => slot.time === appointmentData.selectedTime);
          if (selectedSlot && !selectedSlot.available) {
            setAppointmentData(prev => ({ ...prev, selectedTime: '' }));
            showNotification('Your previously selected time slot is now fully booked. Please select a different time.', 'warning');
          }
        }
      } else {
        console.error('Failed to fetch available time slots:', data.message);
        // Reset to default time slots if API fails
        setAvailableTimeSlots(timeSlots.map(time => ({
          time,
          available: true,
          booked_count: 0,
          max_capacity: 3,
          remaining_slots: 3
        })));
      }
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      // Reset to default time slots if fetch fails
      setAvailableTimeSlots(timeSlots.map(time => ({
        time,
        available: true,
        booked_count: 0,
        max_capacity: 3,
        remaining_slots: 3
      })));
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  // Function to fetch available vaccines from the Vaccines category
  const fetchAvailableVaccines = async () => {
    try {
      setIsLoadingVaccines(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        showNotification('Please login to view available vaccines.', 'error');
        return;
      }

      const response = await fetch(apiUrl.availableVaccines(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.status) {
        // Ensure price is converted to number to prevent toFixed errors
        const vaccinesWithNumericPrice = data.vaccines.map((vaccine: any) => ({
          ...vaccine,
          price: parseFloat(vaccine.price) || 0,
          quantity: parseInt(vaccine.quantity) || 0
        }));
        setAvailableVaccines(vaccinesWithNumericPrice);
      } else {
        console.error('Failed to fetch available vaccines:', data.message);
        showNotification(data.message || 'Failed to load available vaccines.', 'error');
        setAvailableVaccines([]);
      }
    } catch (error) {
      console.error('Error fetching available vaccines:', error);
      showNotification('Error loading vaccines. Please try again.', 'error');
      setAvailableVaccines([]);
    } finally {
      setIsLoadingVaccines(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setAppointmentData(prev => ({ ...prev, selectedDate: date, selectedTime: '' }));
    
    // Fetch available time slots for the selected date
    if (date) {
      fetchAvailableTimeSlots(date);
    } else {
      setAvailableTimeSlots([]);
    }
  };

  const handleTimeSelect = (time: string) => {
    setAppointmentData(prev => ({ ...prev, selectedTime: time }));
  };

  const handlePetCountChange = (count: number) => {
    setPetCount(count);
    const newPets: Pet[] = [];
    for (let i = 0; i < count; i++) {
      if (appointmentData.pets[i]) {
        newPets.push(appointmentData.pets[i]);
      } else {
        newPets.push({ id: i + 1, type: 'dog', breed: '', name: '' });
      }
    }
    setAppointmentData(prev => ({ ...prev, pets: newPets }));
  };

  const updatePet = (index: number, field: keyof Pet, value: string) => {
    const updatedPets = [...appointmentData.pets];
    if (field === 'type') {
      updatedPets[index] = { ...updatedPets[index], [field]: value as 'dog' | 'cat', breed: '' };
    } else {
      updatedPets[index] = { ...updatedPets[index], [field]: value };
    }
    setAppointmentData(prev => ({ ...prev, pets: updatedPets }));
  };

  const updatePetGrooming = (petIndex: number, category: string, size: string, price: number, isPackage: boolean) => {
    const updatedPets = [...appointmentData.pets];
    updatedPets[petIndex] = {
      ...updatedPets[petIndex],
      groomingDetails: { category, size, price, isPackage }
    };
    setAppointmentData(prev => ({ ...prev, pets: updatedPets }));
  };

  const handleGroomingModalOpen = (petIndex: number) => {
    setCurrentPetForGrooming(petIndex);
    setShowGroomingModal(true);
  };

  const handleGroomingModalClose = () => {
    setShowGroomingModal(false);
    
    // Check if there are more pets that need grooming configuration
    if (currentPetForGrooming !== null) {
      const nextPetIndex = appointmentData.pets.findIndex((pet, index) => 
        index > currentPetForGrooming && !pet.groomingDetails
      );
      
      if (nextPetIndex !== -1) {
        // Ask user if they want to configure grooming for the next pet
        setTimeout(() => {
          const nextPetName = appointmentData.pets[nextPetIndex].name || `Pet #${nextPetIndex + 1}`;
          showCustomConfirm(
            `Would you like to select grooming package for ${nextPetName}?`,
            () => {
              setCurrentPetForGrooming(nextPetIndex);
              setShowGroomingModal(true);
            }
          );
        }, 100);
      }
    }
    
    setCurrentPetForGrooming(null);
  };

  // Dental Care Functions
  const updatePetDentalCare = (petIndex: number, procedure: string, size: string, procedurePrice: number, anesthetic: string, anestheticPrice: number) => {
    const updatedPets = [...appointmentData.pets];
    updatedPets[petIndex] = {
      ...updatedPets[petIndex],
      dentalCareDetails: { procedure, size, procedurePrice, anesthetic, anestheticPrice, totalPrice: procedurePrice + anestheticPrice }
    };
    setAppointmentData(prev => ({ ...prev, pets: updatedPets }));
  };

  const handleDentalCareModalOpen = (petIndex: number) => {
    setCurrentPetForDentalCare(petIndex);
    setShowDentalCareModal(true);
    setSelectedDentalProcedure(null);
  };

  const handleDentalCareModalClose = () => {
    setShowDentalCareModal(false);
    setSelectedDentalProcedure(null);
    
    // Check if there are more pets that need dental care configuration
    if (currentPetForDentalCare !== null) {
      const nextPetIndex = appointmentData.pets.findIndex((pet, index) => 
        index > currentPetForDentalCare && !pet.dentalCareDetails
      );
      
      if (nextPetIndex !== -1) {
        // Ask user if they want to configure dental care for the next pet
        setTimeout(() => {
          const nextPetName = appointmentData.pets[nextPetIndex].name || `Pet #${nextPetIndex + 1}`;
          showCustomConfirm(
            `Would you like to select dental care procedure for ${nextPetName}?`,
            () => {
              setCurrentPetForDentalCare(nextPetIndex);
              setShowDentalCareModal(true);
            }
          );
        }, 100);
      }
    }
    
    setCurrentPetForDentalCare(null);
  };

  // Vaccination modal handlers
  const handleVaccinationModalOpen = (petIndex: number) => {
    setCurrentPetForVaccination(petIndex);
    
    // Load current pet's vaccine details if any
    const currentPet = appointmentData.pets[petIndex];
    setTempSelectedVaccines(currentPet.vaccineDetails || []);
    
    // Fetch available vaccines and show modal
    fetchAvailableVaccines();
    setShowVaccineModal(true);
  };

  const handleVaccinationModalClose = () => {
    setShowVaccineModal(false);
    setTempSelectedVaccines([]);
  };

  const handleVaccinationSave = () => {
    if (currentPetForVaccination !== null) {
      const updatedPets = [...appointmentData.pets];
      updatedPets[currentPetForVaccination] = {
        ...updatedPets[currentPetForVaccination],
        vaccineDetails: tempSelectedVaccines.length > 0 ? tempSelectedVaccines : undefined
      };
      
      setAppointmentData(prev => ({ ...prev, pets: updatedPets }));
      setShowVaccineModal(false);
      setTempSelectedVaccines([]);
      
      // Check if there are more pets without vaccination details
      const nextPetIndex = updatedPets.findIndex((pet, index) => 
        index > currentPetForVaccination! && !pet.vaccineDetails && appointmentData.services.includes('Vaccination')
      );
      
      if (nextPetIndex !== -1) {
        const nextPetName = updatedPets[nextPetIndex].name || `Pet #${nextPetIndex + 1}`;
        setTimeout(() => {
          showCustomConfirm(
            `Would you like to select vaccines for ${nextPetName}?`,
            () => {
              setCurrentPetForVaccination(nextPetIndex);
              setTempSelectedVaccines([]);
              setShowVaccineModal(true);
            }
          );
        }, 100);
      }
    }
    
    setCurrentPetForVaccination(null);
  };

  const handleServiceToggle = (service: string) => {
    const currentServices = appointmentData.services;
    
    if (service === 'Pet Grooming') {
      if (currentServices.includes(service)) {
        // Remove grooming service and clear all pet grooming details
        const updatedServices = currentServices.filter(s => s !== service);
        const updatedPets = appointmentData.pets.map(pet => ({
          ...pet,
          groomingDetails: undefined
        }));
        setAppointmentData(prev => ({ 
          ...prev, 
          services: updatedServices,
          pets: updatedPets
        }));
      } else {
        // Add grooming service and show modal for first pet
        const updatedServices = [...currentServices, service];
        setAppointmentData(prev => ({ ...prev, services: updatedServices }));
        
        // Show modal for first pet
        if (appointmentData.pets.length > 0) {
          handleGroomingModalOpen(0);
        }
      }
    } else if (service === 'Dental Care') {
      if (currentServices.includes(service)) {
        // Remove dental care service and clear all pet dental care details
        const updatedServices = currentServices.filter(s => s !== service);
        const updatedPets = appointmentData.pets.map(pet => ({
          ...pet,
          dentalCareDetails: undefined
        }));
        setAppointmentData(prev => ({ 
          ...prev, 
          services: updatedServices,
          pets: updatedPets
        }));
      } else {
        // Add dental care service and show modal for first pet
        const updatedServices = [...currentServices, service];
        setAppointmentData(prev => ({ ...prev, services: updatedServices }));
        
        // Show modal for first pet
        if (appointmentData.pets.length > 0) {
          handleDentalCareModalOpen(0);
        }
      }
    } else if (service === 'Vaccination') {
      if (currentServices.includes(service)) {
        // Remove vaccination service and clear all pet vaccine details
        const updatedServices = currentServices.filter(s => s !== service);
        const updatedPets = appointmentData.pets.map(pet => ({
          ...pet,
          vaccineDetails: undefined
        }));
        setAppointmentData(prev => ({ 
          ...prev, 
          services: updatedServices,
          pets: updatedPets
        }));
      } else {
        // Add vaccination service and show modal for first pet
        const updatedServices = [...currentServices, service];
        setAppointmentData(prev => ({ ...prev, services: updatedServices }));
        
        // Show modal for first pet
        if (appointmentData.pets.length > 0) {
          handleVaccinationModalOpen(0);
        }
      }
    } else {
      const updatedServices = currentServices.includes(service)
        ? currentServices.filter(s => s !== service)
        : [...currentServices, service];
      
      setAppointmentData(prev => ({ ...prev, services: updatedServices }));
    }
  };

  // Vaccine selection handlers (updated for per-pet system)
  const handleVaccineToggle = (vaccine: Vaccine) => {
    const isSelected = tempSelectedVaccines.some(v => v.id === vaccine.id);
    
    if (isSelected) {
      setTempSelectedVaccines(prev => prev.filter(v => v.id !== vaccine.id));
    } else {
      setTempSelectedVaccines(prev => [...prev, vaccine]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!appointmentData.selectedDate) {
      showNotification('Please select a date for your appointment.', 'error');
      return;
    }
    if (!appointmentData.selectedTime) {
      showNotification('Please select a time for your appointment.', 'error');
      return;
    }
    if (appointmentData.pets.some(pet => !pet.name.trim())) {
      showNotification('Please provide names for all pets.', 'error');
      return;
    }
    if (appointmentData.pets.some(pet => !pet.breed || (pet.breed === 'Other' && !pet.customBreed?.trim()))) {
      showNotification('Please specify the breed for all pets. If "Other" is selected, please provide the specific breed.', 'error');
      return;
    }
    // Removed mandatory grooming/dental care validation - services are now optional per pet
    if (appointmentData.services.length === 0) {
      showNotification('Please select at least one service.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Please login to book an appointment.', 'error');
        navigate('/login?redirect=set-appointment');
        return;
      }

      // Format the data for the API
      const appointmentPayload = {
        appointment_date: (() => {
          // Format date without timezone conversion to prevent day shifting
          const year = appointmentData.selectedDate.getFullYear();
          const month = String(appointmentData.selectedDate.getMonth() + 1).padStart(2, '0');
          const day = String(appointmentData.selectedDate.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`; // Format as YYYY-MM-DD
        })(),
        appointment_time: appointmentData.selectedTime,
        pets: appointmentData.pets.map(pet => {
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
            dentalCareDetails: formattedDentalCareDetails,
            vaccineDetails: pet.vaccineDetails || null
          };
        }),
        services: appointmentData.services,
        notes: '' // You can add notes field to the form if needed
      };

      const response = await fetch(apiUrl.appointments(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(appointmentPayload)
      });

      // Handle different HTTP status codes
      if (!response.ok) {
        if (response.status === 401) {
          showNotification('Your session has expired. Please log in again.', 'error');
          navigate('/login?redirect=set-appointment');
          return;
        } else if (response.status === 403) {
          showNotification('You do not have permission to perform this action.', 'error');
          return;
        } else if (response.status === 404) {
          showNotification('Service not found. Please refresh the page and try again.', 'error');
          return;
        } else if (response.status >= 500) {
          showNotification('Server error. Please try again later or contact support.', 'error');
          return;
        }
      }

      const data = await response.json();

      if (data.status) {
        // Reset form
        setAppointmentData({
          selectedDate: undefined,
          selectedTime: '',
          pets: [],
          services: []
        });
        setPetCount(1);
        setAvailableTimeSlots([]); // Clear available slots
        
        // Navigate to My Appointments page
        navigate('/my-appointments');
        
        // Show success notification after a brief delay to ensure navigation completes
        setTimeout(() => {
          showNotification('Appointment scheduled successfully! 🎉', 'success', 6000);
        }, 100);
      } else {
        // Handle specific error types
        if (data.error_type === 'slot_full') {
          // Handle fully booked slot
          showNotification(
            `This time slot is fully booked (${data.available_slots}/${data.max_slots} appointments). Please select a different time.`,
            'error',
            8000
          );
          
          // Refresh available slots for the selected date
          if (appointmentData.selectedDate) {
            fetchAvailableTimeSlots(appointmentData.selectedDate);
          }
          
          // Clear selected time
          setAppointmentData(prev => ({ ...prev, selectedTime: '' }));
          
          return;
        }
        
        // Handle validation errors
        if (data.errors) {
          // Show specific validation error messages
          const errorMessages: string[] = [];
          
          // Extract and format validation error messages
          Object.entries(data.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach(message => {
                // Format field names for better user understanding
                const friendlyFieldName = field
                  .replace('appointment_date', 'Appointment Date')
                  .replace('appointment_time', 'Appointment Time')
                  .replace('pets.', 'Pet ')
                  .replace('.name', ' Name')
                  .replace('.breed', ' Breed')
                  .replace('.type', ' Type')
                  .replace('.groomingDetails', ' Grooming Details')
                  .replace('services', 'Services');
                
                errorMessages.push(`${friendlyFieldName}: ${message}`);
              });
            }
          });
          
          // Show each error as a separate notification
          errorMessages.forEach((errorMessage, index) => {
            setTimeout(() => {
              showNotification(errorMessage, 'error', 8000);
            }, index * 1000); // Stagger notifications by 1 second
          });
          
          // Also show a general error message
          setTimeout(() => {
            showNotification(data.message || 'Please fix the validation errors above.', 'warning', 6000);
          }, errorMessages.length * 1000);
          
          console.error('Validation errors:', data.errors);
        } else {
          // Show general error message
          showNotification(data.message || 'Failed to schedule appointment. Please try again.', 'error');
        }
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      
      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        showNotification('Unable to connect to the server. Please check your internet connection and try again.', 'error', 8000);
      } else if (error instanceof SyntaxError) {
        showNotification('Server response error. Please try again or contact support.', 'error', 8000);
      } else {
        showNotification('An unexpected error occurred while scheduling your appointment. Please try again.', 'error', 8000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      window.location.href = '/login?redirect=set-appointment';
    }
  }, [])

  // Initialize pets array when component mounts
  useEffect(() => {
    if (appointmentData.pets.length === 0) {
      handlePetCountChange(petCount);
    }
  }, [])

  return (
    <>
    <Header />

    <img src={bg_appointment} alt="Appointment Background" className="fixed inset-0 object-cover w-full h-full -z-10" />

    <div className="min-h-screen bg-transparent py-8 mt-[56px]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-teal-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Schedule an Appointment</h1>
            <p className="text-teal-100 mt-1">Book a visit to our veterinary clinic</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Date Selection */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Date</h2>
              <p className="text-sm text-gray-600 mb-3">
                Appointments must be scheduled at least 1 day in advance. Same-day appointments are not available.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <DayPicker
                  mode="single"
                  selected={appointmentData.selectedDate}
                  onSelect={handleDateSelect}
                  disabled={disabledDays}
                  className="rdp-custom"
                  modifiersStyles={{
                    selected: { backgroundColor: '#0d9488', color: 'white' }
                  }}
                />
                {appointmentData.selectedDate && (
                  <p className="mt-3 text-sm text-gray-600">
                    <strong>Selected Date:</strong> {appointmentData.selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Time</h2>
              <p className="text-sm text-gray-600 mb-3">
                Clinic hours: 8:00 AM - 5:00 PM (Appointments available until 3:00 PM)
                {appointmentData.selectedDate && (
                  <span className="block mt-1 text-teal-600">
                    Showing availability for {appointmentData.selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                )}
              </p>
              
              {isLoadingTimeSlots && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mr-2"></div>
                    <span className="text-gray-600">Loading available time slots...</span>
                  </div>
                </div>
              )}
              
              {!appointmentData.selectedDate && (
                <div className="text-center py-8 text-gray-500">
                  <p>Please select a date first to view available time slots</p>
                </div>
              )}
              
              {appointmentData.selectedDate && !isLoadingTimeSlots && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {availableTimeSlots.length > 0 ? (
                    availableTimeSlots.map((slot) => (
                      <div key={slot.time} className="relative">
                        <button
                          type="button"
                          onClick={() => slot.available ? handleTimeSelect(slot.time) : null}
                          disabled={!slot.available}
                          className={`w-full px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                            appointmentData.selectedTime === slot.time
                              ? 'bg-teal-600 text-white border-teal-600'
                              : slot.available
                              ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          }`}
                        >
                          {slot.time}
                        </button>
                        
                        {/* Show remaining slots info */}
                        {slot.available && slot.remaining_slots <= 2 && (
                          <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {slot.remaining_slots}
                          </div>
                        )}
                        
                        {/* Show fully booked indicator */}
                        {!slot.available && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                            ✕
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    // Fallback to default time slots if API fails
                    timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => handleTimeSelect(time)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          appointmentData.selectedTime === time
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {time}
                      </button>
                    ))
                  )}
                </div>
              )}
              
              {/* Legend */}
              {appointmentData.selectedDate && !isLoadingTimeSlots && availableTimeSlots.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-teal-600 rounded mr-2"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-white border border-gray-300 rounded mr-2"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-500 rounded mr-2"></div>
                    <span>Limited slots (number shows remaining)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-100 rounded mr-2"></div>
                    <span>Fully booked</span>
                  </div>
                </div>
              )}
            </div>

            {/* Pet Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Pet Details</h2>
              
              {/* Number of Pets */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Pets
                </label>
                <select
                  value={petCount}
                  onChange={(e) => handlePetCountChange(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              {/* Pet Details Forms */}
              <div className="space-y-4">
                {appointmentData.pets.map((pet, index) => (
                  <div key={pet.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-3">Pet #{index + 1}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Pet Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pet Name
                        </label>
                        <input
                          type="text"
                          value={pet.name}
                          onChange={(e) => updatePet(index, 'name', e.target.value)}
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
                          onChange={(e) => updatePet(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                          <option value="dog">Dog</option>
                          <option value="cat">Cat</option>
                        </select>
                      </div>

                      {/* Breed */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Breed
                        </label>
                        <select
                          value={pet.breed}
                          onChange={(e) => updatePet(index, 'breed', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          required
                        >
                          <option value="">Select a breed</option>
                          {(pet.type === 'dog' ? dogBreeds : catBreeds).map(breed => (
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
                              onChange={(e) => updatePet(index, 'customBreed', e.target.value)}
                              placeholder="Enter the specific breed"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              required
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Grooming Details - Show when Pet Grooming is selected */}
                    {appointmentData.services.includes('Pet Grooming') && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700">
                              Pet Grooming Details for {pet.name || `Pet #${index + 1}`}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">Optional - You can skip grooming for individual pets</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleGroomingModalOpen(index)}
                            className="text-sm bg-teal-100 text-teal-700 px-3 py-1 rounded-full hover:bg-teal-200 transition-colors"
                          >
                            {pet.groomingDetails ? 'Edit Package' : 'Select Package'}
                          </button>
                        </div>
                        
                        {pet.groomingDetails && (
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
                            <button
                              type="button"
                              onClick={() => {
                                const updatedPets = [...appointmentData.pets];
                                updatedPets[index].groomingDetails = undefined;
                                setAppointmentData(prev => ({ ...prev, pets: updatedPets }));
                              }}
                              className="mt-2 text-xs text-red-600 hover:text-red-800 transition-colors"
                            >
                              Remove Grooming Service
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dental Care Configuration */}
                    {appointmentData.services.includes('Dental Care') && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700">
                              Dental Care Details for {pet.name || `Pet #${index + 1}`}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">Optional - You can skip dental care for individual pets</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDentalCareModalOpen(index)}
                            className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                          >
                            {pet.dentalCareDetails ? 'Edit Procedure' : 'Select Procedure'}
                          </button>
                        </div>
                        
                        {pet.dentalCareDetails && (
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
                            <button
                              type="button"
                              onClick={() => {
                                const updatedPets = [...appointmentData.pets];
                                updatedPets[index].dentalCareDetails = undefined;
                                setAppointmentData(prev => ({ ...prev, pets: updatedPets }));
                              }}
                              className="mt-2 text-xs text-red-600 hover:text-red-800 transition-colors"
                            >
                              Remove Dental Care Service
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Vaccination Management */}
                    {appointmentData.services.includes('Vaccination') && (
                      <div className="mt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700">
                              Vaccination Details for {pet.name || `Pet #${index + 1}`}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">Optional - You can skip vaccination for individual pets</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleVaccinationModalOpen(index)}
                            className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                          >
                            {pet.vaccineDetails && pet.vaccineDetails.length > 0 ? 'Edit Vaccines' : 'Select Vaccines'}
                          </button>
                        </div>
                        
                        {pet.vaccineDetails && pet.vaccineDetails.length > 0 && (
                          <div className="bg-green-50 p-3 rounded-lg mt-2">
                            <div className="text-sm mb-2">
                              <span className="font-medium text-green-600">Selected Vaccines:</span>
                            </div>
                            <div className="space-y-1">
                              {pet.vaccineDetails.map((vaccine, vIndex) => (
                                <div key={vIndex} className="flex justify-between items-center text-sm">
                                  <span className="text-gray-700">{vaccine.name}</span>
                                  <span className="text-green-600 font-medium">₱{vaccine.price.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="pt-2 border-t border-green-200 mt-2">
                              <div className="flex justify-between items-center text-sm font-medium">
                                <span className="text-gray-700">Total:</span>
                                <span className="text-green-600">
                                  ₱{pet.vaccineDetails.reduce((total, vaccine) => total + vaccine.price, 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedPets = [...appointmentData.pets];
                                updatedPets[index].vaccineDetails = undefined;
                                setAppointmentData(prev => ({ ...prev, pets: updatedPets }));
                              }}
                              className="mt-2 text-xs text-red-600 hover:text-red-800 transition-colors"
                            >
                              Remove Vaccines
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Services Selection */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Services</h2>
              <p className="text-sm text-gray-600 mb-3">Choose one or more services (you can select multiple)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableServices.map((service) => (
                  <label
                    key={service}
                    className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={appointmentData.services.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-gray-700 font-medium">{service}</span>
                    {service === 'Vaccination' && appointmentData.services.includes(service) && appointmentData.pets.some(pet => pet.vaccineDetails && pet.vaccineDetails.length > 0) && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {appointmentData.pets.reduce((total, pet) => total + (pet.vaccineDetails?.length || 0), 0)} vaccine{appointmentData.pets.reduce((total, pet) => total + (pet.vaccineDetails?.length || 0), 0) !== 1 ? 's' : ''} selected
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Grooming Cost Summary */}
            {appointmentData.services.includes('Pet Grooming') && appointmentData.pets.some(pet => pet.groomingDetails) && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3">Grooming Services Summary</h3>
                {appointmentData.pets.map((pet, index) => {
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
                      ₱{appointmentData.pets.reduce((total, pet) => {
                        return total + (pet.groomingDetails?.price || 0);
                      }, 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Dental Care Cost Summary */}
            {appointmentData.services.includes('Dental Care') && appointmentData.pets.some(pet => pet.dentalCareDetails) && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-800 mb-3">Dental Care Services Summary</h3>
                {appointmentData.pets.map((pet, index) => {
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
                      ₱{appointmentData.pets.reduce((total, pet) => {
                        return total + (pet.dentalCareDetails?.totalPrice || 0);
                      }, 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Requested Vaccines Summary */}
            {appointmentData.services.includes('Vaccination') && appointmentData.pets.some(pet => pet.vaccineDetails && pet.vaccineDetails.length > 0) && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-gray-800 mb-3">Requested Vaccines by Pet</h3>
                <p className="text-sm text-green-700 mb-3">
                  These vaccines are requested for your pets. Final selection and billing will be handled by the veterinarian.
                </p>
                {appointmentData.pets.map((pet, index) => {
                  if (!pet.vaccineDetails || pet.vaccineDetails.length === 0) return null;
                  
                  return (
                    <div key={index} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-700">
                          {pet.name || `Pet #${index + 1}`}
                        </span>
                        <span className="text-green-600 font-semibold">
                          ₱{pet.vaccineDetails.reduce((total, vaccine) => total + vaccine.price, 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="ml-4 space-y-1">
                        {pet.vaccineDetails.map((vaccine, vIndex) => (
                          <div key={vIndex} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{vaccine.name}</span>
                            <span className="text-green-600">₱{vaccine.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div className="pt-3 border-t border-green-300 mt-3">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-gray-800">Total Estimated Vaccine Cost:</span>
                    <span className="text-green-600">
                      ₱{appointmentData.pets.reduce((total, pet) => 
                        total + (pet.vaccineDetails?.reduce((petTotal, vaccine) => petTotal + vaccine.price, 0) || 0), 0
                      ).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    * This is an estimate. Actual cost may vary based on veterinarian's assessment.
                  </p>
                </div>
              </div>
            )}

            {/* Grand Total Summary */}
            {(appointmentData.services.includes('Pet Grooming') && appointmentData.pets.some(pet => pet.groomingDetails)) || 
             (appointmentData.services.includes('Dental Care') && appointmentData.pets.some(pet => pet.dentalCareDetails)) && (
              <div className="bg-gray-100 p-4 rounded-lg border-2 border-gray-300">
                <h3 className="font-semibold text-gray-800 mb-3">Appointment Summary</h3>
                
                {/* Services Base Cost */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Services Total:</span>
                    <span className="font-medium">₱0</span>
                  </div>
                  
                  {appointmentData.services.includes('Pet Grooming') && appointmentData.pets.some(pet => pet.groomingDetails) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grooming Total:</span>
                      <span className="font-medium text-teal-600">
                        ₱{appointmentData.pets.reduce((total, pet) => {
                          return total + (pet.groomingDetails?.price || 0);
                        }, 0)}
                      </span>
                    </div>
                  )}
                  
                  {appointmentData.services.includes('Dental Care') && appointmentData.pets.some(pet => pet.dentalCareDetails) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dental Care Total:</span>
                      <span className="font-medium text-blue-600">
                        ₱{appointmentData.pets.reduce((total, pet) => {
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
                      ₱{appointmentData.pets.reduce((total, pet) => {
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
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                  isLoading 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                {isLoading ? 'Scheduling Appointment...' : 'Schedule Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    {/* Grooming Selection Modal */}
    {showGroomingModal && currentPetForGrooming !== null && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Select Grooming Package for {appointmentData.pets[currentPetForGrooming]?.name || `Pet #${currentPetForGrooming + 1}`}
              </h3>
              <button
                onClick={handleGroomingModalClose}
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
                              updatePetGrooming(currentPetForGrooming, packageName, size, price, true);
                              handleGroomingModalClose();
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
                              updatePetGrooming(currentPetForGrooming, serviceName, size, price, false);
                              handleGroomingModalClose();
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
                onClick={handleGroomingModalClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Dental Care Selection Modal */}
    {showDentalCareModal && currentPetForDentalCare !== null && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Select Dental Procedure for {appointmentData.pets[currentPetForDentalCare]?.name || `Pet #${currentPetForDentalCare + 1}`}
              </h3>
              <button
                onClick={handleDentalCareModalClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {!selectedDentalProcedure ? (
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
                            onClick={() => setSelectedDentalProcedure({procedure: procedureName, size, price})}
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
                    <span className="text-blue-700">{selectedDentalProcedure.procedure} ({selectedDentalProcedure.size})</span>
                    <span className="font-semibold text-blue-600">
                      {selectedDentalProcedure.price === 0 ? 'Free' : `₱${selectedDentalProcedure.price}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDentalProcedure(null)}
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
                              updatePetDentalCare(
                                currentPetForDentalCare,
                                selectedDentalProcedure.procedure,
                                selectedDentalProcedure.size,
                                selectedDentalProcedure.price,
                                anestheticType,
                                price
                              );
                              handleDentalCareModalClose();
                            }}
                            className="p-3 border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors text-center"
                          >
                            <div className="font-medium text-gray-800">{size}</div>
                            <div className="text-green-600 font-semibold">₱{price}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Total: ₱{selectedDentalProcedure.price + price}
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
                {!selectedDentalProcedure ? 
                  'Select a dental procedure to continue' : 
                  'Select an anesthetic type to complete the configuration'
                }
              </p>
              <button
                onClick={handleDentalCareModalClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Custom Confirmation Modal */}
    {showConfirmModal && confirmModalData && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Confirmation
              </h3>
              <p className="text-gray-600 mb-6">
                {confirmModalData.message}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    confirmModalData.onCancel();
                    handleConfirmModalClose();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  No
                </button>
                <button
                  onClick={() => {
                    confirmModalData.onConfirm();
                    handleConfirmModalClose();
                  }}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Vaccine Selection Modal */}
    {showVaccineModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Vaccines
              </h3>
              <button
                onClick={handleVaccinationModalClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Select vaccines that you would like to request for your pet(s). These will be noted as requested vaccines for staff to review.
            </p>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 min-h-0">
            {isLoadingVaccines ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading available vaccines...</p>
              </div>
            ) : availableVaccines.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No vaccines available</h4>
                <p className="text-gray-600">
                  There are currently no vaccines in stock or the Vaccines category doesn't exist.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableVaccines.map((vaccine) => {
                  const isSelected = tempSelectedVaccines.some(v => v.id === vaccine.id);
                  return (
                    <div
                      key={vaccine.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-teal-500 bg-teal-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleVaccineToggle(vaccine)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected 
                                ? 'border-teal-500 bg-teal-500' 
                                : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{vaccine.name}</h4>
                              {vaccine.description && (
                                <p className="text-sm text-gray-600 mt-1">{vaccine.description}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="text-teal-600 font-medium">₱{vaccine.price.toFixed(2)}</span>
                                <span className="text-gray-500">Stock: {vaccine.quantity}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {tempSelectedVaccines.length} vaccine(s) selected
                {tempSelectedVaccines.length > 0 && (
                  <span className="ml-2 font-medium">
                    (Total: ₱{tempSelectedVaccines.reduce((sum, v) => sum + v.price, 0).toFixed(2)})
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleVaccinationModalClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVaccinationSave}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Confirm Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default SetAppointment;