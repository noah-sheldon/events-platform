interface WaitlistJoinResponse {
  success: boolean;
  position: number;
  totalWaiting: number;
  message: string;
}

interface WaitlistLeaveResponse {
  success: boolean;
  totalWaiting: number;
  message: string;
}

interface WaitlistStatusResponse {
  isOnWaitlist: boolean;
  position: number;
  totalWaiting: number;
}

export interface WaitlistJoinRequest {
  attendeeName: string;
  attendeeEmail: string;
  groupSize?: number;
}

class WaitlistAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred'
      }));
      throw new Error(error.message);
    }

    return response.json();
  }

  async joinWaitlist(eventId: string, request: WaitlistJoinRequest): Promise<WaitlistJoinResponse> {
    return this.request<WaitlistJoinResponse>(`/api/waitlist/${eventId}`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async leaveWaitlist(eventId: string, email: string): Promise<WaitlistLeaveResponse> {
    return this.request<WaitlistLeaveResponse>(`/api/waitlist/${eventId}?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
    });
  }

  async getWaitlistStatus(eventId: string, email: string): Promise<WaitlistStatusResponse> {
    return this.request<WaitlistStatusResponse>(`/api/waitlist/${eventId}/status?email=${encodeURIComponent(email)}`);
  }
}

export const waitlistAPI = new WaitlistAPI();