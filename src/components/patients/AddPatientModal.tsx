// src/components/patients/AddPatientModal.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { patientService } from '@/lib/firebase/patient-service';
import { CreatePatientRequest } from '@/lib/types/patient';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AddPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPatientAdded: () => void;
}

export default function AddPatientModal({ isOpen, onClose, onPatientAdded }: AddPatientModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        mrn: '',
        dob: '',
        gender: '' as '' | 'male' | 'female' | 'other' | 'prefer-not-to-say'
    });

    // Form validation
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Name is required
        if (!formData.name.trim()) {
            newErrors.name = 'Patient name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Patient name must be at least 2 characters';
        }

        // MRN validation (optional, but if provided should be reasonable)
        if (formData.mrn.trim() && formData.mrn.trim().length < 3) {
            newErrors.mrn = 'MRN must be at least 3 characters if provided';
        }

        // DOB validation (optional, but if provided should be valid date)
        if (formData.dob) {
            const dobDate = new Date(formData.dob);
            const today = new Date();
            const earliestDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());

            if (dobDate > today) {
                newErrors.dob = 'Date of birth cannot be in the future';
            } else if (dobDate < earliestDate) {
                newErrors.dob = 'Date of birth cannot be more than 120 years ago';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setError('User not authenticated');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Build patient data object conditionally - only include fields with values
            const patientData: CreatePatientRequest = {
                name: formData.name.trim(), // Required field
            };

            // Only add optional fields if they have values
            if (formData.mrn.trim()) {
                patientData.mrn = formData.mrn.trim();
            }

            if (formData.dob.trim()) {
                patientData.dob = formData.dob.trim();
            }

            if (formData.gender && formData.gender !== '') {
                patientData.gender = formData.gender;
            }

            // Create the patient with proper user isolation
            await patientService.createPatient(user.uid, patientData);

            // Reset form and close modal
            setFormData({
                name: '',
                mrn: '',
                dob: '',
                gender: ''
            });
            setErrors({});
            onPatientAdded();
        } catch (error) {
            console.error('Error creating patient:', error);
            setError(error instanceof Error ? error.message : 'Failed to create patient');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setFormData({
                name: '',
                mrn: '',
                dob: '',
                gender: ''
            });
            setErrors({});
            setError(null);
            onClose();
        }
    };

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear specific field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }

        // Clear general error
        if (error) {
            setError(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Background overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={handleClose}
            />

            {/* Modal container */}
            <div className="flex items-center justify-center min-h-screen p-4">
                {/* Modal */}
                <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6 z-50">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-medium text-gray-900">
                            Add New Patient
                        </h3>
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Name - Required */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Patient Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                disabled={loading}
                                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-50 ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter patient's full name"
                                autoComplete="off"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* MRN - Optional */}
                        <div>
                            <label htmlFor="mrn" className="block text-sm font-medium text-gray-700 mb-1">
                                Medical Record Number (MRN)
                                <span className="text-gray-500 text-xs ml-1">optional</span>
                            </label>
                            <input
                                type="text"
                                id="mrn"
                                value={formData.mrn}
                                onChange={(e) => handleInputChange('mrn', e.target.value)}
                                disabled={loading}
                                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-50 ${errors.mrn ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter MRN if available"
                                autoComplete="off"
                            />
                            {errors.mrn && (
                                <p className="mt-1 text-sm text-red-600">{errors.mrn}</p>
                            )}
                        </div>

                        {/* Date of Birth - Optional */}
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth
                                <span className="text-gray-500 text-xs ml-1">optional</span>
                            </label>
                            <input
                                type="date"
                                id="dob"
                                value={formData.dob}
                                onChange={(e) => handleInputChange('dob', e.target.value)}
                                disabled={loading}
                                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-50 ${errors.dob ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                                    }`}
                                max={new Date().toISOString().split('T')[0]} // Prevent future dates
                            />
                            {errors.dob && (
                                <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
                            )}
                        </div>

                        {/* Gender - Optional */}
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                Gender
                                <span className="text-gray-500 text-xs ml-1">optional</span>
                            </label>
                            <select
                                id="gender"
                                value={formData.gender}
                                onChange={(e) => handleInputChange('gender', e.target.value as typeof formData.gender)}
                                disabled={loading}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-50"
                            >
                                <option value="">Select gender (optional)</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                        </div>

                        {/* Form Actions */}
                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !formData.name.trim()}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="m12 2 2.5 6 6 .5-4.5 4 1 6-5-3-5 3 1-6-4.5-4 6-.5L12 2z"></path>
                                        </svg>
                                        Creating...
                                    </span>
                                ) : (
                                    'Create Patient'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Helper text */}
                    <div className="mt-4 text-xs text-gray-500">
                        <p>* Required fields</p>
                        <p>All patient data is encrypted and HIPAA-compliant.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}