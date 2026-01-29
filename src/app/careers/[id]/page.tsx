'use client';

import { use } from 'react';
import { AppLayout } from '@/components/layout';
import { CareerDetail } from '@/components/careers';
import { careers } from '@/data/careers';
import { notFound } from 'next/navigation';

interface CareerPageProps {
  params: Promise<{ id: string }>;
}

export default function CareerPage({ params }: CareerPageProps) {
  const { id } = use(params);
  const career = careers.find((c) => c.id === id);

  if (!career) {
    notFound();
  }

  return (
    <AppLayout>
      <CareerDetail career={career} />
    </AppLayout>
  );
}
