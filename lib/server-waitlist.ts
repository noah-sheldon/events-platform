import fs from 'fs';
import path from 'path';

export interface WaitlistEntry {
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  groupSize: number;
  joinedAt: string;
}

interface WaitlistData {
  [eventId: string]: WaitlistEntry[];
}

const WAITLIST_FILE = path.join(process.cwd(), 'data', 'waitlists.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(WAITLIST_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read waitlist data from file
function readWaitlistData(): WaitlistData {
  ensureDataDir();
  
  try {
    if (fs.existsSync(WAITLIST_FILE)) {
      const data = fs.readFileSync(WAITLIST_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading waitlist data:', error);
  }
  
  return {};
}

// Write waitlist data to file
function writeWaitlistData(data: WaitlistData): void {
  try {
    ensureDataDir();
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing waitlist data:', error);
    throw new Error('Failed to save waitlist data');
  }
}

export class ServerWaitlistManager {
  // Add user to waitlist
  joinWaitlist(entry: Omit<WaitlistEntry, 'joinedAt'>): { position: number; totalWaiting: number } {
    const data = readWaitlistData();
    
    if (!data[entry.eventId]) {
      data[entry.eventId] = [];
    }

    const eventWaitlist = data[entry.eventId];
    
    // Check if user already on waitlist
    const existingIndex = eventWaitlist.findIndex(w => w.attendeeEmail === entry.attendeeEmail);
    
    if (existingIndex >= 0) {
      // Update existing entry
      eventWaitlist[existingIndex] = {
        ...entry,
        joinedAt: new Date().toISOString(),
      };
    } else {
      // Add new entry
      eventWaitlist.push({
        ...entry,
        joinedAt: new Date().toISOString(),
      });
    }

    writeWaitlistData(data);
    
    const position = eventWaitlist.findIndex(w => w.attendeeEmail === entry.attendeeEmail) + 1;
    return {
      position,
      totalWaiting: eventWaitlist.length,
    };
  }

  // Remove user from waitlist
  leaveWaitlist(eventId: string, email: string): { success: boolean; totalWaiting: number } {
    const data = readWaitlistData();
    
    if (!data[eventId]) {
      return { success: false, totalWaiting: 0 };
    }

    const eventWaitlist = data[eventId];
    const filteredWaitlist = eventWaitlist.filter(w => w.attendeeEmail !== email);
    
    if (filteredWaitlist.length === eventWaitlist.length) {
      // User wasn't on waitlist
      return { success: false, totalWaiting: eventWaitlist.length };
    }

    data[eventId] = filteredWaitlist;
    writeWaitlistData(data);

    return {
      success: true,
      totalWaiting: filteredWaitlist.length,
    };
  }

  // Check if user is on waitlist
  isOnWaitlist(eventId: string, email: string): boolean {
    const data = readWaitlistData();
    
    if (!data[eventId]) return false;
    
    return data[eventId].some(w => w.attendeeEmail === email);
  }

  // Get user's position on waitlist
  getWaitlistPosition(eventId: string, email: string): number {
    const data = readWaitlistData();
    
    if (!data[eventId]) return 0;
    
    const position = data[eventId].findIndex(w => w.attendeeEmail === email);
    return position >= 0 ? position + 1 : 0;
  }

  // Get total waitlist size for event
  getWaitlistSize(eventId: string): number {
    const data = readWaitlistData();
    return data[eventId]?.length || 0;
  }

  // Get user's waitlist status for an event
  getUserWaitlistStatus(eventId: string, email: string): {
    isOnWaitlist: boolean;
    position: number;
    totalWaiting: number;
  } {
    return {
      isOnWaitlist: this.isOnWaitlist(eventId, email),
      position: this.getWaitlistPosition(eventId, email),
      totalWaiting: this.getWaitlistSize(eventId),
    };
  }

  // Get all waitlists for debugging/admin
  getAllWaitlists(): WaitlistData {
    return readWaitlistData();
  }
}

export const serverWaitlistManager = new ServerWaitlistManager();