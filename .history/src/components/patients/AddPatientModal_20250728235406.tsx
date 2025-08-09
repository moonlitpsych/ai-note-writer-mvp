// src/components/patients/AddPatientModal.tsx - COMPLETE PROFESSIONAL VERSION
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { patientService } from '@/lib/firebase/patient-service';
import { CreatePatientRequest } from '@/lib/types/patient';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onPatientAdded: () => void;
}

interface FormData {
    name: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other' | '';
    email: string;
    phone: string;
    address: string;
    emergencyContact: string;
    emergencyPhone: string;
    insurance: string;
    allergies: string;
    currentMedications: string;
    medicalHistory: string;
}

interface FormErrors {
    [key: string]: string;
}

function AddPatientModal({ isOpen, onClose, onPatientAdded }: Props) {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [showHIPAANotice, setShowHIPAANotice] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        name: '',
        dateOfBirth: '',
        gender: '',
        email: '',
        phone: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        insurance: '',
        allergies: '',
        currentMedications: '',
        medicalHistory: ''
    });

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Required fields
        if (!formData.name.trim()) {
            newErrors.name = 'Patient name is required';
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Date of birth is required';
        } else {
            const dob = new Date(formData.dateOfBirth);
            const today = new Date();
            if (dob > today) {
                newErrors.dateOfBirth = 'Date of birth cannot be in the future';
            }
            if (dob.getFullYear() < 1900) {
                newErrors.dateOfBirth = 'Please enter a valid date of birth';
            }
        }

        if (!formData.gender) {
            newErrors.gender = 'Gender is required';
        }

        // Email validation (if provided)
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Phone validation (if provided)
        if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (formData.emergencyPhone && !/^\+?[\d\s\-\(\)]+$/.test(formData.emergencyPhone)) {
            newErrors.emergencyPhone = 'Please enter a valid emergency contact phone';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const generateMRN = (): string => {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `MRN${timestamp.slice(-6)}${random}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !user) return;

        setIsSubmitting(true);

        try {
            const patientData: CreatePatientRequest = {
                name: formData.name.trim(),
                mrn: generateMRN(),
                dateOfBirth: new Date(formData.dateOfBirth),
                gender: formData.gender as 'male' | 'female' | 'other',
                email: formData.email.trim() || undefined,
                phone: formData.phone.trim() || undefined,
                address: formData.address.trim() || undefined,
                emergencyContact: formData.emergencyContact.trim() || undefined,
                emergencyPhone: formData.emergencyPhone.trim() || undefined,
                insurance: formData.insurance.trim() || undefined,
                allergies: formData.allergies.trim() || undefined,
                currentMedications: formData.currentMedications.trim() || undefined,
                medicalHistory: formData.medicalHistory.trim() || undefined,
                status: 'active'
            };

            await patientService.createPatient(user.uid, patientData);

            // Reset form
            setFormData({
                name: '',
                dateOfBirth: '',
                gender: '',
                email: '',
                phone: '',
                address: '',
                emergencyContact: '',
                emergencyPhone: '',
                insurance: '',
                allergies: '',
                currentMedications: '',
                medicalHistory: ''
            });

            setShowHIPAANotice(false);
            onPatientAdded();
        } catch (error) {
            console.error('Failed to create patient:', error);
            setErrors({ submit: 'Failed to create patient. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({
                name: '',
                dateOfBirth: '',
                gender: '',
                email: '',
                phone: '',
                address: '',
                emergencyContact: '',
                emergencyPhone: '',
                insurance: '',
                allergies: '',
                currentMedications: '',
                medicalHistory: ''
            });
            setErrors({});
            setShowHIPAANotice(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={handleClose}
                />

                {/* Modal */}
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Add New Patient</h3>
                        <button
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* HIPAA Notice */}
                    {!showHIPAANotice && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start">
                                <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                                <div>
                                    <h4 className="text-sm font-medium text-blue-900">HIPAA Privacy Notice</h4>
                                    <p className="text-sm text-blue-800 mt-1">
                                        This system stores protected health information (PHI). All data is encrypted
                                        and access is logged for security compliance.
                                    </p>
                                    <button
                                        onClick={() => setShowHIPAANotice(true)}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2"
                                    >
                                        I understand and acknowledge →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    {showHIPAANotice && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {errors.submit && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                    <div className="flex">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                                        <div className="ml-3">
                                            <p className="text-sm text-red-800">{errors.submit}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter patient's full name"
                                        disabled={isSubmitting}
                                    />
                                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date of Birth *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        disabled={isSubmitting}
                                    />
                                    {errors.dateOfBirth && <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gender *
                                    </label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => handleInputChange('gender', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.gender ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.gender && <p className="text-sm text-red-600 mt-1">{errors.gender}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="patient@example.com"
                                        disabled={isSubmitting}
                                    />
                                    {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="(555) 123-4567"
                                        disabled={isSubmitting}
                                    />
                                    {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Insurance
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.insurance}
                                        onChange={(e) => handleInputChange('insurance', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Insurance provider"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Street address, city, state, zip"
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Emergency Contact */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Emergency Contact
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.emergencyContact}
                                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Contact name"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Emergency Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.emergencyPhone}
                                        onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.emergencyPhone ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="(555) 123-4567"
                                        disabled={isSubmitting}
                                    />
                                    {errors.emergencyPhone && <p className="text-sm text-red-600 mt-1">{errors.emergencyPhone}</p>}
                                </div>
                            </div>

                            {/* Medical Information */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Known Allergies
                                    </label>
                                    <textarea
                                        value={formData.allergies}
                                        onChange={(e) => handleInputChange('allergies', e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="List any known allergies (medications, foods, environmental)"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Medications
                                    </label>
                                    <textarea
                                        value={formData.currentMedications}
                                        onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="List current medications and dosages"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Medical History
                                    </label>
                                    <textarea
                                        value={formData.medicalHistory}
                                        onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Relevant medical history, past diagnoses, surgeries, etc."
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 flex items-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Creating Patient...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                                            Create Patient
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AddPatientModal;