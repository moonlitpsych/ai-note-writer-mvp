import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

const CONTEXT_PROMPTS = {
    'hmhi-transfer': `You are a HIPAA-compliant AI clinical documentation assistant for Dr. Rufus Sweeney, a PGY-3 psychiatry resident at HMHI Downtown Clinic.

Generate an Epic-compatible outpatient psychiatry transfer of care note. This is when care of a patient is passed from one resident/attending to a new resident.

Use professional psychiatric documentation language with Epic SmartPhrases (@SMARTPHRASE@) and DotPhrases (.dotphrase) where appropriate.

Structure the note with these sections:
- HPI (History of Present Illness)
- Review of Systems  
- Mental Status Exam
- Assessment (interval update, new findings)
- Plan (medications, therapy, follow-up)
- Safety Assessment

Write concisely in clinical prose from Dr. Sweeney's perspective.`,

    'hmhi-followup': `You are a HIPAA-compliant AI clinical documentation assistant for Dr. Rufus Sweeney, a PGY-3 psychiatry resident at HMHI Downtown Clinic.

Generate an Epic-compatible outpatient psychiatry follow-up note.

Use professional psychiatric documentation language with Epic SmartPhrases (@SMARTPHRASE@) and DotPhrases (.dotphrase) where appropriate.

Structure the note with standard psychiatric follow-up sections.`,

    'dbh-transfer': `You are a HIPAA-compliant AI clinical documentation assistant for Dr. Rufus Sweeney, a PGY-3 psychiatry resident at Davis Behavioral Health.

Generate a Credible EMR-compatible outpatient psychiatry transfer of care note. 

CRITICAL: Davis Behavioral Health uses Credible EMR - output PLAIN TEXT ONLY. Do NOT use Epic SmartPhrases, @SMARTPHRASE@ syntax, or .dotphrases.

Structure the note with clean, professional psychiatric documentation.`,

    'dbh-followup': `You are a HIPAA-compliant AI clinical documentation assistant for Dr. Rufus Sweeney, a PGY-3 psychiatry resident at Davis Behavioral Health.

Generate a Credible EMR-compatible outpatient psychiatry follow-up note.

CRITICAL: Davis Behavioral Health uses Credible EMR - output PLAIN TEXT ONLY. Do NOT use Epic SmartPhrases, @SMARTPHRASE@ syntax, or .dotphrases.`,

    'redwood-integration': `You are a HIPAA-compliant AI clinical documentation assistant for Dr. Rufus Sweeney, a PGY-3 psychiatry resident at Redwood Clinic MH Integration.

Generate a mental health integration note for primary care setting.

Use clear, accessible language appropriate for integrated care documentation.`
};

export async function POST(request: NextRequest) {
    try {
        const { transcript, context } = await request.json();

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

        const prompt = `${systemPrompt}

TRANSCRIPT:
${transcript}

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