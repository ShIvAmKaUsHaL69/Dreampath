'use client';

import { use, useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout';
import { CareerDetail } from '@/components/careers';
import { Career } from '@/types';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface CareerPageProps {
  params: Promise<{ id: string }>;
}

export default function CareerPage({ params }: CareerPageProps) {
  const { id } = use(params);
  const [career, setCareer] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/careers/${id}`)
      .then(res => {
        if (res.status === 404) { setError(true); return null; }
        return res.json();
      })
      .then(data => {
        if (data?.career) setCareer(data.career);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (error || !career) {
    notFound();
  }

  return (
    <AppLayout>
      <CareerDetail career={career} />
    </AppLayout>
  );
}
