import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect directly to events page - no need for a marketing homepage
  redirect('/events');
}
