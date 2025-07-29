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
    limit,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db, COLLECTIONS } from './config';
import { Patient, CreatePatientRequest, UpdatePatientRequest, PatientSearchFilters } from '@/lib/types/patient';

export class PatientService {
    private collectionRef = collection(db, COLLECTIONS.PATIENTS);

    /**
     * Create a new patient with proper user isolation
     */
    async createPatient(userId: string, patientData: CreatePatientRequest): Promise<Patient> {
        try {
            // Generate unique ID for the patient
            const patientRef = doc(this.collectionRef);

            const patient: Omit<Patient, 'id'> = {
                name: patientData.name.trim(),
                mrn: patientData.mrn?.trim() || undefined,
                dob: patientData.dob || undefined,
                gender: patientData.gender || undefined,
                createdBy: userId, // CRITICAL: User isolation
                createdAt: new Date(),
                lastModified: new Date(),
                status: 'active'
            };

            await setDoc(patientRef, {
                ...patient,
                createdAt: serverTimestamp(),
                lastModified: serverTimestamp(),
            });

            return {
                id: patientRef.id,
                ...patient
            };
        } catch (error) {
            console.error('Error creating patient:', error);
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

            if (patientSnap.exists()) {
                const data = patientSnap.data();

                // CRITICAL: Verify user isolation
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
            }

            return null;
        } catch (error) {
            console.error('Error fetching patient:', error);
            return null;
        }
    }

    /**
     * Get all patients for a user with optional filtering and search
     */
    async getPatients(userId: string, filters: PatientSearchFilters = {}): Promise<Patient[]> {
        try {
            // Base query with user isolation
            let q = query(
                this.collectionRef,
                where('createdBy', '==', userId)
            );

            // Add status filter
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

            const updateData: any = {
                lastModified: serverTimestamp(),
            };

            // Only include defined fields in update
            if (updates.name !== undefined) updateData.name = updates.name.trim();
            if (updates.mrn !== undefined) updateData.mrn = updates.mrn?.trim() || null;
            if (updates.dob !== undefined) updateData.dob = updates.dob || null;
            if (updates.gender !== undefined) updateData.gender = updates.gender || null;
            if (updates.status !== undefined) updateData.status = updates.status;

            await updateDoc(patientRef, updateData);
        } catch (error) {
            console.error('Error updating patient:', error);
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