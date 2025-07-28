import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

const CONTEXT_PROMPTS = {
    'hmhi-transfer': `You are a HIPAA-compliant AI clinical documentation assistant for Dr. Rufus Sweeney, a PGY-3 psychiatry resident at HMHI Downtown Clinic.

Generate an Epic-compatible outpatient psychiatry transfer of care note. This is when care of a patient is passed from one resident/attending to a new resident (Dr. Sweeney is taking over care).

CRITICAL TRANSFER OF CARE INSTRUCTIONS:
The previous patient note contains sections that should be copied forward unchanged, and sections that need to be updated based on today's visit transcript.

SECTIONS TO UPDATE/MODIFY (focus your effort here):
- HPI (History of Present Illness)
- Review of Systems  
- Psychiatric exam/Mental Status Exam
- Assessment (interval update, new findings from today's visit per the transcript)
- Parts of the Plan (according to the transcript):
  * Medications  
  * Psychosocial

SECTIONS TO COPY FORWARD UNCHANGED (preserve exactly as-is):
- Basic patient info (name, MRN, DOB)
- Diagnoses (automatically pulled in from elsewhere)
- Current medications (automatically pulled in from elsewhere)
- Behavioral Health prior meds tried
- Risks (risk assessment)
- Parts of the Plan:
  * Safety Plan 
  * Prognosis 
  * Psychotherapy

Use professional psychiatric documentation language with Epic SmartPhrases (@SMARTPHRASE@) and DotPhrases (.dotphrase) where appropriate.

Write concisely in clinical prose from Dr. Sweeney's perspective.`,

    'hmhi-followup': `You are a HIPAA-compliant AI clinical documentation assistant for Dr. Rufus Sweeney, a PGY-3 psychiatry resident at HMHI Downtown Clinic.

Generate an Epic-compatible outpatient psychiatry follow-up note.

Use professional psychiatric documentation language with Epic SmartPhrases (@SMARTPHRASE@) and DotPhrases (.dotphrase) where appropriate.

Structure the note with standard psychiatric follow-up sections.`,

    'dbh-intake': `You are a HIPAA-compliant AI clinical documentation assistant for Dr. Rufus Sweeney, a PGY-3 psychiatry resident at Davis Behavioral Health.

Generate a Credible EMR-compatible outpatient psychiatry intake note. 

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

export async function POST(request: NextRequest) {
    try {
        const { transcript, context, previousNote } = await request.json();

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

        return NextResponse.json({ note });

    } catch (error) {
        console.error('Error generating note:', error);
        return NextResponse.json(
            { error: 'Failed to generate note' },
            { status: 500 }
        );
    }
}