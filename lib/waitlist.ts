import { WaitlistEntry } from './types';

const WAITLIST_KEY = 'events-platform-waitlist';

export class WaitlistManager {
  private getStoredWaitlist(): WaitlistEntry[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(WAITLIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveWaitlist(waitlist: WaitlistEntry[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(WAITLIST_KEY, JSON.stringify(waitlist));
    } catch {
      // Ignore storage errors
    }
  }

  joinWaitlist(entry: Omit<WaitlistEntry, 'joinedAt'>): void {
    const waitlist = this.getStoredWaitlist();
    
    // Check if already on waitlist for this event
    const existingIndex = waitlist.findIndex(
      w => w.eventId === entry.eventId && w.attendeeEmail === entry.attendeeEmail
    );

    const newEntry: WaitlistEntry = {
      ...entry,
      joinedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Update existing entry
      waitlist[existingIndex] = newEntry;
    } else {
      // Add new entry
      waitlist.push(newEntry);
    }

    this.saveWaitlist(waitlist);
  }

  isOnWaitlist(eventId: string, email: string): boolean {
    const waitlist = this.getStoredWaitlist();
    return waitlist.some(w => w.eventId === eventId && w.attendeeEmail === email);
  }

  getWaitlistForEvent(eventId: string): WaitlistEntry[] {
    const waitlist = this.getStoredWaitlist();
    return waitlist.filter(w => w.eventId === eventId);
  }

  getUserWaitlist(email: string): WaitlistEntry[] {
    const waitlist = this.getStoredWaitlist();
    return waitlist.filter(w => w.attendeeEmail === email);
  }

  leaveWaitlist(eventId: string, email: string): void {
    const waitlist = this.getStoredWaitlist();
    const filtered = waitlist.filter(w => !(w.eventId === eventId && w.attendeeEmail === email));
    this.saveWaitlist(filtered);
  }

  getWaitlistPosition(eventId: string, email: string): number {
    const eventWaitlist = this.getWaitlistForEvent(eventId);
    eventWaitlist.sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
    
    const position = eventWaitlist.findIndex(w => w.attendeeEmail === email);
    return position >= 0 ? position + 1 : 0;
  }

  getWaitlistSize(eventId: string): number {
    return this.getWaitlistForEvent(eventId).length;
  }
}

export const waitlistManager = new WaitlistManager();