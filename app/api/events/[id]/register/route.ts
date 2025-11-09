import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api';
import { RegistrationRequest } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: RegistrationRequest = await request.json();
    
    // Basic validation
    if (!body.attendeeEmail || !body.attendeeName) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Missing required fields: attendeeEmail, attendeeName' },
        { status: 400 }
      );
    }

    const response = await apiClient.registerForEvent(id, body);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { error: 'Failed to register for event', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}