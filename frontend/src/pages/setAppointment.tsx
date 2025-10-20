import React, { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import Header from '../components/header';

import bg_appointment from '../assets/home/bg_appointment.jpg';

interface Pet {
  id: number;
  type: 'dog' | 'cat';
  breed: string;
}

interface AppointmentData {
  selectedDate: Date | undefined;
  selectedTime: string;
  pets: Pet[];
  services: string[];
}

const SetAppointment: React.FC = () => {
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

  // Disable Sundays and past dates
  const disabledDays = [
    { before: new Date() }, // Past dates
    { dayOfWeek: [0] } // Sundays (0 = Sunday)
  ];

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
        newPets.push({ id: i + 1, type: 'dog', breed: '' });
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

  const handleServiceToggle = (service: string) => {
    const currentServices = appointmentData.services;
    const updatedServices = currentServices.includes(service)
      ? currentServices.filter(s => s !== service)
      : [...currentServices, service];
    
    setAppointmentData(prev => ({ ...prev, services: updatedServices }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!appointmentData.selectedDate) {
      alert('Please select a date for your appointment.');
      return;
    }
    if (!appointmentData.selectedTime) {
      alert('Please select a time for your appointment.');
      return;
    }
    if (appointmentData.pets.some(pet => !pet.breed)) {
      alert('Please specify the breed for all pets.');
      return;
    }
    if (appointmentData.services.length === 0) {
      alert('Please select at least one service.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to book an appointment.');
        window.location.href = '/login?redirect=set-appointment';
        return;
      }

      // Format the data for the API
      const appointmentPayload = {
        appointment_date: appointmentData.selectedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        appointment_time: appointmentData.selectedTime,
        pets: appointmentData.pets.map(pet => ({
          type: pet.type,
          breed: pet.breed
        })),
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

      const data = await response.json();

      if (data.status) {
        alert('Appointment scheduled successfully!');
        // Reset form
        setAppointmentData({
          selectedDate: undefined,
          selectedTime: '',
          pets: [],
          services: []
        });
        setPetCount(1);
        // Optionally redirect to appointments list page
        // window.location.href = '/appointments';
      } else {
        alert(data.message || 'Failed to schedule appointment. Please try again.');
        if (data.errors) {
          console.error('Validation errors:', data.errors);
        }
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('An error occurred while scheduling your appointment. Please try again.');
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </>
  );
};

export default SetAppointment;