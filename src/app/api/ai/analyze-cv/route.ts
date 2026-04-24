import { NextResponse } from 'next/server';
import { analyzeCV } from '@/lib/ai-service';

export async function POST(request: Request) {
  try {
    const { cvContent, jobDescription, targetJobUrl } = await request.json();

    if (!cvContent || !jobDescription) {
      return NextResponse.json(
        { error: 'Missing cvContent or jobDescription' },
        { status: 400 }
      );
    }

    const result = await analyzeCV(cvContent, jobDescription, targetJobUrl);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Analyze CV error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze CV' },
      { status: 500 }
    );
  }
}