// src/app/api/generate-note/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

const CONTEXT_PROMPTS = {
    'hmhi-transfer': `You are a HIPAA-compliant AI clinical documentation assistant for Dr. Rufus Sweeney, a PGY-3 psychiatry resident at HMHI Downtown Clinic.

Generate a comprehensive transfer of care note for outpatient psychiatry.

CRITICAL: HMHI Downtown uses Epic EMR - include relevant Epic SmartPhrases and @SMARTPHRASE@ syntax where appropriate.

For transfer of care notes, follow these specific guidelines:
1. Copy forward unchanged sections from the previous note when appropriate
2. Update only sections that have new information from the session
3. Maintain continuity of care documentation
4. Use Epic-compatible formatting and SmartPhrases`,

    'hmhi-followup': `You are a HIPAA-compliant AI clinical documentation assistant for Dr. Rufus Sweeney, a PGY-3 psychiatry resident at HMHI Downtown Clinic.

Generate a concise but comprehensive outpatient psychiatry follow-up note.

CRITICAL: HMHI Downtown uses Epic EMR - include relevant Epic SmartPhrases and @SMARTPHRASE@ syntax where appropriate.`,

    'dbh-intake': `You are a HIPAA-compliant AI clinical documentation assistant for Dr. Rufus Sweeney, a PGY-3 psychiatry resident at Davis Behavioral Health.

Generate a comprehensive Credible EMR-compatible outpatient psychiatry intake assessment.

CRITICAL: Davis Behavioral Health uses Credible EMR - output PLAIN TEXT ONLY. Do NOT use Epic SmartPhrases, @SMARTPHRASE@ syntax, or .dotphrases.

Structure the note with comprehensive intake sections including detailed psychiatric history, mental status exam, and treatment plan.`,

    'dbh-followup': `You are a HIPAA-compliant AI clinical documentation assistant for Dr. Rufus Sweeney, a PGY-3 psychiatry resident at Davis Behavioral Health.

Generate a Credible EMR-compatible outpatient psychiatry follow-up note.

CRITICAL: Davis Behavioral Health uses Credible EMR - output PLAIN TEXT ONLY. Do NOT use Epic SmartPhrases, @SMARTPHRASE@ syntax, or .dotphrases.`,

    'redwood-intake': `You are a HIPAA-compliant AI clinical documentation assistant for Dr. Rufus Sweeney, a PGY-3 psychiatry resident at Redwood Clinic MH Integration.

Generate a mental health integration intake note for primary care setting.

Use clear, accessible language appropriate for integrated care documentation.`,

    'redwood-followup': `You are a HIPAA-compliant AI clinical documentation assistant for Dr. Rufus Sweeney, a PGY-3 psychiatry resident at Redwood Clinic MH Integration.

Generate a mental health integration follow-up note for primary care setting.

Use clear, accessible language appropriate for integrated care documentation.`
};

interface PatientContext {
    patientId: string;
    patientName: string;
    patientMRN?: string;
    patientDOB?: string;
    patientGender?: string;
}

export async function POST(request: NextRequest) {
    try {
        const { transcript, context, previousNote, patientContext } = await request.json();

        if (!transcript) {
            return NextResponse.json(
                { error: 'Transcript is required' },
                { status: 400 }
            );
        }

        if (!process.env.GOOGLE_GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        const systemPrompt = CONTEXT_PROMPTS[context as keyof typeof CONTEXT_PROMPTS] || CONTEXT_PROMPTS['hmhi-transfer'];

        let prompt = `${systemPrompt}

TRANSCRIPT:
${transcript}`;

        // Add patient context if provided
        if (patientContext) {
            prompt += `

PATIENT INFORMATION:
Name: ${patientContext.patientName}`;

            if (patientContext.patientMRN) {
                prompt += `
MRN: ${patientContext.patientMRN}`;
            }

            if (patientContext.patientDOB) {
                prompt += `
Date of Birth: ${patientContext.patientDOB}`;
            }

            if (patientContext.patientGender) {
                prompt += `
Gender: ${patientContext.patientGender}`;
            }
        }

        // Add previous note for transfer of care
        if (context === 'hmhi-transfer' && previousNote) {
            prompt += `

PREVIOUS PATIENT NOTE:
${previousNote}`;
        }

        prompt += `

Generate the clinical note now:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const note = response.text();

        return NextResponse.json({
            note,
            patientContext: patientContext || null
        });

    } catch (error) {
        console.error('Error generating note:', error);
        return NextResponse.json(
            { error: 'Failed to generate note' },
            { status: 500 }
        );
    }
}