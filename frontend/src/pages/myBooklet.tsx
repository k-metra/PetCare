import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/notificationContext';
import { apiUrl } from '../utils/apiConfig';
import { FaBook, FaSyringe, FaCalendarAlt, FaUserMd, FaClipboardList, FaSpinner, FaPaw } from 'react-icons/fa';

interface VaccinationRecord {
  id: number;
  given_date: string;
  vaccine_name: string;
  veterinarian: string;
  diagnosis: string | null;
  appointment_id: number | null;
}

interface PetVaccinationData {
  pet_id: number;
  pet_name: string;
  pet_type: string;
  pet_breed: string;
  vaccination_records: VaccinationRecord[];
}

const MyBooklet: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [vaccinationData, setVaccinationData] = useState<PetVaccinationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState<number | null>(null);

  useEffect(() => {
    fetchVaccinationRecords();
  }, []);

  const fetchVaccinationRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(apiUrl.vaccinationRecords(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.status) {
        // Backend now handles pet merging, so use data directly
        setVaccinationData(data.vaccination_records);
        if (data.vaccination_records.length > 0) {
          setSelectedPet(data.vaccination_records[0].pet_id);
        }
      } else {
        showNotification(data.message || 'Failed to fetch vaccination records', 'error');
      }
    } catch (error) {
      console.error('Error fetching vaccination records:', error);
      showNotification('An error occurred while fetching vaccination records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPetTypeIcon = (type: string) => {
    return type.toLowerCase() === 'dog' ? '🐕' : '🐱';
  };

  const selectedPetData = vaccinationData.find(pet => pet.pet_id === selectedPet);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <FaSpinner className="animate-spin text-4xl text-teal-600" />
            <span className="ml-3 text-lg text-gray-600">Loading vaccination records...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-teal-100 p-3 rounded-full">
                <FaBook className="text-teal-600 text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Pet Vaccination Booklet</h1>
                <p className="text-gray-600">Track your pets' vaccination history and medical records</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/my-appointments')}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              My Appointments
            </button>
          </div>
        </div>

        {vaccinationData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FaPaw className="text-gray-400 text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Vaccination Records Found</h2>
            <p className="text-gray-600 mb-4">
              You don't have any vaccination records yet. Records will appear here after your pets receive vaccinations.
            </p>
            <button
              onClick={() => navigate('/set-appointment')}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Schedule an Appointment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pet Selection Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Pets</h2>
                <div className="space-y-3">
                  {vaccinationData.map((pet) => (
                    <button
                      key={pet.pet_id}
                      onClick={() => setSelectedPet(pet.pet_id)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        selectedPet === pet.pet_id
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getPetTypeIcon(pet.pet_type)}</span>
                        <div>
                          <h3 className="font-medium text-gray-900">{pet.pet_name}</h3>
                          <p className="text-sm text-gray-600">{pet.pet_breed} • {pet.pet_type}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {pet.vaccination_records.length} vaccination{pet.vaccination_records.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Vaccination Records */}
            <div className="lg:col-span-2">
              {selectedPetData && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="text-3xl">{getPetTypeIcon(selectedPetData.pet_type)}</span>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedPetData.pet_name}</h2>
                      <p className="text-gray-600">{selectedPetData.pet_breed} • {selectedPetData.pet_type}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedPetData.vaccination_records.map((record) => (
                      <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <FaSyringe className="text-teal-600" />
                              <div>
                                <p className="text-sm text-gray-600">Vaccine</p>
                                <p className="font-medium text-gray-900">{record.vaccine_name}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <FaCalendarAlt className="text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-600">Date Given</p>
                                <p className="font-medium text-gray-900">{formatDate(record.given_date)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <FaUserMd className="text-green-600" />
                              <div>
                                <p className="text-sm text-gray-600">Veterinarian</p>
                                <p className="font-medium text-gray-900">{record.veterinarian}</p>
                              </div>
                            </div>

                            {record.diagnosis && (
                              <div className="flex items-start space-x-2">
                                <FaClipboardList className="text-purple-600 mt-1" />
                                <div>
                                  <p className="text-sm text-gray-600">Diagnosis/Notes</p>
                                  <p className="font-medium text-gray-900">{record.diagnosis}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {record.appointment_id && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                              Related to Appointment #{record.appointment_id}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedPetData.vaccination_records.length === 0 && (
                    <div className="text-center py-8">
                      <FaSyringe className="text-gray-400 text-3xl mx-auto mb-3" />
                      <p className="text-gray-600">No vaccination records found for {selectedPetData.pet_name}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBooklet;