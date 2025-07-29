// src/components/patients/PatientServiceTest.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { patientService } from '@/lib/firebase/patient-service';
import { Patient, CreatePatientRequest } from '@/lib/types/patient';

/**
 * Test component to verify patient service works correctly
 * This component will be replaced with proper UI components
 */
export default function PatientServiceTest() {
    const { user } = useAuth();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [createForm, setCreateForm] = useState<CreatePatientRequest>({
        name: '',
        mrn: '',
        dob: '',
        gender: undefined
    });

    const loadPatients = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const patientList = await patientService.getPatients(user.uid);
            setPatients(patientList);
            console.log('Loaded patients:', patientList);
        } catch (error) {
            console.error('Failed to load patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const createPatient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !createForm.name.trim()) return;

        try {
            console.log('Creating patient:', createForm);
            const newPatient = await patientService.createPatient(user.uid, createForm);
            console.log('Created patient:', newPatient);

            // Reset form
            setCreateForm({ name: '', mrn: '', dob: '', gender: undefined });

            // Reload patients
            await loadPatients();
        } catch (error) {
            console.error('Failed to create patient:', error);
            alert('Failed to create patient');
        }
    };

    const testUserIsolation = async () => {
        if (!user) return;

        console.log('=== TESTING USER ISOLATION ===');

        // Test 1: Try to access a non-existent patient
        const nonExistentPatient = await patientService.getPatient(user.uid, 'fake-patient-id');
        console.log('Non-existent patient (should be null):', nonExistentPatient);

        // Test 2: Try to access patient with wrong user ID
        if (patients.length > 0) {
            const wrongUserPatient = await patientService.getPatient('fake-user-id', patients[0].id);
            console.log('Wrong user access (should be null):', wrongUserPatient);
        }

        // Test 3: Verify all patients belong to current user
        const userPatients = await patientService.getPatients(user.uid);
        const isolationCheck = userPatients.every(p => p.createdBy === user.uid);
        console.log('All patients belong to current user:', isolationCheck);

        console.log('=== USER ISOLATION TESTS COMPLETE ===');
    };

    useEffect(() => {
        if (user) {
            loadPatients();
        }
    }, [user]);

    if (!user) {
        return <div className="p-4">Please log in to test patient service</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Patient Service Test</h1>

            {/* Create Patient Form */}
            <div className="mb-8 p-4 border rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Create New Patient</h2>
                <form onSubmit={createPatient} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Name (Required)
                        </label>
                        <input
                            type="text"
                            value={createForm.name}
                            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            MRN (Optional)
                        </label>
                        <input
                            type="text"
                            value={createForm.mrn}
                            onChange={(e) => setCreateForm({ ...createForm, mrn: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Date of Birth (Optional)
                        </label>
                        <input
                            type="date"
                            value={createForm.dob}
                            onChange={(e) => setCreateForm({ ...createForm, dob: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Gender (Optional)
                        </label>
                        <select
                            value={createForm.gender || ''}
                            onChange={(e) => setCreateForm({
                                ...createForm,
                                gender: e.target.value as any || undefined
                            })}
                            className="w-full px-3 py-2 border rounded-md"
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Create Patient
                    </button>
                </form>
            </div>

            {/* Test Buttons */}
            <div className="mb-6 space-x-4">
                <button
                    onClick={loadPatients}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Reload Patients'}
                </button>

                <button
                    onClick={testUserIsolation}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                    Test User Isolation
                </button>
            </div>

            {/* Patient List */}
            <div className="border rounded-lg">
                <h2 className="text-lg font-semibold p-4 border-b">
                    Patients ({patients.length})
                </h2>

                {patients.length === 0 ? (
                    <div className="p-4 text-gray-500">
                        No patients found. Create a patient above to test the service.
                    </div>
                ) : (
                    <div className="divide-y">
                        {patients.map((patient) => (
                            <div key={patient.id} className="p-4">
                                <div className="font-medium">{patient.name}</div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <div>ID: {patient.id}</div>
                                    {patient.mrn && <div>MRN: {patient.mrn}</div>}
                                    {patient.dob && <div>DOB: {patient.dob}</div>}
                                    {patient.gender && <div>Gender: {patient.gender}</div>}
                                    <div>Status: {patient.status}</div>
                                    <div>Created: {patient.createdAt.toLocaleString()}</div>
                                    <div>Modified: {patient.lastModified.toLocaleString()}</div>
                                    <div>Created By: {patient.createdBy === user.uid ? 'You' : patient.createdBy}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Debug Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
                <h3 className="font-medium mb-2">Debug Info</h3>
                <div>Current User: {user.uid}</div>
                <div>Email: {user.email}</div>
                <div>Clinic: {user.clinic}</div>
                <div>Role: {user.role}</div>
            </div>
        </div>
    );
}