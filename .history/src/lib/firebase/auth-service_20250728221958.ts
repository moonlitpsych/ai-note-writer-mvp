import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    User
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from './config';
import { UserProfile } from '@/lib/types/auth';

export class AuthService {
    private googleProvider = new GoogleAuthProvider();

    async createUserProfile(user: User, additionalData: Partial<UserProfile> = {}): Promise<UserProfile> {
        const userRef = doc(db, COLLECTIONS.USERS, user.uid);

        const profile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || additionalData.displayName || '',
            clinic: additionalData.clinic || 'HMHI Downtown',
            role: additionalData.role || 'resident',
            createdAt: new Date(),
            lastLogin: new Date(),
            preferences: {
                defaultContext: 'hmhi-transfer',
                sessionTimeout: 15, // 15 minutes for HIPAA compliance
            },
            ...additionalData
        };

        await setDoc(userRef, {
            ...profile,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
        });

        return profile;
    }

    async getUserProfile(uid: string): Promise<UserProfile | null> {
        try {
            const userRef = doc(db, COLLECTIONS.USERS, uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                return {
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    lastLogin: data.lastLogin?.toDate() || new Date(),
                } as UserProfile;
            }

            return null;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
        const userRef = doc(db, COLLECTIONS.USERS, uid);
        await updateDoc(userRef, {
            ...updates,
            lastLogin: serverTimestamp(),
        });
    }

    async signUp(email: string, password: string, profileData: Partial<UserProfile>) {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await this.createUserProfile(user, profileData);
        return user;
    }

    async signIn(email: string, password: string) {
        const { user } = await signInWithEmailAndPassword(auth, email, password);

        // Update last login
        await this.updateUserProfile(user.uid, { lastLogin: new Date() });

        return user;
    }

    async signInWithGoogle() {
        const { user } = await signInWithPopup(auth, this.googleProvider);

        // Check if user profile exists, create if not
        const existingProfile = await this.getUserProfile(user.uid);
        if (!existingProfile) {
            // Create profile with default values for Google OAuth users
            await this.createUserProfile(user, {
                displayName: user.displayName || user.email?.split('@')[0] || 'User',
                clinic: 'HMHI Downtown', // Default clinic
                role: 'resident' // Default role
            });
        } else {
            // Update last login
            await this.updateUserProfile(user.uid, { lastLogin: new Date() });
        }

        return user;
    }
}

export const authService = new AuthService();