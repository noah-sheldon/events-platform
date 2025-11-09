'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clientAPI } from '@/lib/client-api';
import { getEventStatusInfo } from '@/lib/api';
import { Event } from '@/lib/types';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';

const categories = [
  { id: 'all', name: 'All Categories', color: '#6B7280' },
  { id: 'technology', name: 'Technology', color: '#3B82F6' },
  { id: 'business', name: 'Business', color: '#10B981' },
  { id: 'design', name: 'Design', color: '#F59E0B' },
  { id: 'marketing', name: 'Marketing', color: '#EC4899' },
  { id: 'health', name: 'Health & Wellness', color: '#8B5CF6' },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'full'>('all');

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        // Fetch ALL events and filter client-side for better UX
        const response = await clientAPI.getEvents({ limit: 50 });
        setEvents(response.events);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []); // Only fetch once on mount

  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by category (client-side, instant)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category.id === selectedCategory);
    }

    // Filter by status (client-side, instant)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => {
        const statusInfo = getEventStatusInfo(event.capacity);
        return statusFilter === 'available' ? statusInfo.text !== 'Full' : statusInfo.text === 'Full';
      });
    }

    // Filter by search term (client-side, instant)
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [events, selectedCategory, statusFilter, searchTerm]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Events</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Events</h1>
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Events</h1>
      
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              style={selectedCategory === category.id ? { backgroundColor: category.color } : {}}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All Events
          </Button>
          <Button
            variant={statusFilter === 'available' ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter('available')}
          >
            Available
          </Button>
          <Button
            variant={statusFilter === 'full' ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter('full')}
          >
            Full Events
          </Button>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredEvents.length} of {events.length} events
        </p>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No events found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
          const statusInfo = getEventStatusInfo(event.capacity);
          const eventDate = new Date(event.date);
          
          return (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                  <Badge 
                    variant={statusInfo.variant}
                    className={statusInfo.color}
                  >
                    {statusInfo.text}
                  </Badge>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge 
                    variant="secondary" 
                    style={{ backgroundColor: event.category.color + '20', color: event.category.color }}
                  >
                    {event.category.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {eventDate.toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3">
                  {event.description}
                </CardDescription>
                <div className="mt-4 space-y-2">
                  <p className="text-sm">
                    <strong>Location:</strong> {event.location.type === 'online' ? 'Online' : event.location.address}
                  </p>
                  <p className="text-sm">
                    <strong>Price:</strong> {event.pricing.individual === 0 ? 'Free' : `$${event.pricing.individual}`}
                  </p>
                  <p className="text-sm">
                    <strong>Capacity:</strong> {event.capacity.registered}/{event.capacity.max}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/events/${event.id}`}>
                    {statusInfo.text === 'Full' ? 'View Details' : 'Register Now'}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );
}