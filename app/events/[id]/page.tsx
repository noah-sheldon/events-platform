'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { clientAPI } from '@/lib/client-api';
import { getEventStatusInfo } from '@/lib/api';
import { waitlistManager } from '@/lib/waitlist';
import { Event, RegistrationRequest } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, MapPin, Users, DollarSign, Clock, ArrowLeft, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const registrationSchema = z.object({
  attendeeName: z.string().min(1, 'Name is required'),
  attendeeEmail: z.string().email('Please enter a valid email address'),
  groupSize: z.number().min(1).max(10).default(1),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnWaitlist, setIsOnWaitlist] = useState(false);
  const [waitlistPosition, setWaitlistPosition] = useState(0);
  const [waitlistSize, setWaitlistSize] = useState(0);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      attendeeName: '',
      attendeeEmail: '',
      groupSize: 1,
    },
  });

  useEffect(() => {
    async function fetchEvent() {
      try {
        setLoading(true);
        const response = await clientAPI.getEvent(params.id as string);
        setEvent(response.event);
        setError(null);
        
        // Check waitlist status
        const eventId = params.id as string;
        setWaitlistSize(waitlistManager.getWaitlistSize(eventId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch event');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchEvent();
    }
  }, [params.id]);

  // Check if user is on waitlist when form data changes
  useEffect(() => {
    if (event && form.watch('attendeeEmail')) {
      const email = form.watch('attendeeEmail');
      const onWaitlist = waitlistManager.isOnWaitlist(event.id, email);
      setIsOnWaitlist(onWaitlist);
      
      if (onWaitlist) {
        setWaitlistPosition(waitlistManager.getWaitlistPosition(event.id, email));
      }
    }
  }, [event, form.watch('attendeeEmail')]);

  const onSubmit = async (data: RegistrationForm) => {
    if (!event) return;

    try {
      setRegistering(true);
      const registration: RegistrationRequest = {
        attendeeName: data.attendeeName,
        attendeeEmail: data.attendeeEmail,
        groupSize: data.groupSize,
      };

      await clientAPI.registerForEvent(event.id, registration);
      toast.success('Registration successful!', {
        description: `You've been registered for ${event.title}. Check your email for confirmation.`,
      });
      
      // Update event capacity (optimistic update)
      setEvent(prev => prev ? {
        ...prev,
        capacity: {
          ...prev.capacity,
          registered: prev.capacity.registered + data.groupSize
        }
      } : null);

      form.reset();
    } catch (err) {
      toast.error('Registration failed', {
        description: err instanceof Error ? err.message : 'Please try again later.',
      });
    } finally {
      setRegistering(false);
    }
  };

  const onJoinWaitlist = async (data: RegistrationForm) => {
    if (!event) return;

    try {
      setJoiningWaitlist(true);
      
      waitlistManager.joinWaitlist({
        eventId: event.id,
        attendeeName: data.attendeeName,
        attendeeEmail: data.attendeeEmail,
        groupSize: data.groupSize,
      });

      setIsOnWaitlist(true);
      setWaitlistPosition(waitlistManager.getWaitlistPosition(event.id, data.attendeeEmail));
      setWaitlistSize(waitlistManager.getWaitlistSize(event.id));

      toast.success('Added to waitlist!', {
        description: `You're #${waitlistManager.getWaitlistPosition(event.id, data.attendeeEmail)} on the waitlist for ${event.title}.`,
      });
    } catch (err) {
      toast.error('Failed to join waitlist', {
        description: 'Please try again later.',
      });
    } finally {
      setJoiningWaitlist(false);
    }
  };

  const leaveWaitlist = () => {
    if (!event) return;
    
    const email = form.watch('attendeeEmail');
    waitlistManager.leaveWaitlist(event.id, email);
    setIsOnWaitlist(false);
    setWaitlistPosition(0);
    setWaitlistSize(waitlistManager.getWaitlistSize(event.id));
    
    toast.success('Removed from waitlist', {
      description: 'You have been removed from the waitlist.',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded mb-8 w-3/4"></div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-8">{error || 'The event you\'re looking for doesn\'t exist.'}</p>
          <Button asChild>
            <Link href="/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getEventStatusInfo(event.capacity);
  const eventDate = new Date(event.date);
  const isEventFull = statusInfo.text === 'Full';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </Button>

        {/* Event Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
              <div className="flex gap-3 items-center">
                <Badge 
                  variant="secondary"
                  style={{ backgroundColor: event.category.color + '20', color: event.category.color }}
                >
                  {event.category.name}
                </Badge>
                <Badge 
                  variant={statusInfo.variant}
                  className={statusInfo.color}
                >
                  {statusInfo.text}
                </Badge>
              </div>
            </div>
          </div>

          {/* Event Meta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{eventDate.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{eventDate.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">
                {event.location.type === 'online' ? 'Online' : event.location.address}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">
                {event.pricing.individual === 0 ? 'Free' : `$${event.pricing.individual}`}
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{event.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Date & Time:</span>
                  <span>{eventDate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Location:</span>
                  <span>{event.location.type === 'online' ? 'Online Event' : event.location.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Price:</span>
                  <span>{event.pricing.individual === 0 ? 'Free' : `$${event.pricing.individual} per person`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Capacity:</span>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{event.capacity.registered}/{event.capacity.max} registered</span>
                  </div>
                </div>
                {waitlistSize > 0 && (
                  <div className="flex justify-between">
                    <span className="font-medium">Waitlist:</span>
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      <span>{waitlistSize} waiting</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Registration Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{isEventFull ? 'Event Full' : 'Register Now'}</CardTitle>
                <CardDescription>
                  {isEventFull 
                    ? 'This event has reached its maximum capacity.' 
                    : 'Secure your spot at this event.'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEventFull ? (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-2">
                        This event is fully booked.
                      </p>
                      {waitlistSize > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {waitlistSize} people on the waitlist
                        </p>
                      )}
                    </div>

                    {isOnWaitlist ? (
                      <div className="text-center space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="font-medium text-blue-900 dark:text-blue-100">
                            You're on the waitlist!
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Position: #{waitlistPosition}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={leaveWaitlist}
                        >
                          Leave Waitlist
                        </Button>
                      </div>
                    ) : (
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onJoinWaitlist)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="attendeeName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="attendeeEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="Enter your email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="groupSize"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Group Size</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1" 
                                    max="10" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button type="submit" className="w-full" disabled={joiningWaitlist}>
                            {joiningWaitlist ? 'Joining...' : 'Join Waitlist'}
                          </Button>
                        </form>
                      </Form>
                    )}
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="attendeeName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="attendeeEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="groupSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Group Size</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="10" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={registering}>
                        {registering ? 'Registering...' : 'Register Now'}
                      </Button>

                      {event.pricing.individual > 0 && (
                        <p className="text-sm text-muted-foreground text-center">
                          Total: ${(event.pricing.individual * form.watch('groupSize')).toFixed(2)}
                        </p>
                      )}
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}