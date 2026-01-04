'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className={`-ml-2 mb-2 text-slate-500 hover:text-slate-900 ${className}`}
    >
      <ChevronLeft className="mr-1 h-4 w-4" />
      Back
    </Button>
  );
}
