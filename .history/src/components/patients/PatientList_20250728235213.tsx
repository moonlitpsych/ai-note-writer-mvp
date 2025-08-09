// src/components/patients/PatientList.tsx - CLEAN VERSION
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { patientService } from '@/lib/firebase/patient-service';
import { Patient, PatientSearchFilters } from '@/lib/types/patient';
import { MagnifyingGlassIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline';
import AddPatientModal from './AddPatientModal';

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

    const handlePatientAdded = () => {
        setShowAddModal(false);
        loadPatients();
    };

    useEffect(() => {
        loadPatients();
    }, [user, sortBy, sortOrder]);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredPatients(patients);
            return;
        }

        const filtered = patients.filter(patient => {
            const searchLower = searchTerm.toLowerCase();
            return (
                patient.name.toLowerCase().includes(searchLower) ||
                patient.mrn.toLowerCase().includes(searchLower)
            );
        });
        setFilteredPatients(filtered);
    }, [searchTerm, patients]);

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
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getSortDisplayText = () => {
        const sortText = {
            name: 'Name',
            createdAt: 'Date Added',
            lastModified: 'Last Modified'
        }[sortBy];
        const orderText = sortOrder === 'asc' ? '↑' : '↓';
        return `${sortText} ${orderText}`;
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
                    <p className="text-gray-600">Manage your patient records</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Patient
                </button>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or MRN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="lastModified">Last Modified</option>
                        <option value="createdAt">Date Added</option>
                        <option value="name">Name</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                        title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                    >
                        {getSortDisplayText()}
                    </button>
                </div>
            </div>

            {/* Patients List */}
            <div className="bg-white rounded-lg border border-gray-200">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-2">Loading patients...</p>
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div className="p-8 text-center">
                        {searchTerm ? (
                            <>
                                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                                <p className="text-gray-600">
                                    No patients match your search for "{searchTerm}"
                                </p>
                            </>
                        ) : (
                            <>
                                <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No patients yet</h3>
                                <p className="text-gray-600 mb-4">
                                    Get started by adding your first patient
                                </p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    Add First Patient
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {filteredPatients.map((patient) => (
                            <li key={patient.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-sm font-medium text-blue-800">
                                                {getInitials(patient.name)}
                                            </span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                                    {patient.name}
                                                </h3>
                                                <span className="text-sm text-gray-500 font-mono">
                                                    MRN: {patient.mrn}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                                <span>DOB: {formatDate(patient.dateOfBirth)}</span>
                                                <span>•</span>
                                                <span className="capitalize">{patient.gender}</span>
                                                {patient.email && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{patient.email}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

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

            {/* Modal */}
            <AddPatientModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onPatientAdded={handlePatientAdded}
            />
        </div>
    );
}