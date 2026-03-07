'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/components/ui/Toaster';
import {
  LayoutDashboard, Users, Briefcase, BookOpen, Bell, BarChart3,
  Search, Plus, Edit, Trash2, ArrowLeft, Loader2, ToggleLeft, ToggleRight,
  X, Save, Eye, ListTodo, ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

/* ── Types ──────────────────────── */
interface DashboardStats {
  totalUsers: number; activeUsers: number; totalCareers: number;
  totalResources: number; taskCompletionRate: number; avgStreakDays: number;
  popularCareers: { title: string; category: string }[];
  recentUsers: { id: number; name: string; email: string; created_at: string }[];
}
interface AdminUser {
  id: number; name: string; email: string; role: string; is_active: boolean;
  grade: number; stream: string; created_at: string; streak: number; total_points: number;
}
interface AdminCareer {
  id: number; slug: string; title: string; category: string; description: string;
  difficulty: string; growth_potential: string; study_duration: string; average_salary: string;
  risk_level: string; daily_life: string; lifestyle: string;
  competition: string; academic_path: string; entrance_exams: string; college_types: string; backup_options: string;
}
interface AdminResource {
  id: number; title: string; type: string; url: string; description: string; career_id: number | null; career_title: string;
}
interface DefaultTask {
  id: number; title: string; description: string; category: string; priority: string;
}

/* ── Helpers ──────────────────────── */
const CATEGORIES = ['Technology', 'Healthcare', 'Business & Finance', 'Design & Construction', 'Law & Governance', 'Science & Research', 'Media & Communication', 'Education', 'Arts & Entertainment'];
const LEVELS = ['low', 'medium', 'high', 'very-high'];
const TASK_CATEGORIES = ['study', 'skill', 'research', 'self-improvement'];
const PRIORITIES = ['low', 'medium', 'high'];
const RESOURCE_TYPES = ['article', 'video', 'course', 'book', 'tool'];

export default function AdminPage() {
  const { apiFetch } = useApp();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [careers, setCareers] = useState<AdminCareer[]>([]);
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  // Form states
  const [showCareerForm, setShowCareerForm] = useState(false);
  const [editingCareer, setEditingCareer] = useState<AdminCareer | null>(null);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showTasksFor, setShowTasksFor] = useState<number | null>(null);
  const [defaultTasks, setDefaultTasks] = useState<DefaultTask[]>([]);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [userRoadmaps, setUserRoadmaps] = useState<any[]>([]);

  // Career form
  const [cf, setCf] = useState({ slug: '', title: '', category: CATEGORIES[0], description: '', dailyLife: '', studyDuration: '', averageSalary: '', lifestyle: '', growthPotential: 'medium', riskLevel: 'medium', competition: 'medium', difficulty: 'medium', academicPath: '', entranceExams: '', collegeTypes: '', backupOptions: '', skillsRequired: '' });
  // Resource form
  const [rf, setRf] = useState({ title: '', type: 'article', url: '', description: '', careerId: '' });
  // Default task form
  const [tf, setTf] = useState({ title: '', description: '', category: 'study', priority: 'medium' });
  // Notification form
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ── Fetchers ──────────────────────── */
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try { const res = await apiFetch('/api/admin/dashboard'); if (res.ok) setStats((await res.json()).stats); }
    catch {} finally { setLoading(false); }
  }, [apiFetch]);

  const fetchUsers = useCallback(async () => {
    const res = await apiFetch(`/api/admin/users?search=${searchQuery}&limit=50`);
    if (res.ok) { const d = await res.json(); setUsers(d.users); setTotalUsers(d.total); }
  }, [apiFetch, searchQuery]);

  const fetchCareers = useCallback(async () => {
    const res = await apiFetch('/api/admin/careers');
    if (res.ok) setCareers((await res.json()).careers);
  }, [apiFetch]);

  const fetchResources = useCallback(async () => {
    const res = await apiFetch('/api/admin/resources');
    if (res.ok) setResources((await res.json()).resources);
  }, [apiFetch]);

  const fetchNotifications = useCallback(async () => {
    const res = await apiFetch('/api/admin/notifications');
    if (res.ok) setNotifications((await res.json()).notifications || []);
  }, [apiFetch]);

  const fetchDefaultTasks = async (careerId: number) => {
    const res = await apiFetch(`/api/admin/careers/${careerId}/tasks`);
    if (res.ok) setDefaultTasks((await res.json()).tasks);
  };

  const fetchUserDetail = async (userId: number) => {
    const res = await apiFetch(`/api/admin/users/${userId}`);
    if (res.ok) {
      const data = await res.json();
      setViewingUser(data.user);
    }
    // Fetch user tasks
    const tRes = await apiFetch(`/api/admin/users/${userId}/tasks`);
    if (tRes.ok) setUserTasks((await tRes.json()).tasks || []);
    // Fetch user roadmaps
    const rRes = await apiFetch(`/api/admin/users/${userId}/roadmaps`);
    if (rRes.ok) setUserRoadmaps((await rRes.json()).roadmaps || []);
  };

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'careers') fetchCareers();
    if (activeTab === 'resources') fetchResources();
    if (activeTab === 'notifications') fetchNotifications();
  }, [activeTab, fetchUsers, fetchCareers, fetchResources, fetchNotifications]);

  useEffect(() => {
    if (activeTab === 'users') { const t = setTimeout(fetchUsers, 300); return () => clearTimeout(t); }
  }, [searchQuery, activeTab, fetchUsers]);

  /* ── Actions ──────────────────────── */
  const toggleUserActive = async (userId: number, active: boolean) => {
    await apiFetch(`/api/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify({ is_active: !active }) });
    fetchUsers();
  };

  const deleteCareer = async (id: number) => {
    if (!confirm('Delete this career and all related data?')) return;
    const res = await apiFetch(`/api/admin/careers/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Career deleted', 'success'); fetchCareers(); }
  };

  const deleteResource = async (id: number) => {
    if (!confirm('Delete this resource?')) return;
    const res = await apiFetch(`/api/admin/resources/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Resource deleted', 'success'); fetchResources(); }
  };

  const saveCareer = async () => {
    if (!cf.title || !cf.category) { showToast('Title and category are required', 'error'); return; }
    setSaving(true);
    try {
      const payload = {
        slug: cf.slug || cf.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        title: cf.title, category: cf.category, description: cf.description,
        dailyLife: cf.dailyLife, studyDuration: cf.studyDuration, averageSalary: cf.averageSalary,
        lifestyle: cf.lifestyle, growthPotential: cf.growthPotential, riskLevel: cf.riskLevel,
        competition: cf.competition, difficulty: cf.difficulty,
        academicPath: cf.academicPath.split('\n').filter(Boolean),
        entranceExams: cf.entranceExams.split(',').map(s => s.trim()).filter(Boolean),
        collegeTypes: cf.collegeTypes.split(',').map(s => s.trim()).filter(Boolean),
        backupOptions: cf.backupOptions.split(',').map(s => s.trim()).filter(Boolean),
        skillsRequired: cf.skillsRequired.split(',').map(s => s.trim()).filter(Boolean),
      };

      let res;
      if (editingCareer) {
        res = await apiFetch(`/api/admin/careers/${editingCareer.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        res = await apiFetch('/api/admin/careers', { method: 'POST', body: JSON.stringify(payload) });
      }

      if (res.ok) {
        showToast(editingCareer ? 'Career updated!' : 'Career created!', 'success');
        setShowCareerForm(false); setEditingCareer(null);
        setCf({ slug: '', title: '', category: CATEGORIES[0], description: '', dailyLife: '', studyDuration: '', averageSalary: '', lifestyle: '', growthPotential: 'medium', riskLevel: 'medium', competition: 'medium', difficulty: 'medium', academicPath: '', entranceExams: '', collegeTypes: '', backupOptions: '', skillsRequired: '' });
        fetchCareers();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save', 'error');
      }
    } finally { setSaving(false); }
  };

  const editCareer = (c: AdminCareer) => {
    const parse = (v: string) => { try { return JSON.parse(v); } catch { return []; } };
    setCf({
      slug: c.slug, title: c.title, category: c.category, description: c.description,
      dailyLife: c.daily_life || '', studyDuration: c.study_duration || '', averageSalary: c.average_salary || '',
      lifestyle: c.lifestyle || '', growthPotential: c.growth_potential || 'medium', riskLevel: c.risk_level || 'medium',
      competition: c.competition || 'medium', difficulty: c.difficulty || 'medium',
      academicPath: parse(c.academic_path).join('\n'), entranceExams: parse(c.entrance_exams).join(', '),
      collegeTypes: parse(c.college_types).join(', '), backupOptions: parse(c.backup_options).join(', '),
      skillsRequired: '', // Will need to fetch from career_skills
    });
    setEditingCareer(c);
    setShowCareerForm(true);
  };

  const saveResource = async () => {
    if (!rf.title || !rf.url) { showToast('Title and URL are required', 'error'); return; }
    setSaving(true);
    try {
      const res = await apiFetch('/api/admin/resources', {
        method: 'POST',
        body: JSON.stringify({ ...rf, careerId: rf.careerId ? parseInt(rf.careerId) : null }),
      });
      if (res.ok) {
        showToast('Resource created!', 'success');
        setShowResourceForm(false);
        setRf({ title: '', type: 'article', url: '', description: '', careerId: '' });
        fetchResources();
      }
    } finally { setSaving(false); }
  };

  const addDefaultTask = async () => {
    if (!tf.title || !showTasksFor) return;
    const res = await apiFetch(`/api/admin/careers/${showTasksFor}/tasks`, {
      method: 'POST', body: JSON.stringify(tf),
    });
    if (res.ok) {
      showToast('Task added', 'success');
      setTf({ title: '', description: '', category: 'study', priority: 'medium' });
      fetchDefaultTasks(showTasksFor);
    }
  };

  const deleteDefaultTask = async (taskId: number) => {
    if (!showTasksFor) return;
    await apiFetch(`/api/admin/careers/${showTasksFor}/tasks`, {
      method: 'DELETE', body: JSON.stringify({ taskId }),
    });
    fetchDefaultTasks(showTasksFor);
  };

  const sendNotification = async () => {
    if (!notifTitle || !notifMessage) return;
    setSending(true);
    try {
      const res = await apiFetch('/api/admin/notifications', {
        method: 'POST', body: JSON.stringify({ title: notifTitle, message: notifMessage, target: 'all' }),
      });
      if (res.ok) { setNotifTitle(''); setNotifMessage(''); fetchNotifications(); showToast('Notification sent!', 'success'); }
    } finally { setSending(false); }
  };

  /* ── Shared Components ──────────────────────── */
  const LevelDropdown = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-between h-9 text-xs capitalize cursor-pointer">
            {value.replace('-', ' ')} <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {LEVELS.map(l => <DropdownMenuItem key={l} onClick={() => onChange(l)} className="capitalize cursor-pointer">{l.replace('-', ' ')}</DropdownMenuItem>)}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  /* ── Render ──────────────────────── */
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard"><Button variant="ghost" size="icon" className="cursor-pointer"><ArrowLeft className="h-5 w-5" /></Button></Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">D</div>
              <span className="text-xl font-bold">DreamPath Admin</span>
            </div>
          </div>
          <Badge variant="outline">Super Admin</Badge>
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
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map((item) => (
              <Button key={item.id} variant={activeTab === item.id ? 'secondary' : 'ghost'} className="w-full justify-start gap-2 cursor-pointer" onClick={() => { setActiveTab(item.id); setShowCareerForm(false); setShowResourceForm(false); setShowTasksFor(null); setViewingUser(null); }}>
                <item.icon className="h-4 w-4" /> {item.label}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6">

          {/* ── Dashboard ──────────────────────── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Admin Dashboard</h2>
              {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : stats && (
                <>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[
                      { label: 'Total Users', value: stats.totalUsers },
                      { label: 'Active Today', value: stats.activeUsers },
                      { label: 'Total Careers', value: stats.totalCareers },
                      { label: 'Total Resources', value: stats.totalResources },
                      { label: 'Task Completion', value: `${stats.taskCompletionRate}%` },
                      { label: 'Avg Streak', value: `${stats.avgStreakDays} days` },
                    ].map(s => (
                      <Card key={s.label}><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{s.value}</div></CardContent></Card>
                    ))}
                  </div>
                  {(stats.recentUsers || []).length > 0 && (
                    <Card><CardHeader><CardTitle>Recent Signups</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader><TableBody>{stats.recentUsers.map(u => (<TableRow key={u.id}><TableCell className="font-medium">{u.name}</TableCell><TableCell>{u.email}</TableCell><TableCell className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Users ──────────────────────── */}
          {activeTab === 'users' && !viewingUser && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">User Management ({totalUsers})</h2>
              </div>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <Card><CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead>
                    <TableHead>Grade</TableHead><TableHead>Streak</TableHead><TableHead>Points</TableHead>
                    <TableHead>Status</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell><Badge variant={user.role === 'superadmin' ? 'default' : 'secondary'} className="capitalize">{user.role}</Badge></TableCell>
                        <TableCell>{user.grade ? `${user.grade} / ${user.stream || '-'}` : '-'}</TableCell>
                        <TableCell>{user.streak || 0}</TableCell>
                        <TableCell>{user.total_points || 0}</TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'default' : 'outline'} className={user.is_active ? 'bg-green-100 text-green-700' : ''}>{user.is_active ? 'Active' : 'Inactive'}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => fetchUserDetail(user.id)} title="View Details"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => toggleUserActive(user.id, user.is_active)} title={user.is_active ? 'Deactivate' : 'Activate'}>
                            {user.is_active ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent></Card>
            </div>
          )}

          {/* ── User Detail ──────────────────────── */}
          {activeTab === 'users' && viewingUser && (
            <div className="space-y-6">
              <Button variant="ghost" onClick={() => setViewingUser(null)} className="gap-2 cursor-pointer"><ArrowLeft className="h-4 w-4" /> Back to Users</Button>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold">{viewingUser.name?.[0]}</div>
                <div>
                  <h2 className="text-xl font-bold">{viewingUser.name}</h2>
                  <p className="text-sm text-muted-foreground">{viewingUser.email}</p>
                </div>
                <Badge variant={viewingUser.role === 'superadmin' ? 'default' : 'secondary'} className="capitalize ml-auto">{viewingUser.role}</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Grade</div><div className="font-semibold">Class {viewingUser.grade || '-'}</div></CardContent></Card>
                <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Stream</div><div className="font-semibold capitalize">{viewingUser.stream || '-'}</div></CardContent></Card>
                <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Streak</div><div className="font-semibold">{viewingUser.streak || 0} days</div></CardContent></Card>
                <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Points</div><div className="font-semibold">{viewingUser.total_points || 0}</div></CardContent></Card>
              </div>

              {/* User's Tasks */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><ListTodo className="h-4 w-4" /> Tasks ({userTasks.length})</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Category</TableHead><TableHead>Priority</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {userTasks.map((t: any) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.title}</TableCell>
                          <TableCell><Badge variant="secondary" className="capitalize">{t.category}</Badge></TableCell>
                          <TableCell><Badge variant="outline" className="capitalize">{t.priority}</Badge></TableCell>
                          <TableCell className="text-muted-foreground">{t.due_date ? new Date(t.due_date).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>{t.completed ? <Badge className="bg-green-100 text-green-700">Done</Badge> : <Badge variant="outline">Pending</Badge>}</TableCell>
                        </TableRow>
                      ))}
                      {userTasks.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No tasks</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* User's Roadmaps */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Roadmaps ({userRoadmaps.length})</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader><TableRow><TableHead>Career Path</TableHead><TableHead>Progress</TableHead><TableHead>Start</TableHead><TableHead>Target</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {userRoadmaps.map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2"><div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${r.progress}%` }} /></div><span className="text-xs">{r.progress}%</span></div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{r.start_date ? new Date(r.start_date).toLocaleDateString() : '-'}</TableCell>
                          <TableCell className="text-muted-foreground">{r.end_date ? new Date(r.end_date).toLocaleDateString() : '-'}</TableCell>
                        </TableRow>
                      ))}
                      {userRoadmaps.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No roadmaps</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* User Interests/Skills */}
              {(viewingUser.interests?.length > 0 || viewingUser.skills?.length > 0 || viewingUser.hobbies?.length > 0) && (
                <div className="grid gap-4 md:grid-cols-3">
                  {viewingUser.interests?.length > 0 && <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Interests</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-1">{viewingUser.interests.map((i: string) => <Badge key={i} variant="secondary">{i}</Badge>)}</div></CardContent></Card>}
                  {viewingUser.skills?.length > 0 && <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Skills</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-1">{viewingUser.skills.map((s: string) => <Badge key={s} variant="outline">{s}</Badge>)}</div></CardContent></Card>}
                  {viewingUser.hobbies?.length > 0 && <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Hobbies</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-1">{viewingUser.hobbies.map((h: string) => <Badge key={h} variant="secondary">{h}</Badge>)}</div></CardContent></Card>}
                </div>
              )}
            </div>
          )}

          {/* ── Careers ──────────────────────── */}
          {activeTab === 'careers' && !showTasksFor && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Manage Careers</h2>
                <Button className="gap-2 cursor-pointer" onClick={() => { setShowCareerForm(true); setEditingCareer(null); setCf({ slug: '', title: '', category: CATEGORIES[0], description: '', dailyLife: '', studyDuration: '', averageSalary: '', lifestyle: '', growthPotential: 'medium', riskLevel: 'medium', competition: 'medium', difficulty: 'medium', academicPath: '', entranceExams: '', collegeTypes: '', backupOptions: '', skillsRequired: '' }); }}>
                  <Plus className="h-4 w-4" /> Add Career
                </Button>
              </div>

              {/* Career Form */}
              {showCareerForm && (
                <Card className="border-primary/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{editingCareer ? 'Edit Career' : 'Add New Career'}</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => setShowCareerForm(false)} className="cursor-pointer"><X className="h-4 w-4" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5"><Label className="text-xs">Title *</Label><Input value={cf.title} onChange={e => setCf({ ...cf, title: e.target.value })} placeholder="e.g., Software Engineer" /></div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Category *</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="outline" className="w-full justify-between h-9 text-sm cursor-pointer">{cf.category} <ChevronDown className="h-3 w-3" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent className="max-h-60 overflow-y-auto">{CATEGORIES.map(c => <DropdownMenuItem key={c} onClick={() => setCf({ ...cf, category: c })} className="cursor-pointer">{c}</DropdownMenuItem>)}</DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="space-y-1.5"><Label className="text-xs">Description</Label><Textarea value={cf.description} onChange={e => setCf({ ...cf, description: e.target.value })} placeholder="Brief description of the career..." className="min-h-[60px]" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5"><Label className="text-xs">Study Duration</Label><Input value={cf.studyDuration} onChange={e => setCf({ ...cf, studyDuration: e.target.value })} placeholder="e.g., 4 years (B.Tech)" /></div>
                      <div className="space-y-1.5"><Label className="text-xs">Average Salary</Label><Input value={cf.averageSalary} onChange={e => setCf({ ...cf, averageSalary: e.target.value })} placeholder="e.g., ₹8-25 LPA" /></div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <LevelDropdown value={cf.growthPotential} onChange={v => setCf({ ...cf, growthPotential: v })} label="Growth" />
                      <LevelDropdown value={cf.riskLevel} onChange={v => setCf({ ...cf, riskLevel: v })} label="Risk" />
                      <LevelDropdown value={cf.competition} onChange={v => setCf({ ...cf, competition: v })} label="Competition" />
                      <LevelDropdown value={cf.difficulty} onChange={v => setCf({ ...cf, difficulty: v })} label="Difficulty" />
                    </div>
                    <div className="space-y-1.5"><Label className="text-xs">Daily Life</Label><Textarea value={cf.dailyLife} onChange={e => setCf({ ...cf, dailyLife: e.target.value })} placeholder="What does a typical day look like?" className="min-h-[50px]" /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Lifestyle</Label><Input value={cf.lifestyle} onChange={e => setCf({ ...cf, lifestyle: e.target.value })} placeholder="e.g., Office work, flexible hours" /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Academic Path (one step per line)</Label><Textarea value={cf.academicPath} onChange={e => setCf({ ...cf, academicPath: e.target.value })} placeholder={"Class 10 → Science stream\nClass 12 → PCM\nJEE/NEET exam\nB.Tech/MBBS"} className="min-h-[80px]" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5"><Label className="text-xs">Entrance Exams (comma-separated)</Label><Input value={cf.entranceExams} onChange={e => setCf({ ...cf, entranceExams: e.target.value })} placeholder="JEE, NEET, CAT" /></div>
                      <div className="space-y-1.5"><Label className="text-xs">College Types (comma-separated)</Label><Input value={cf.collegeTypes} onChange={e => setCf({ ...cf, collegeTypes: e.target.value })} placeholder="IIT, NIT, Private" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5"><Label className="text-xs">Backup Options (comma-separated)</Label><Input value={cf.backupOptions} onChange={e => setCf({ ...cf, backupOptions: e.target.value })} placeholder="Teaching, Consulting" /></div>
                      <div className="space-y-1.5"><Label className="text-xs">Skills Required (comma-separated)</Label><Input value={cf.skillsRequired} onChange={e => setCf({ ...cf, skillsRequired: e.target.value })} placeholder="Math, Physics, Problem Solving" /></div>
                    </div>
                    <Button onClick={saveCareer} disabled={saving} className="cursor-pointer gap-2">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {editingCareer ? 'Update Career' : 'Create Career'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Career Table */}
              <Card><CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Difficulty</TableHead><TableHead>Growth</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {careers.map(career => (
                      <TableRow key={career.id}>
                        <TableCell className="font-medium">{career.title}</TableCell>
                        <TableCell><Badge variant="secondary">{career.category}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{(career.difficulty || '').replace('-', ' ')}</Badge></TableCell>
                        <TableCell><Badge className="capitalize">{(career.growth_potential || '').replace('-', ' ')}</Badge></TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => { setShowTasksFor(career.id); fetchDefaultTasks(career.id); }} title="Manage Tasks"><ListTodo className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => editCareer(career)} title="Edit"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => deleteCareer(career.id)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent></Card>
            </div>
          )}

          {/* ── Career Predefined Tasks ──────────────────────── */}
          {activeTab === 'careers' && showTasksFor && (
            <div className="space-y-6">
              <Button variant="ghost" onClick={() => setShowTasksFor(null)} className="gap-2 cursor-pointer"><ArrowLeft className="h-4 w-4" /> Back to Careers</Button>
              <h2 className="text-2xl font-bold">Predefined Tasks — {careers.find(c => c.id === showTasksFor)?.title}</h2>
              <p className="text-sm text-muted-foreground">These tasks are auto-added when a user selects this career.</p>

              {/* Add Task */}
              <Card className="border-primary/30">
                <CardHeader className="pb-3"><CardTitle className="text-sm">Add Predefined Task</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label className="text-xs">Title *</Label><Input value={tf.title} onChange={e => setTf({ ...tf, title: e.target.value })} placeholder="e.g., Research entrance exams" /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Description</Label><Input value={tf.description} onChange={e => setTf({ ...tf, description: e.target.value })} placeholder="Optional description" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Category</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="w-full justify-between h-9 text-xs capitalize cursor-pointer">{tf.category} <ChevronDown className="h-3 w-3" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>{TASK_CATEGORIES.map(c => <DropdownMenuItem key={c} onClick={() => setTf({ ...tf, category: c })} className="capitalize cursor-pointer">{c}</DropdownMenuItem>)}</DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Priority</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="w-full justify-between h-9 text-xs capitalize cursor-pointer">{tf.priority} <ChevronDown className="h-3 w-3" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>{PRIORITIES.map(p => <DropdownMenuItem key={p} onClick={() => setTf({ ...tf, priority: p })} className="capitalize cursor-pointer">{p}</DropdownMenuItem>)}</DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addDefaultTask} disabled={!tf.title} className="w-full cursor-pointer gap-2"><Plus className="h-4 w-4" /> Add</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tasks List */}
              <Card><CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Description</TableHead><TableHead>Category</TableHead><TableHead>Priority</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {defaultTasks.map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.title}</TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">{t.description || '-'}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize">{t.category}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{t.priority}</Badge></TableCell>
                        <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => deleteDefaultTask(t.id)} className="cursor-pointer"><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                      </TableRow>
                    ))}
                    {defaultTasks.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No predefined tasks yet. Add tasks above.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent></Card>
            </div>
          )}

          {/* ── Resources ──────────────────────── */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Manage Resources</h2>
                <Button className="gap-2 cursor-pointer" onClick={() => setShowResourceForm(!showResourceForm)}>
                  {showResourceForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {showResourceForm ? 'Cancel' : 'Add Resource'}
                </Button>
              </div>

              {showResourceForm && (
                <Card className="border-primary/30">
                  <CardHeader><CardTitle>Add New Resource</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5"><Label className="text-xs">Title *</Label><Input value={rf.title} onChange={e => setRf({ ...rf, title: e.target.value })} placeholder="Resource title" /></div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Type</Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="outline" className="w-full justify-between h-9 text-sm capitalize cursor-pointer">{rf.type} <ChevronDown className="h-3 w-3" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent>{RESOURCE_TYPES.map(t => <DropdownMenuItem key={t} onClick={() => setRf({ ...rf, type: t })} className="capitalize cursor-pointer">{t}</DropdownMenuItem>)}</DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="space-y-1.5"><Label className="text-xs">URL *</Label><Input value={rf.url} onChange={e => setRf({ ...rf, url: e.target.value })} placeholder="https://..." /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Description</Label><Input value={rf.description} onChange={e => setRf({ ...rf, description: e.target.value })} placeholder="Brief description" /></div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Link to Career (optional)</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="outline" className="w-full justify-between h-9 text-sm cursor-pointer">{rf.careerId ? careers.find(c => c.id === parseInt(rf.careerId))?.title || 'Select' : 'None'} <ChevronDown className="h-3 w-3" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent className="max-h-60 overflow-y-auto">
                          <DropdownMenuItem onClick={() => setRf({ ...rf, careerId: '' })} className="cursor-pointer">None</DropdownMenuItem>
                          {careers.map(c => <DropdownMenuItem key={c.id} onClick={() => setRf({ ...rf, careerId: String(c.id) })} className="cursor-pointer">{c.title}</DropdownMenuItem>)}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Button onClick={saveResource} disabled={saving} className="cursor-pointer gap-2">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Create Resource
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card><CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Career</TableHead><TableHead>URL</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {resources.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.title}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize">{r.type.replace('-', ' ')}</Badge></TableCell>
                        <TableCell>{r.career_title || '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate"><a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{r.url}</a></TableCell>
                        <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => deleteResource(r.id)} className="cursor-pointer"><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent></Card>
            </div>
          )}

          {/* ── Notifications ──────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Notifications</h2>
              <Card>
                <CardHeader><CardTitle>Send Notification</CardTitle><CardDescription>Send a push notification to all users</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Notification title" value={notifTitle} onChange={e => setNotifTitle(e.target.value)} />
                  <Textarea placeholder="Message body..." value={notifMessage} onChange={e => setNotifMessage(e.target.value)} className="min-h-[80px]" />
                  <Button onClick={sendNotification} disabled={sending || !notifTitle || !notifMessage} className="gap-2 cursor-pointer">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                    {sending ? 'Sending...' : 'Send to All Users'}
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Notification History</CardTitle></CardHeader>
                <CardContent className="p-0"><Table>
                  <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Message</TableHead><TableHead>Target</TableHead><TableHead>Sent</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {notifications.map((n: any) => (
                      <TableRow key={n.id}>
                        <TableCell className="font-medium">{n.title}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{n.body || n.message}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{n.target}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{new Date(n.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {notifications.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No notifications sent yet.</TableCell></TableRow>}
                  </TableBody>
                </Table></CardContent>
              </Card>
            </div>
          )}

          {/* ── Analytics ──────────────────────── */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Analytics</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Card><CardHeader><CardTitle>Platform Overview</CardTitle></CardHeader><CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Total Users', value: stats?.totalUsers || 0 },
                      { label: 'Total Careers', value: stats?.totalCareers || 0 },
                      { label: 'Total Resources', value: stats?.totalResources || 0 },
                      { label: 'Avg Streak', value: `${stats?.avgStreakDays || 0} days` },
                      { label: 'Completion Rate', value: `${stats?.taskCompletionRate || 0}%` },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between py-2 border-b last:border-0"><span className="text-muted-foreground">{item.label}</span><span className="font-semibold">{item.value}</span></div>
                    ))}
                  </div>
                </CardContent></Card>
                <Card><CardHeader><CardTitle>Career Distribution</CardTitle></CardHeader><CardContent>
                  <div className="space-y-3">
                    {(stats?.popularCareers || []).map((career, i) => (
                      <div key={i} className="flex justify-between text-sm"><span>{career.title}</span><Badge variant="secondary">{career.category}</Badge></div>
                    ))}
                  </div>
                </CardContent></Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
