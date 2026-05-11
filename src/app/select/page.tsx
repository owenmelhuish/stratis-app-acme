"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ENTERPRISES, type EnterpriseId } from '@/types';
import { EnterpriseMolecularScene } from '@/components/molecular';
import { cn } from '@/lib/utils';

export default function SelectEnterprisePage() {
  const router = useRouter();
  const setSelectedEnterprise = useAppStore((s) => s.setSelectedEnterprise);
  const currentEnterprise = useAppStore((s) => s.selectedEnterprise);
  const theme = useAppStore((s) => s.theme);
  const [hoveredId, setHoveredId] = useState<EnterpriseId | null>(null);

  const handleSelect = (id: EnterpriseId) => {
    setSelectedEnterprise(id);
    router.push('/dashboard');
  };

  const focused = ENTERPRISES.find((e) => e.id === hoveredId) ?? null;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Molecular scene — full screen */}
      <EnterpriseMolecularScene
        currentEnterprise={currentEnterprise}
        hoveredId={hoveredId}
        onSelect={handleSelect}
        onHover={setHoveredId}
        theme={theme}
      />

      {/* Hover tooltip — bottom-center, matches the existing molecular filter pattern */}
      <div className="absolute bottom-10 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <div
          className={cn(
            'px-5 py-3 rounded-xl border bg-card-elevated/90 backdrop-blur-md transition-all duration-200',
            focused ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
            focused?.borderClass ?? 'border-border/30',
            'min-w-[260px] text-center',
          )}
        >
          {focused && (
            <>
              <p className={cn('text-[10px] font-semibold tracking-[0.2em] uppercase', focused.accentClass)}>
                {currentEnterprise === focused.id ? 'Current Enterprise' : 'Enterprise'}
              </p>
              <p className="text-sm font-bold text-foreground mt-1">{focused.name}</p>
              <p className={cn('text-[11px] font-medium', focused.accentClass)}>{focused.tagline}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
