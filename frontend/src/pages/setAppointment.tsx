import React, { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header';
import { useNotification } from '../contexts/notificationContext';

import bg_appointment from '../assets/home/bg_appointment.jpg';

interface Pet {
  id: number;
  type: 'dog' | 'cat';
  breed: string;
  name: string;
  groomingDetails?: {
    category: string;
    size: string;
    price: number;
    isPackage: boolean;
  };
}

interface AppointmentData {
  selectedDate: Date | undefined;
  selectedTime: string;
  pets: Pet[];
  services: string[];
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

  const handleDateSelect = (date: Date | undefined) => {
    setAppointmentData(prev => ({ ...prev, selectedDate: date }));
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
    } else {
      const updatedServices = currentServices.includes(service)
        ? currentServices.filter(s => s !== service)
        : [...currentServices, service];
      
      setAppointmentData(prev => ({ ...prev, services: updatedServices }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!appointmentData.selectedDate) {
      showNotification('Please select a date for your appointment.', 'error');
      return;
    }
    
    // Check if selected date is tomorrow or later
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const selectedDateTime = new Date(appointmentData.selectedDate);
    selectedDateTime.setHours(0, 0, 0, 0);
    
    if (selectedDateTime < tomorrow) {
      showNotification('Please select a date starting from tomorrow. Same-day appointments are not available.', 'error');
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
    if (appointmentData.pets.some(pet => !pet.breed)) {
      showNotification('Please specify the breed for all pets.', 'error');
      return;
    }
    if (appointmentData.services.includes('Pet Grooming') && appointmentData.pets.some(pet => !pet.groomingDetails)) {
      showNotification('Please select grooming packages for all pets when Pet Grooming service is selected.', 'error');
      return;
    }
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
        appointment_date: appointmentData.selectedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
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
          
          return {
            type: pet.type,
            breed: pet.breed,
            name: pet.name,
            groomingDetails: formattedGroomingDetails
          };
        }),
        services: appointmentData.services,
        notes: '' // You can add notes field to the form if needed
      };

      const response = await fetch('http://127.0.0.1:8000/api/appointments', {
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
        
        // Navigate to My Appointments page
        navigate('/my-appointments');
        
        // Show success notification after a brief delay to ensure navigation completes
        setTimeout(() => {
          showNotification('Appointment scheduled successfully! 🎉', 'success', 6000);
        }, 100);
      } else {
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
              <p className="text-sm text-gray-600 mb-3">Clinic hours: 8:00 AM - 5:00 PM (Appointments available until 3:00 PM)</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {timeSlots.map((time) => (
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
                ))}
              </div>
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
                      </div>
                    </div>

                    {/* Grooming Details - Show when Pet Grooming is selected */}
                    {appointmentData.services.includes('Pet Grooming') && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-700">
                            Pet Grooming Details for {pet.name || `Pet #${index + 1}`}
                          </h4>
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
                      {Object.entries(sizes).map(([size, price]) => (
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
                          <div className="text-teal-600 font-semibold">₱{price}</div>
                        </button>
                      ))}
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
                      {Object.entries(sizes).map(([size, price]) => (
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
                          <div className="text-blue-600 font-semibold">₱{price}</div>
                        </button>
                      ))}
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
    </>
  );
};

export default SetAppointment;