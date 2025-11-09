import { NextRequest, NextResponse } from 'next/server';
import { serverWaitlistManager } from '@/lib/server-waitlist';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await request.json();
    
    const { attendeeName, attendeeEmail, groupSize = 1 } = body;

    // Basic validation
    if (!attendeeName || !attendeeEmail) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Missing required fields: attendeeName, attendeeEmail' },
        { status: 400 }
      );
    }

    const result = serverWaitlistManager.joinWaitlist({
      eventId,
      attendeeName,
      attendeeEmail,
      groupSize,
    });

    return NextResponse.json({
      success: true,
      position: result.position,
      totalWaiting: result.totalWaiting,
      message: `Added to waitlist at position #${result.position}`,
    });
  } catch (error) {
    console.error('Error joining waitlist:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to join waitlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const result = serverWaitlistManager.leaveWaitlist(eventId, email);

    if (!result.success) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'User not found on waitlist' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      totalWaiting: result.totalWaiting,
      message: 'Successfully removed from waitlist',
    });
  } catch (error) {
    console.error('Error leaving waitlist:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to leave waitlist' },
      { status: 500 }
    );
  }
}