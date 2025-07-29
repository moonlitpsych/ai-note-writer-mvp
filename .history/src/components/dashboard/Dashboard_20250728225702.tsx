// src/components/dashboard/Dashboard.tsx (TEMPORARY TESTING VERSION)
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from './DashboardHeader';
import NoteGenerator from '@/components/NoteGenerator';
import PatientServiceTest from '@/components/patients/PatientServiceTest';

export default function Dashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'notes' | 'patients'>('notes');

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader />

            <main className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Welcome Message */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Welcome back, {user?.displayName?.split(' ')[0] || 'Doctor'}
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Generate clinical notes from your patient transcripts
                        </p>
                    </div>

                    {/* TEMPORARY: Tab Navigation for Testing */}
                    <div className="mb-8">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('notes')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'notes'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    📝 Note Generation (Current MVP)
                                </button>
                                <button
                                    onClick={() => setActiveTab('patients')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'patients'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    🧪 Patient Foundation Test (Phase 2)
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'notes' && (
                        <div>
                            {/* Phase 1 Status Indicator */}
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-green-800">
                                            Phase 1 Complete: Authentication & Note Generation Working Perfectly
                                        </h3>
                                        <p className="text-sm text-green-700 mt-1">
                                            This is your proven, working note generation system. Phase 2 testing happens in the other tab.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Original Note Generator - UNCHANGED */}
                            <NoteGenerator />
                        </div>
                    )}

                    {activeTab === 'patients' && (
                        <div>
                            {/* Phase 2 Testing Indicator */}
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">
                                            Phase 2 Foundation Testing: Patient Management
                                        </h3>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Testing patient service foundation before building final UI. All tests must pass before proceeding.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Patient Foundation Test Component */}
                            <PatientServiceTest />
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            <p>AI Medical Note Writer • HIPAA Compliant</p>
                            <p className="mt-1">Session timeout: 15 minutes for security</p>
                        </div>
                        <div className="text-sm text-gray-500">
                            <p>Connected to: {user?.clinic}</p>
                            <p className="mt-1">Role: {user?.role}</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}