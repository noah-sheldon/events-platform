import { Event, EventsResponse, RegistrationRequest, RegistrationResponse, EventFilters } from './types';

class ClientAPI {
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

  async getEvents(filters: EventFilters = {}): Promise<EventsResponse> {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.lastKey) params.append('lastKey', filters.lastKey);

    const queryString = params.toString();
    const endpoint = `/api/events${queryString ? `?${queryString}` : ''}`;

    return this.request<EventsResponse>(endpoint);
  }

  async getEvent(id: string): Promise<{ event: Event }> {
    return this.request<{ event: Event }>(`/api/events/${id}`);
  }

  async registerForEvent(eventId: string, registration: RegistrationRequest): Promise<RegistrationResponse> {
    return this.request<RegistrationResponse>(`/api/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify(registration),
    });
  }
}

export const clientAPI = new ClientAPI();