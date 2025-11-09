export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  category: Category;
  capacity: Capacity;
  pricing: Pricing;
  location: Location;
}

export interface Category {
  id: 'technology' | 'business' | 'design' | 'marketing' | 'health';
  name: string;
  color: string;
}

export interface Capacity {
  max: number;
  registered: number;
}

export interface Pricing {
  individual: number;
}

export interface Location {
  type: 'physical' | 'online';
  address?: string;
}

export interface EventsResponse {
  events: Event[];
  total: number;
  lastKey?: string;
}

export interface RegistrationRequest {
  attendeeEmail: string;
  attendeeName: string;
  groupSize?: number;
}

export interface RegistrationResponse {
  success: boolean;
  registrationId: string;
  event: Event;
  attendee: {
    email: string;
    name: string;
    groupSize: number;
    registeredAt: string;
  };
}

export interface APIError {
  error: string;
  message: string;
}

export type EventStatus = 'available' | 'few-spots' | 'full';

export interface EventFilters {
  category?: string;
  search?: string;
  status?: 'available' | 'full';
  limit?: number;
  lastKey?: string;
}

export interface WaitlistEntry {
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  groupSize: number;
  joinedAt: string;
}