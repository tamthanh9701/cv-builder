"use client";

import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export default function Home() {
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/login';
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}