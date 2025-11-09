import { Event, EventsResponse, RegistrationRequest, RegistrationResponse, APIError, EventFilters } from './types';

const API_BASE_URL = process.env.API_BASE_URL!;
const API_KEY = process.env.API_KEY!;

class APIClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: APIError = await response.json().catch(() => ({
        error: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred'
      }));
      throw new Error(error.message);
    }

    return response.json();
  }

  async getEvents(filters: EventFilters = {}): Promise<EventsResponse> {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.lastKey) params.append('lastKey', filters.lastKey);

    const queryString = params.toString();
    const endpoint = `/events${queryString ? `?${queryString}` : ''}`;

    return this.request<EventsResponse>(endpoint);
  }

  async getEvent(id: string): Promise<{ event: Event }> {
    return this.request<{ event: Event }>(`/events/${id}`);
  }

  async registerForEvent(eventId: string, registration: RegistrationRequest): Promise<RegistrationResponse> {
    return this.request<RegistrationResponse>(`/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify(registration),
    });
  }
}

export const apiClient = new APIClient();

// Helper function to calculate event status
export function getEventStatus(capacity: { max: number; registered: number }): 'available' | 'few-spots' | 'full' {
  const availableSpots = capacity.max - capacity.registered;
  const percentageAvailable = availableSpots / capacity.max;

  if (availableSpots === 0) return 'full';
  if (percentageAvailable <= 0.2) return 'few-spots';
  return 'available';
}

// Helper function to get status text and styling
export function getEventStatusInfo(capacity: { max: number; registered: number }) {
  const status = getEventStatus(capacity);
  const availableSpots = capacity.max - capacity.registered;

  switch (status) {
    case 'full':
      return {
        text: 'Full',
        description: 'Event is at capacity',
        variant: 'destructive' as const,
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      };
    case 'few-spots':
      return {
        text: `${availableSpots} spots left`,
        description: 'Limited availability',
        variant: 'secondary' as const,
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      };
    case 'available':
      return {
        text: `${availableSpots} spots available`,
        description: 'Available spots',
        variant: 'outline' as const,
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      };
  }
}