'use client';

import dynamic from 'next/dynamic';

const AuthWrapper = dynamic(() => import('@/components/AuthWrapper'), {
  ssr: false
});

export default function Home() {
  return <AuthWrapper />;
}
