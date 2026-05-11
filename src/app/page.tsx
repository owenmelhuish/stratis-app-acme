"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const selectedEnterprise = useAppStore((s) => s.selectedEnterprise);

  useEffect(() => {
    router.replace(selectedEnterprise ? '/dashboard' : '/select');
  }, [router, selectedEnterprise]);

  return (
    <div className="h-screen w-screen bg-background flex items-center justify-center">
      <div className="text-2xl font-bold tracking-tight text-orange">STRATIS</div>
    </div>
  );
}
