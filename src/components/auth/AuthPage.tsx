'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('login');

    const toggleMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        AI Medical Note Writer
                    </h1>
                    <p className="text-gray-600">
                        HIPAA-compliant clinical documentation assistant
                    </p>
                </div>

                {/* Auth Form */}
                {mode === 'login' ? (
                    <LoginForm onToggleMode={toggleMode} />
                ) : (
                    <SignUpForm onToggleMode={toggleMode} />
                )}

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-gray-500">
                    <p>HIPAA compliant • 15-minute session timeout</p>
                    <p className="mt-1">Your data is encrypted and secure</p>
                </div>
            </div>
        </div>
    );
}