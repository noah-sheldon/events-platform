import { NextRequest, NextResponse } from 'next/server';
import { serverWaitlistManager } from '@/lib/server-waitlist';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Email parameter required' },
        { status: 400 }
      );
    }

    const status = await serverWaitlistManager.getUserWaitlistStatus(eventId, email);

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting waitlist status:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to get waitlist status' },
      { status: 500 }
    );
  }
}