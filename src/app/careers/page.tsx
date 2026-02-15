'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { CareerCard, CareerComparison } from '@/components/careers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { careers, careerCategories } from '@/data/careers';
import { Search, X, Compass, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const streamOptions = ['All Streams', 'Science', 'Commerce', 'Arts'] as const;
const difficultyOptions = ['All Levels', 'Low', 'Medium', 'High', 'Very High'] as const;

export default function CareersPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStream, setSelectedStream] = useState<string>('All Streams');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All Levels');
  const [selectedCareers, setSelectedCareers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredCareers = careers.filter((career) => {
    const matchesSearch =
      career.title.toLowerCase().includes(search.toLowerCase()) ||
      career.description.toLowerCase().includes(search.toLowerCase()) ||
      career.skillsRequired.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'all' || career.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === 'All Levels' ||
      career.realityCheck.difficulty === selectedDifficulty.toLowerCase().replace(' ', '-');
    const matchesStream =
      selectedStream === 'All Streams' ||
      career.academicPath.some(p =>
        p.toLowerCase().includes(selectedStream.toLowerCase())
      ) ||
      (selectedStream === 'Arts' && career.category === 'Creative Arts');
    return matchesSearch && matchesCategory && matchesDifficulty && matchesStream;
  });

  const handleCompareToggle = (careerId: string) => {
    if (selectedCareers.includes(careerId)) {
      setSelectedCareers(selectedCareers.filter((id) => id !== careerId));
    } else if (selectedCareers.length < 3) {
      setSelectedCareers([...selectedCareers, careerId]);
    }
  };

  const comparisonCareers = careers.filter((c) => selectedCareers.includes(c.id));

  const activeFilterCount = [
    selectedCategory !== 'all',
    selectedStream !== 'All Streams',
    selectedDifficulty !== 'All Levels',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedStream('All Streams');
    setSelectedDifficulty('All Levels');
    setSearch('');
  };

  return (
    <AppLayout title="Careers">
      <div className="space-y-5 ">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold tracking-tight">Explore Careers</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Browse career paths and find the right one for you.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search careers, skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-9 cursor-pointer">
                  {selectedCategory === 'all' ? 'Category' : selectedCategory}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedCategory('all')} className="cursor-pointer">
                  All Categories
                </DropdownMenuItem>
                {careerCategories.map((category) => (
                  <DropdownMenuItem key={category} onClick={() => setSelectedCategory(category)} className="cursor-pointer">
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              className="gap-2 h-9 cursor-pointer"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 grid place-items-center rounded-full text-[9px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Stream:</span>
                <div className="flex flex-wrap gap-1">
                  {streamOptions.map((stream) => (
                    <Button
                      key={stream}
                      variant={selectedStream === stream ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs rounded-full cursor-pointer"
                      onClick={() => setSelectedStream(stream)}
                    >
                      {stream}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Difficulty:</span>
                <div className="flex flex-wrap gap-1">
                  {difficultyOptions.map((diff) => (
                    <Button
                      key={diff}
                      variant={selectedDifficulty === diff ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs rounded-full cursor-pointer"
                      onClick={() => setSelectedDifficulty(diff)}
                    >
                      {diff}
                    </Button>
                  ))}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" className="text-xs text-destructive cursor-pointer" onClick={clearFilters}>
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Comparison */}
        {selectedCareers.length > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg border text-sm">
            <span className="text-muted-foreground">Comparing:</span>
            {selectedCareers.map((id) => {
              const career = careers.find((c) => c.id === id);
              return <Badge key={id} variant="secondary">{career?.title}</Badge>;
            })}
            <span className="text-muted-foreground">{selectedCareers.length}/3</span>
          </div>
        )}

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <EmptyState
            icon={<Compass className="h-8 w-8" />}
            title="No careers found"
            description="Try adjusting your search or filters."
            actionLabel="Clear Filters"
            onAction={clearFilters}
          />
        )}

        <CareerComparison
          careers={comparisonCareers}
          onRemove={(id) => setSelectedCareers(selectedCareers.filter((cid) => cid !== id))}
          onClear={() => setSelectedCareers([])}
        />
      </div>
    </AppLayout>
  );
}
