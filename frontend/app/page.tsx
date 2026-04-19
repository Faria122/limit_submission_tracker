import { redirect } from 'next/navigation';

// Server-side redirect — no client JS, no MUI, no hydration mismatch
export default function HomePage() {
  redirect('/submissions');
}
