'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { careers } from '@/data/careers';
import { mockResources, mockTasks } from '@/data/mockData';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BookOpen,
  ListTodo,
  BarChart3,
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

const mockStats = {
  totalUsers: 1247,
  activeUsers: 892,
  totalCareers: careers.length,
  totalResources: mockResources.length,
  taskCompletionRate: 72,
  avgStreakDays: 8.5,
};

const mockUserEngagement = [
  { date: 'Mon', users: 120 },
  { date: 'Tue', users: 145 },
  { date: 'Wed', users: 132 },
  { date: 'Thu', users: 168 },
  { date: 'Fri', users: 155 },
  { date: 'Sat', users: 98 },
  { date: 'Sun', users: 87 },
];

const popularCareers = careers.slice(0, 5).map((c, i) => ({
  ...c,
  views: 1000 - i * 150,
  selections: 200 - i * 30,
}));

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                D
              </div>
              <span className="text-xl font-bold">DreamPath Admin</span>
            </div>
          </div>
          <Badge variant="outline">Admin Panel</Badge>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card min-h-[calc(100vh-65px)] p-4">
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'careers', label: 'Careers', icon: Briefcase },
              { id: 'resources', label: 'Resources', icon: BookOpen },
              { id: 'tasks', label: 'Tasks', icon: ListTodo },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Admin Dashboard</h2>

              {/* Stats Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockStats.totalUsers}</div>
                    <p className="text-xs text-green-500">+12% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active Users (Today)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockStats.activeUsers}</div>
                    <p className="text-xs text-muted-foreground">71% of total users</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Avg. Streak Days
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockStats.avgStreakDays}</div>
                    <p className="text-xs text-green-500">+0.5 from last week</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Careers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockStats.totalCareers}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockStats.totalResources}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Task Completion Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockStats.taskCompletionRate}%</div>
                  </CardContent>
                </Card>
              </div>

              {/* Popular Careers */}
              <Card>
                <CardHeader>
                  <CardTitle>Popular Careers</CardTitle>
                  <CardDescription>Most viewed and selected careers</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Career</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                        <TableHead className="text-right">Selections</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {popularCareers.map((career) => (
                        <TableRow key={career.id}>
                          <TableCell className="font-medium">{career.title}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{career.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{career.views}</TableCell>
                          <TableCell className="text-right">{career.selections}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Careers Tab */}
          {activeTab === 'careers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Manage Careers</h2>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Career
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search careers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 max-w-sm"
                />
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Growth</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {careers
                        .filter((c) =>
                          c.title.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((career) => (
                          <TableRow key={career.id}>
                            <TableCell className="font-medium">{career.title}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{career.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="capitalize"
                              >
                                {career.realityCheck.difficulty.replace('-', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="capitalize">
                                {career.growthPotential.replace('-', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Manage Resources</h2>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Resource
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Career</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockResources.map((resource) => (
                        <TableRow key={resource.id}>
                          <TableCell className="font-medium">{resource.title}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {resource.type.replace('-', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{resource.careerId || 'General'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">User Management</h2>
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    User management features coming soon.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Manage Tasks</h2>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Task Template
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {task.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="capitalize"
                            >
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Analytics</h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>User Engagement (This Week)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end justify-between gap-2">
                      {mockUserEngagement.map((day) => (
                        <div key={day.date} className="flex flex-col items-center gap-2 flex-1">
                          <div
                            className="w-full bg-primary rounded-t"
                            style={{ height: `${(day.users / 200) * 100}%` }}
                          />
                          <span className="text-xs text-muted-foreground">{day.date}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Career Interest Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { category: 'Technology', percentage: 35 },
                        { category: 'Healthcare', percentage: 25 },
                        { category: 'Finance', percentage: 20 },
                        { category: 'Law', percentage: 12 },
                        { category: 'Others', percentage: 8 },
                      ].map((item) => (
                        <div key={item.category} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{item.category}</span>
                            <span>{item.percentage}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
