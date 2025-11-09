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

const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3';

// Rate limiting and caching
let cache: { data: WaitlistData; timestamp: number } | null = null;
const CACHE_DURATION = 5000; // 5 seconds cache
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

// Read waitlist data from JSONBin with caching and rate limiting
async function readWaitlistData(): Promise<WaitlistData> {
  if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID) {
    return {};
  }

  // Check cache first
  const now = Date.now();
  if (cache && (now - cache.timestamp) < CACHE_DURATION) {
    return cache.data;
  }

  // Rate limiting - ensure minimum interval between requests
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    // Return cached data if available, otherwise empty
    return cache?.data || {};
  }

  try {
    lastRequestTime = now;
    const response = await fetch(`${JSONBIN_BASE_URL}/b/${JSONBIN_BIN_ID}`, {
      headers: {
        'X-Master-Key': JSONBIN_API_KEY,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Bin doesn't exist yet, return empty data
        return {};
      }
      if (response.status === 429) {
        // Rate limited - return cached data if available
        return cache?.data || {};
      }
      throw new Error(`JSONBin API error: ${response.status}`);
    }

    const result = await response.json();
    const data = result.record || {};
    
    // Update cache
    cache = { data, timestamp: now };
    
    return data;
  } catch (error) {
    // Return cached data if available, otherwise empty
    return cache?.data || {};
  }
}

// Write waitlist data to JSONBin with rate limiting
async function writeWaitlistData(data: WaitlistData): Promise<void> {
  if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID) {
    throw new Error('JSONBin credentials not configured');
  }

  // Rate limiting for writes
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    // Wait for the remaining time
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }

  try {
    lastRequestTime = Date.now();
    const response = await fetch(`${JSONBIN_BASE_URL}/b/${JSONBIN_BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limited - please try again in a moment');
      }
      throw new Error(`JSONBin API error: ${response.status}`);
    }

    // Update cache after successful write
    cache = { data, timestamp: Date.now() };
  } catch (error) {
    throw new Error('Failed to save waitlist data');
  }
}

export class ServerWaitlistManager {
  // Add user to waitlist
  async joinWaitlist(entry: Omit<WaitlistEntry, 'joinedAt'>): Promise<{ position: number; totalWaiting: number }> {
    const data = await readWaitlistData();
    
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

    await writeWaitlistData(data);
    
    const position = eventWaitlist.findIndex(w => w.attendeeEmail === entry.attendeeEmail) + 1;
    return {
      position,
      totalWaiting: eventWaitlist.length,
    };
  }

  // Remove user from waitlist
  async leaveWaitlist(eventId: string, email: string): Promise<{ success: boolean; totalWaiting: number }> {
    const data = await readWaitlistData();
    
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
    await writeWaitlistData(data);

    return {
      success: true,
      totalWaiting: filteredWaitlist.length,
    };
  }

  // Check if user is on waitlist
  async isOnWaitlist(eventId: string, email: string): Promise<boolean> {
    const data = await readWaitlistData();
    
    if (!data[eventId]) return false;
    
    return data[eventId].some(w => w.attendeeEmail === email);
  }

  // Get user's position on waitlist
  async getWaitlistPosition(eventId: string, email: string): Promise<number> {
    const data = await readWaitlistData();
    
    if (!data[eventId]) return 0;
    
    const position = data[eventId].findIndex(w => w.attendeeEmail === email);
    return position >= 0 ? position + 1 : 0;
  }

  // Get total waitlist size for event
  async getWaitlistSize(eventId: string): Promise<number> {
    const data = await readWaitlistData();
    return data[eventId]?.length || 0;
  }

  // Get user's waitlist status for an event (optimized to use single API call)
  async getUserWaitlistStatus(eventId: string, email: string): Promise<{
    isOnWaitlist: boolean;
    position: number;
    totalWaiting: number;
  }> {
    const data = await readWaitlistData();
    const eventWaitlist = data[eventId] || [];
    
    const position = eventWaitlist.findIndex(w => w.attendeeEmail === email);
    const isOnWaitlist = position >= 0;
    
    return {
      isOnWaitlist,
      position: isOnWaitlist ? position + 1 : 0,
      totalWaiting: eventWaitlist.length,
    };
  }

  // Get all waitlists for debugging/admin
  async getAllWaitlists(): Promise<WaitlistData> {
    return await readWaitlistData();
  }
}

export const serverWaitlistManager = new ServerWaitlistManager();