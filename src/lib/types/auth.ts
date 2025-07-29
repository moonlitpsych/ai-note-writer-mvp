export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    clinic: 'HMHI Downtown' | 'Davis Behavioral Health' | 'Redwood Clinic MHI';
    role: 'resident' | 'attending' | 'nurse' | 'admin';
    createdAt: Date;
    lastLogin: Date;
    preferences?: {
        defaultContext?: string;
        sessionTimeout?: number;
    };
}

export interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signUp: (email: string, password: string, profile: Partial<UserProfile>) => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}