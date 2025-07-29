'use client';

import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from './DashboardHeader';
import NoteGenerator from '@/components/NoteGenerator';

export default function Dashboard() {
    const { user } = useAuth();

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

                    {/* Note Generator - Keep existing functionality intact */}
                    <NoteGenerator />
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