import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await apiClient.getEvent(id);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}