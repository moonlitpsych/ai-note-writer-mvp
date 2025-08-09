// src/lib/firebase/patient-service.ts
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db, COLLECTIONS } from './config';
import { Patient, CreatePatientRequest, UpdatePatientRequest, PatientSearchFilters } from '@/lib/types/patient';

export class PatientService {
    private collectionRef = collection(db, COLLECTIONS.PATIENTS);

    /**
     * Helper function to filter out undefined/null/empty values
     * This prevents Firestore errors when trying to save undefined fields
     */
    private filterUndefinedValues(obj: Record<string, any>): Record<string, any> {
        const filtered: Record<string, any> = {};

        for (const [key, value] of Object.entries(obj)) {
            // Only include fields that have actual values
            if (value !== undefined && value !== null && value !== '') {
                filtered[key] = value;
            }
        }

        return filtered;
    }

    /**
     * Create a new patient with proper user isolation and undefined value handling
     */
    async createPatient(userId: string, patientData: CreatePatientRequest): Promise<Patient> {
        try {
            // Validate required fields
            if (!patientData.name?.trim()) {
                throw new Error('Patient name is required');
            }

            if (!userId) {
                throw new Error('User ID is required for patient creation');
            }

            // Generate unique ID for the patient
            const patientRef = doc(this.collectionRef);

            // Build patient object with only defined values
            const basePatient = {
                name: patientData.name.trim(),
                createdBy: userId, // CRITICAL: User isolation
                status: 'active' as const
            };

            // Conditionally add optional fields only if they have values
            const optionalFields: Record<string, any> = {};

            if (patientData.mrn?.trim()) {
                optionalFields.mrn = patientData.mrn.trim();
            }

            if (patientData.dob?.trim()) {
                optionalFields.dob = patientData.dob.trim();
            }

            if (patientData.gender && patientData.gender !== '') {
                optionalFields.gender = patientData.gender;
            }

            // Combine base fields with optional fields
            const patientToSave = {
                ...basePatient,
                ...optionalFields,
                createdAt: serverTimestamp(),
                lastModified: serverTimestamp(),
            };

            // Save to Firestore (no undefined values will be passed)
            await setDoc(patientRef, patientToSave);

            // Return the created patient with current timestamps
            const now = new Date();
            return {
                id: patientRef.id,
                ...basePatient,
                ...optionalFields,
                createdAt: now,
                lastModified: now,
            };
        } catch (error) {
            console.error('Error creating patient:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to create patient: ${error.message}`);
            }
            throw new Error('Failed to create patient');
        }
    }

    /**
     * Get a specific patient by ID with user isolation
     */
    async getPatient(userId: string, patientId: string): Promise<Patient | null> {
        try {
            const patientRef = doc(this.collectionRef, patientId);
            const patientSnap = await getDoc(patientRef);

            if (!patientSnap.exists()) {
                return null;
            }

            const data = patientSnap.data();

            // Verify user isolation - user can only access their own patients
            if (data.createdBy !== userId) {
                console.warn(`User ${userId} attempted to access patient ${patientId} created by ${data.createdBy}`);
                return null;
            }

            return {
                id: patientSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                lastModified: data.lastModified?.toDate() || new Date(),
            } as Patient;
        } catch (error) {
            console.error('Error fetching patient:', error);
            return null;
        }
    }

    /**
     * Get all patients for a user with filtering and sorting
     */
    async getPatients(userId: string, filters: PatientSearchFilters = {}): Promise<Patient[]> {
        try {
            // Base query with user isolation
            let q = query(
                this.collectionRef,
                where('createdBy', '==', userId)
            );

            // Add status filter if specified
            if (filters.status) {
                q = query(q, where('status', '==', filters.status));
            }

            // Add sorting
            const sortField = filters.sortBy || 'lastModified';
            const sortDirection = filters.sortOrder || 'desc';
            q = query(q, orderBy(sortField, sortDirection));

            const querySnapshot = await getDocs(q);
            let patients: Patient[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                patients.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    lastModified: data.lastModified?.toDate() || new Date(),
                } as Patient);
            });

            // Client-side search filtering (for simplicity)
            if (filters.searchTerm) {
                const searchTerm = filters.searchTerm.toLowerCase().trim();
                patients = patients.filter(patient =>
                    patient.name.toLowerCase().includes(searchTerm) ||
                    (patient.mrn && patient.mrn.toLowerCase().includes(searchTerm))
                );
            }

            return patients;
        } catch (error) {
            console.error('Error fetching patients:', error);
            return [];
        }
    }

    /**
     * Update a patient with user isolation verification
     */
    async updatePatient(userId: string, patientId: string, updates: UpdatePatientRequest): Promise<void> {
        try {
            // First verify user owns this patient
            const existingPatient = await this.getPatient(userId, patientId);
            if (!existingPatient) {
                throw new Error('Patient not found or access denied');
            }

            const patientRef = doc(this.collectionRef, patientId);

            // Build update object with only defined values
            const updateData: Record<string, any> = {
                lastModified: serverTimestamp(),
            };

            // Only include fields that are explicitly being updated with actual values
            if (updates.name !== undefined && updates.name.trim() !== '') {
                updateData.name = updates.name.trim();
            }

            if (updates.mrn !== undefined) {
                if (updates.mrn.trim() !== '') {
                    updateData.mrn = updates.mrn.trim();
                }
                // Note: To clear MRN, pass null explicitly, not empty string
            }

            if (updates.dob !== undefined) {
                if (updates.dob.trim() !== '') {
                    updateData.dob = updates.dob.trim();
                }
                // Note: To clear DOB, pass null explicitly, not empty string
            }

            if (updates.gender !== undefined && updates.gender !== '') {
                updateData.gender = updates.gender;
            }

            if (updates.status !== undefined) {
                updateData.status = updates.status;
            }

            await updateDoc(patientRef, updateData);
        } catch (error) {
            console.error('Error updating patient:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to update patient: ${error.message}`);
            }
            throw new Error('Failed to update patient');
        }
    }

    /**
     * Deactivate a patient (soft delete for HIPAA compliance)
     */
    async deactivatePatient(userId: string, patientId: string): Promise<void> {
        await this.updatePatient(userId, patientId, { status: 'inactive' });
    }

    /**
     * Reactivate a patient
     */
    async reactivatePatient(userId: string, patientId: string): Promise<void> {
        await this.updatePatient(userId, patientId, { status: 'active' });
    }

    /**
     * Search patients by name or MRN (for autocomplete/typeahead)
     */
    async searchPatients(userId: string, searchTerm: string, maxResults: number = 10): Promise<Patient[]> {
        if (!searchTerm.trim()) return [];

        const patients = await this.getPatients(userId, {
            searchTerm: searchTerm.trim(),
            status: 'active',
            sortBy: 'name',
            sortOrder: 'asc'
        });

        return patients.slice(0, maxResults);
    }
}

export const patientService = new PatientService();