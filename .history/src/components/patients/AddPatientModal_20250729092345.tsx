// src/components/patients/AddPatientModal.tsx - SAFE INCREMENTAL VERSION
'use client';

import React, { useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onPatientAdded: () => void;
}

function AddPatientModal({ isOpen, onClose, onPatientAdded }: Props) {
    const [step, setStep] = useState<'hipaa' | 'form'>('hipaa');
    const [name, setName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !dateOfBirth || !gender) {
            alert('Please fill in required fields (Name, Date of Birth, Gender)');
            return;
        }

        setIsSubmitting(true);

        try {
            // TODO: Replace with actual patient service call
            console.log('Creating patient:', {
                name,
                dateOfBirth,
                gender,
                email,
                phone,
                mrn: `MRN${Date.now().toString().slice(-9)}`
            });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert(`Patient "${name}" created successfully!`);

            // Reset form
            setName('');
            setDateOfBirth('');
            setGender('');
            setEmail('');
            setPhone('');
            setStep('hipaa');

            onPatientAdded();
        } catch (error) {
            console.error('Failed to create patient:', error);
            alert('Failed to create patient. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setName('');
            setDateOfBirth('');
            setGender('');
            setEmail('');
            setPhone('');
            setStep('hipaa');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 relative z-10 max-h-[90vh] overflow-y-auto">

                {step === 'hipaa' && (
                    <>
                        <h2 className="text-xl font-bold mb-4">HIPAA Privacy Notice</h2>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-800">
                                ⚕️ This system stores protected health information (PHI).
                                All data is encrypted and access is logged for security compliance.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setStep('form')}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                I Understand - Continue
                            </button>
                        </div>
                    </>
                )}

                {step === 'form' && (
                    <>
                        <h2 className="text-xl font-bold mb-4">Add New Patient</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Required Fields */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter patient's full name"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth *
                                </label>
                                <input
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gender *
                                </label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isSubmitting}
                                    required
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Optional Fields */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="patient@example.com"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="(555) 123-4567"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep('hipaa')}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Patient'
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default AddPatientModal;