// src/components/patients/AddPatientModal.tsx - RESTORE WORKING VERSION
'use client';

import React from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onPatientAdded: () => void;
}

function AddPatientModal({ isOpen, onClose, onPatientAdded }: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative z-10">
                <h2 className="text-xl font-bold mb-4">Test Modal - Working!</h2>
                <p className="text-gray-600 mb-4">✅ Import issue solved! Ready to build the patient form.</p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            console.log('Modal working perfectly!');
                            onPatientAdded();
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        ✅ Working!
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddPatientModal;