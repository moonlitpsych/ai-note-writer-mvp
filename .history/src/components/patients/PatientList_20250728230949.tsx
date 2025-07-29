// src/components/patients/PatientList.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { patientService } from '@/lib/firebase/patient-service';
import { Patient, PatientSearchFilters } from '@/lib/types/patient';
import AddPatientModal from './AddPatientModal';
import { MagnifyingGlassIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline';

export default function PatientList() {
    const { user } = useAuth();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'lastModified'>('lastModified');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const loadPatients = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const filters: PatientSearchFilters = {
                status: 'active',
                sortBy,
                sortOrder
            };
            const patientList = await patientService.getPatients(user.uid, filters);
            setPatients(patientList);
            setFilteredPatients(patientList);
        } catch (error) {
            console.error('Failed to load patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);

        if (!term.trim()) {
            setFilteredPatients(patients);
            return;
        }

        const searchLower = term.toLowerCase().trim();
        const filtered = patients.filter(patient =>
            patient.name.toLowerCase().includes(searchLower) ||
            (patient.mrn && patient.mrn.toLowerCase().includes(searchLower))
        );
        setFilteredPatients(filtered);
    };

    const handlePatientAdded = () => {
        setShowAddModal(false);
        loadPatients(); // Refresh the list
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    useEffect(() => {
        if (user) {
            loadPatients();
        }
    }, [user, sortBy, sortOrder]);

    useEffect(() => {
        handleSearch(searchTerm);
    }, [patients]);

    if (!user) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">Please log in to manage patients</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">
                        Patient Management
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your patients for clinical documentation
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Patient
                </button>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search patients by name or MRN..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-700">Sort by:</label>
                    <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                            const [field, order] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                            setSortBy(field);
                            setSortOrder(order);
                        }}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="lastModified-desc">Recently Modified</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="createdAt-desc">Recently Added</option>
                        <option value="createdAt-asc">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Patient List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500 mt-2">Loading patients...</p>
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div className="text-center py-8">
                        {searchTerm ? (
                            <div>
                                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Try adjusting your search term or{' '}
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="text-blue-600 hover:text-blue-500"
                                    >
                                        clear search
                                    </button>
                                </p>
                            </div>
                        ) : (
                            <div>
                                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No patients yet</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Get started by adding your first patient
                                </p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        Add First Patient
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {filteredPatients.map((patient) => (
                            <li key={patient.id} className="px-6 py-4 hover:bg-gray-50">
                                <div className="flex items-center space-x-4">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                            <span className="text-sm font-medium text-white">
                                                {getInitials(patient.name)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Patient Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-3">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {patient.name}
                                            </p>
                                            {patient.gender && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                    {patient.gender}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-4 mt-1">
                                            {patient.mrn && (
                                                <p className="text-sm text-gray-500">
                                                    MRN: {patient.mrn}
                                                </p>
                                            )}
                                            {patient.dob && (
                                                <p className="text-sm text-gray-500">
                                                    DOB: {patient.dob}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Meta Info */}
                                    <div className="hidden sm:flex sm:flex-col sm:items-end">
                                        <p className="text-xs text-gray-500">
                                            Added {formatDate(patient.createdAt)}
                                        </p>
                                        {patient.lastModified.getTime() !== patient.createdAt.getTime() && (
                                            <p className="text-xs text-gray-400">
                                                Modified {formatDate(patient.lastModified)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Results Summary */}
            {!loading && filteredPatients.length > 0 && (
                <div className="text-sm text-gray-500 text-center">
                    Showing {filteredPatients.length} of {patients.length} patients
                    {searchTerm && (
                        <span> matching "{searchTerm}"</span>
                    )}
                </div>
            )}

            {/* Add Patient Modal */}
            <AddPatientModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onPatientAdded={handlePatientAdded}
            />
        </div>
    );
}