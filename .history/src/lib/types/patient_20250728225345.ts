// src/lib/types/patient.ts
export interface Patient {
    id: string;
    name: string;
    mrn?: string;
    dob?: string; // YYYY-MM-DD format for consistency
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    createdBy: string; // userId for HIPAA isolation
    createdAt: Date;
    lastModified: Date;
    status: 'active' | 'inactive';
}

export interface CreatePatientRequest {
    name: string;
    mrn?: string;
    dob?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
}

export interface UpdatePatientRequest {
    name?: string;
    mrn?: string;
    dob?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    status?: 'active' | 'inactive';
}

export interface PatientSearchFilters {
    searchTerm?: string; // Search by name or MRN
    status?: 'active' | 'inactive';
    sortBy?: 'name' | 'createdAt' | 'lastModified';
    sortOrder?: 'asc' | 'desc';
}