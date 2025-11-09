'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { clientAPI } from '@/lib/client-api';
import { getEventStatusInfo } from '@/lib/api';
import { Event } from '@/lib/types';
import Link from 'next/link';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const response = await clientAPI.getEvents({ limit: 20 });
        setEvents(response.events);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
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
    </div>
  );
}