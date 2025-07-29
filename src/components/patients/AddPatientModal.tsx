// src/components/patients/AddPatientModal.tsx (SIMPLIFIED VERSION FOR TESTING)
'use client';

import { useState } from 'react';

interface AddPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPatientAdded: () => void;
}

export default function AddPatientModal({ isOpen, onClose, onPatientAdded }: AddPatientModalProps) {
    const [name, setName] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />

                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Patient (Test)</h3>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Patient name"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
                    />

                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-300 py-2 px-4 rounded-md text-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                console.log('Test modal - would create patient:', name);
                                onPatientAdded();
                            }}
                            className="flex-1 bg-blue-600 py-2 px-4 rounded-md text-white"
                        >
                            Test Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}