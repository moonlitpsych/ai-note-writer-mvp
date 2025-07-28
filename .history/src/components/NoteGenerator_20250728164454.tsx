'use client';

import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline';

const CLINICAL_CONTEXTS = [
    { value: 'hmhi-transfer', label: 'HMHI Downtown - Transfer of Care' },
    { value: 'hmhi-followup', label: 'HMHI Downtown - Follow-up' },
    { value: 'dbh-intake', label: 'Davis Behavioral Health - Intake' },
    { value: 'dbh-followup', label: 'Davis Behavioral Health - Follow-up' },
    { value: 'redwood-intake', label: 'Redwood Clinic MHI - Intake' },
    { value: 'redwood-followup', label: 'Redwood Clinic MHI - Follow-up' },
];

export default function NoteGenerator() {
    const [transcript, setTranscript] = useState('');
    const [context, setContext] = useState('hmhi-transfer');
    const [previousNote, setPreviousNote] = useState('');
    const [generatedNote, setGeneratedNote] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const generateNote = async () => {
        if (!transcript.trim()) {
            setError('Please enter a transcript');
            return;
        }

        setIsGenerating(true);
        setError('');
        setGeneratedNote('');

        try {
            const response = await fetch('/api/generate-note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transcript,
                    context,
                    previousNote: context === 'hmhi-transfer' ? previousNote : undefined,
                }),
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

                        {/* Generate Button */}
                        <button
                            onClick={generateNote}
                            disabled={isGenerating || !transcript.trim()}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="h-4 w-4 mr-2" />
                                    Generate Note
                                </>
                            )}
                        </button>

                        {/* Error Display */}
                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Output Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <DocumentTextIcon className="h-5 w-5 mr-2" />
                                Generated Note
                            </h2>
                            {generatedNote && (
                                <button
                                    onClick={copyToClipboard}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Copy to Clipboard
                                </button>
                            )}
                        </div>

                        {generatedNote ? (
                            <div className="border rounded-md p-4 bg-gray-50">
                                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                                    {generatedNote}
                                </pre>
                            </div>
                        ) : (
                            <div className="border rounded-md p-8 bg-gray-50 text-center">
                                <p className="text-gray-500">Generated note will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}