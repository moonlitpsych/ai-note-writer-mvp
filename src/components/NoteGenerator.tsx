// src/components/NoteGenerator.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { patientService } from '@/lib/firebase/patient-service';
import { Patient } from '@/lib/types/patient';
import { DocumentTextIcon, SparklesIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const CLINICAL_CONTEXTS = [
    { value: 'hmhi-transfer', label: 'HMHI Downtown - Transfer of Care' },
    { value: 'hmhi-followup', label: 'HMHI Downtown - Follow-up' },
    { value: 'dbh-intake', label: 'Davis Behavioral Health - Intake' },
    { value: 'dbh-followup', label: 'Davis Behavioral Health - Follow-up' },
    { value: 'redwood-intake', label: 'Redwood Clinic MHI - Intake' },
    { value: 'redwood-followup', label: 'Redwood Clinic MHI - Follow-up' },
];

export default function NoteGenerator() {
    const { user } = useAuth();
    const [transcript, setTranscript] = useState('');
    const [context, setContext] = useState('hmhi-transfer');
    const [previousNote, setPreviousNote] = useState('');
    const [generatedNote, setGeneratedNote] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    // Patient selection state
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);
    const [loadingPatients, setLoadingPatients] = useState(false);

    // Load patients when component mounts
    useEffect(() => {
        if (user) {
            loadPatients();
        }
    }, [user]);

    // Filter patients based on search term
    useEffect(() => {
        if (!patientSearchTerm.trim()) {
            setFilteredPatients(patients);
        } else {
            const searchLower = patientSearchTerm.toLowerCase();
            const filtered = patients.filter(patient =>
                patient.name.toLowerCase().includes(searchLower) ||
                (patient.mrn && patient.mrn.toLowerCase().includes(searchLower))
            );
            setFilteredPatients(filtered);
        }
    }, [patientSearchTerm, patients]);

    const loadPatients = async () => {
        if (!user) return;

        setLoadingPatients(true);
        try {
            const patientList = await patientService.getPatients(user.uid, {
                status: 'active',
                sortBy: 'name',
                sortOrder: 'asc'
            });
            setPatients(patientList);
            setFilteredPatients(patientList);
        } catch (error) {
            console.error('Failed to load patients:', error);
        } finally {
            setLoadingPatients(false);
        }
    };

    const selectPatient = (patient: Patient) => {
        setSelectedPatient(patient);
        setPatientSearchTerm(patient.name);
        setShowPatientDropdown(false);
    };

    const clearPatientSelection = () => {
        setSelectedPatient(null);
        setPatientSearchTerm('');
        setShowPatientDropdown(false);
    };

    const generateNote = async () => {
        if (!transcript.trim()) {
            setError('Please enter a transcript');
            return;
        }

        setIsGenerating(true);
        setError('');
        setGeneratedNote('');

        try {
            // Build the request with patient context if selected
            const requestBody: any = {
                transcript,
                context,
                previousNote: context === 'hmhi-transfer' ? previousNote : undefined,
            };

            // Add patient context if a patient is selected
            if (selectedPatient) {
                requestBody.patientContext = {
                    patientId: selectedPatient.id,
                    patientName: selectedPatient.name,
                    patientMRN: selectedPatient.mrn,
                    patientDOB: selectedPatient.dob,
                    patientGender: selectedPatient.gender,
                };
            }

            const response = await fetch('/api/generate-note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate note');
            }

            setGeneratedNote(data.note);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedNote);
            // You could add a toast notification here
        } catch (err) {
            console.error('Failed to copy to clipboard');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-600">Please log in to access the note generator.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        AI Medical Note Writer
                    </h1>
                    <p className="text-gray-600">
                        Transform your patient transcripts into clinical notes
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <DocumentTextIcon className="h-5 w-5 mr-2" />
                            Input
                        </h2>

                        {/* Patient Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Patient (Optional)
                                <span className="text-gray-500 text-xs ml-1">Links note to patient record</span>
                            </label>

                            {selectedPatient ? (
                                // Selected patient display
                                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <div className="flex items-center">
                                        <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
                                        <div>
                                            <p className="font-medium text-blue-900">{selectedPatient.name}</p>
                                            {selectedPatient.mrn && (
                                                <p className="text-sm text-blue-700">MRN: {selectedPatient.mrn}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={clearPatientSelection}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                // Patient search/selection
                                <div className="relative">
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="text"
                                            value={patientSearchTerm}
                                            onChange={(e) => {
                                                setPatientSearchTerm(e.target.value);
                                                setShowPatientDropdown(true);
                                            }}
                                            onFocus={() => setShowPatientDropdown(true)}
                                            placeholder="Search patients by name or MRN..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    {/* Patient dropdown */}
                                    {showPatientDropdown && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {loadingPatients ? (
                                                <div className="p-3 text-center text-gray-500">
                                                    Loading patients...
                                                </div>
                                            ) : filteredPatients.length > 0 ? (
                                                <>
                                                    {filteredPatients.map((patient) => (
                                                        <button
                                                            key={patient.id}
                                                            onClick={() => selectPatient(patient)}
                                                            className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <div className="font-medium text-gray-900">{patient.name}</div>
                                                            {patient.mrn && (
                                                                <div className="text-sm text-gray-500">MRN: {patient.mrn}</div>
                                                            )}
                                                        </button>
                                                    ))}
                                                    <div className="p-2 border-t border-gray-200 bg-gray-50">
                                                        <button
                                                            onClick={() => setShowPatientDropdown(false)}
                                                            className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
                                                        >
                                                            Skip patient selection
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="p-3 text-center text-gray-500">
                                                    {patientSearchTerm ? 'No patients found' : 'No patients available'}
                                                    <div className="mt-2">
                                                        <button
                                                            onClick={() => setShowPatientDropdown(false)}
                                                            className="text-sm text-blue-600 hover:text-blue-800"
                                                        >
                                                            Continue without patient
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Context Selector */}
                        <div className="mb-4">
                            <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
                                Clinical Context
                            </label>
                            <select
                                id="context"
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                {CLINICAL_CONTEXTS.map((ctx) => (
                                    <option key={ctx.value} value={ctx.value}>
                                        {ctx.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Previous Note Input - Only for HMHI Transfer of Care */}
                        {context === 'hmhi-transfer' && (
                            <div className="mb-4">
                                <label htmlFor="previousNote" className="block text-sm font-medium text-gray-700 mb-2">
                                    Previous Patient Note
                                    <span className="text-gray-500 text-xs ml-1">(for copy-forward sections)</span>
                                </label>
                                <textarea
                                    id="previousNote"
                                    value={previousNote}
                                    onChange={(e) => setPreviousNote(e.target.value)}
                                    placeholder="Paste the last patient note here for transfer of care..."
                                    rows={8}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        )}

                        {/* Transcript Input */}
                        <div className="mb-4">
                            <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 mb-2">
                                Patient Transcript
                            </label>
                            <textarea
                                id="transcript"
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                placeholder="Paste your Google Meet transcript here..."
                                rows={12}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Generate Button */}
                        <button
                            onClick={generateNote}
                            disabled={isGenerating || !transcript.trim()}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isGenerating ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating Note...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="h-5 w-5 mr-2" />
                                    Generate Note
                                </>
                            )}
                        </button>
                    </div>

                    {/* Output Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                            <span className="flex items-center">
                                <DocumentTextIcon className="h-5 w-5 mr-2" />
                                Generated Note
                            </span>
                            {generatedNote && (
                                <button
                                    onClick={copyToClipboard}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Copy to Clipboard
                                </button>
                            )}
                        </h2>

                        {generatedNote ? (
                            <div className="space-y-4">
                                {/* Patient context display if selected */}
                                {selectedPatient && (
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                        <p className="text-sm text-gray-600">
                                            <strong>Patient:</strong> {selectedPatient.name}
                                            {selectedPatient.mrn && ` (MRN: ${selectedPatient.mrn})`}
                                        </p>
                                    </div>
                                )}

                                <textarea
                                    value={generatedNote}
                                    onChange={(e) => setGeneratedNote(e.target.value)}
                                    className="w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Generated note will appear here..."
                                />
                            </div>
                        ) : (
                            <div className="h-96 flex items-center justify-center border border-gray-300 rounded-md bg-gray-50">
                                <div className="text-center text-gray-500">
                                    <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    <p>Generated note will appear here</p>
                                    <p className="text-sm mt-1">Select a patient and enter a transcript to get started</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}