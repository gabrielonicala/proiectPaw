'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const AuthWrapper = dynamic(() => import('@/components/AuthWrapper'), {
  ssr: false
});

const LandingPage = dynamic(() => import('@/app/home/page'), {
  ssr: false
});

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/home');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-white border-t-transparent pixelated animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <LandingPage />;
  }

  return <AuthWrapper />;
}
