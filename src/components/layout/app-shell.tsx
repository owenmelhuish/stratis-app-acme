"use client";
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarNav } from './sidebar-nav';
import { HeaderBar } from './header-bar';
import { useAppStore } from '@/lib/store';
import { MolecularFilterOverlay } from '@/components/molecular';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const hydrateFromStorage = useAppStore(s => s.hydrateFromStorage);
  const molecularFilterOpen = useAppStore(s => s.molecularFilterOpen);
  const setMolecularFilterOpen = useAppStore(s => s.setMolecularFilterOpen);
  const theme = useAppStore(s => s.theme);
  const selectedEnterprise = useAppStore(s => s.selectedEnterprise);
  const pathname = usePathname();
  const router = useRouter();
  const isFullScreenRoute = pathname === '/select';

  useEffect(() => {
    hydrateFromStorage();
    setMounted(true);
  }, [hydrateFromStorage]);

  // Guard: if no enterprise is selected, route everything except /select and / to /select
  useEffect(() => {
    if (!mounted) return;
    if (!selectedEnterprise && pathname !== '/select' && pathname !== '/') {
      router.replace('/select');
    }
  }, [mounted, selectedEnterprise, pathname, router]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <div className="text-2xl font-bold tracking-tight text-orange">STRATIS</div>
      </div>
    );
  }

  if (isFullScreenRoute) {
    return <div className="h-screen w-screen overflow-auto bg-background">{children}</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderBar />
        <main className="flex-1 overflow-hidden relative">
          {molecularFilterOpen ? (
            <MolecularFilterOverlay onClose={() => setMolecularFilterOpen(false)} />
          ) : (
            <div className="h-full overflow-auto p-8">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
