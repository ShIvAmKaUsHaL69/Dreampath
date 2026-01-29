'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { CareerCard, CareerComparison } from '@/components/careers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { careers, careerCategories } from '@/data/careers';
import { Search, SlidersHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function CareersPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCareers, setSelectedCareers] = useState<string[]>([]);

  const filteredCareers = careers.filter((career) => {
    const matchesSearch =
      career.title.toLowerCase().includes(search.toLowerCase()) ||
      career.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || career.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCompareToggle = (careerId: string) => {
    if (selectedCareers.includes(careerId)) {
      setSelectedCareers(selectedCareers.filter((id) => id !== careerId));
    } else if (selectedCareers.length < 3) {
      setSelectedCareers([...selectedCareers, careerId]);
    }
  };

  const comparisonCareers = careers.filter((c) =>
    selectedCareers.includes(c.id)
  );

  return (
    <AppLayout title="Career Library">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">Explore Careers</h2>
          <p className="text-muted-foreground">
            Discover different career paths and find the right one for you.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search careers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedCategory('all')}>
                All Categories
              </DropdownMenuItem>
              {careerCategories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Comparison Info */}
        {selectedCareers.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <span className="text-sm">
              Selected for comparison: {selectedCareers.length}/3
            </span>
            <div className="flex gap-1">
              {selectedCareers.map((id) => {
                const career = careers.find((c) => c.id === id);
                return (
                  <Badge key={id} variant="secondary">
                    {career?.title}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Career Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCareers.map((career) => (
            <CareerCard
              key={career.id}
              career={career}
              onCompare={handleCompareToggle}
              isSelected={selectedCareers.includes(career.id)}
            />
          ))}
        </div>

        {filteredCareers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No careers found matching your criteria.
            </p>
          </div>
        )}

        {/* Comparison Section */}
        <CareerComparison
          careers={comparisonCareers}
          onRemove={(id) =>
            setSelectedCareers(selectedCareers.filter((cid) => cid !== id))
          }
          onClear={() => setSelectedCareers([])}
        />
      </div>
    </AppLayout>
  );
}
