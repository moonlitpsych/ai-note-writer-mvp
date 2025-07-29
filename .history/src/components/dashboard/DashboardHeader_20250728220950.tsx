'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    UserCircleIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

export default function DashboardHeader() {
    const { user, signOut } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const formatLastLogin = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Title */}
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-gray-900">
                            AI Medical Note Writer
                        </h1>
                        <span className="ml-3 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            HIPAA Compliant
                        </span>
                    </div>

                    {/* User Info and Menu */}
                    <div className="flex items-center space-x-4">
                        {/* Session Timer Indicator */}
                        <div className="hidden sm:flex items-center text-sm text-gray-600">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            <span>15-min session</span>
                        </div>

                        {/* User Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <UserCircleIcon className="h-6 w-6 text-gray-600" />
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.displayName || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-500">{user?.clinic}</p>
                                </div>
                            </button>

                            {dropdownOpen && (
                                <>
                                    {/* Backdrop */}
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setDropdownOpen(false)}
                                    />

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                                        <div className="py-1">
                                            {/* User Info */}
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {user?.displayName}
                                                </p>
                                                <p className="text-sm text-gray-500">{user?.email}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {user?.clinic} • {user?.role}
                                                </p>
                                                {user?.lastLogin && (
                                                    <p className="text-xs text-gray-400">
                                                        Last login: {formatLastLogin(user.lastLogin)}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Menu Items */}
                                            <button
                                                onClick={() => {
                                                    setDropdownOpen(false);
                                                    // TODO: Add profile settings modal in future
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                            >
                                                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                                                Settings
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setDropdownOpen(false);
                                                    handleSignOut();
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                            >
                                                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}