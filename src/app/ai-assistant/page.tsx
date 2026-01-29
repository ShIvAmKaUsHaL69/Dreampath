'use client';

import { AppLayout } from '@/components/layout';
import { AIChat } from '@/components/ai';

export default function AIAssistantPage() {
  return (
    <AppLayout title="AI Assistant">
      <AIChat />
    </AppLayout>
  );
}
