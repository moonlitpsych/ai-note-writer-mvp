'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { authService } from '@/lib/firebase/auth-service';
import { UserProfile, AuthContextType } from '@/lib/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);

    // Session timeout for HIPAA compliance (15 minutes)
    const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

    const startSessionTimer = () => {
        if (sessionTimer) {
            clearTimeout(sessionTimer);
        }

        const timer = setTimeout(async () => {
            console.log('Session expired due to inactivity');
            await signOut();
        }, SESSION_TIMEOUT);

        setSessionTimer(timer);
    };

    const resetSessionTimer = () => {
        if (user) {
            startSessionTimer();
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            setLoading(true);

            if (firebaseUser) {
                try {
                    console.log('Firebase user found:', firebaseUser.uid, firebaseUser.email);
                    const userProfile = await authService.getUserProfile(firebaseUser.uid);
                    console.log('User profile:', userProfile);
                    if (userProfile) {
                        setUser(userProfile);
                        startSessionTimer();
                    } else {
                        // User exists in Firebase Auth but no profile - shouldn't happen
                        console.error('User authenticated but no profile found');
                        await authService.signOut();
                    }
                } catch (error) {
                    console.error('Error loading user profile:', error);
                    setUser(null);
                }
            }

            setLoading(false);
        });

        // Reset session timer on user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, resetSessionTimer, true);
        });

        return () => {
            unsubscribe();
            if (sessionTimer) {
                clearTimeout(sessionTimer);
            }
            events.forEach(event => {
                document.removeEventListener(event, resetSessionTimer, true);
            });
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            await authService.signIn(email, password);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to sign in');
        }
    };

    const signInWithGoogle = async () => {
        try {
            await authService.signInWithGoogle();
        } catch (error: any) {
            throw new Error(error.message || 'Failed to sign in with Google');
        }
    };

    const signUp = async (email: string, password: string, profile: Partial<UserProfile>) => {
        try {
            await authService.signUp(email, password, profile);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create account');
        }
    };

    const signOut = async () => {
        try {
            await authService.signOut();
            if (sessionTimer) {
                clearTimeout(sessionTimer);
            }
        } catch (error: any) {
            throw new Error(error.message || 'Failed to sign out');
        }
    };

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!user) throw new Error('No user logged in');

        try {
            await authService.updateUserProfile(user.uid, updates);
            setUser({ ...user, ...updates });
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update profile');
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}