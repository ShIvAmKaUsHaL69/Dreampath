'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { ResourceCard } from '@/components/resources';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockResources } from '@/data/mockData';
import { Search } from 'lucide-react';

export default function ResourcesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const filteredResources = mockResources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(search.toLowerCase()) ||
      resource.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || resource.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <AppLayout title="Resources">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Study Resources</h2>
          <p className="text-muted-foreground">
            Curated articles, videos, and guides to help you on your journey.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
              <TabsTrigger value="article">Articles</TabsTrigger>
              <TabsTrigger value="exam-guide">Guides</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Resources Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No resources found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
