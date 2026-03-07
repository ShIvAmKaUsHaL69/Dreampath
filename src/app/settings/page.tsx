'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/components/ui/Toaster';
import {
  User, Bell, Moon, Shield, LogOut, Save,
  FileText, ExternalLink, Target,
} from 'lucide-react';

export default function SettingsPage() {
  const { student, setStudent, theme, toggleTheme, apiFetch, logout } = useApp();
  const { showToast } = useToast();
  const [name, setName] = useState(student?.name || '');
  const [email, setEmail] = useState(student?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    dailyReminders: true,
    missedTaskAlerts: true,
    motivationNudges: true,
    examCountdown: true,
  });

  // Load settings from API
  useEffect(() => {
    apiFetch('/api/settings')
      .then(res => { if (res.ok) return res.json(); return null; })
      .then(data => {
        if (data?.notifications) setNotifPrefs(data.notifications);
      })
      .catch(() => {});
  }, [apiFetch]);

  const profileFields = [
    student?.name, student?.email, student?.grade, student?.stream,
    student?.interests?.length, student?.hobbies?.length, student?.skills?.length, student?.goalIntensity,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

  const handleSave = async () => {
    if (!student) return;
    setIsSaving(true);
    try {
      const res = await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ name, email, notifications: notifPrefs }),
      });
      if (res.ok) {
        setStudent({ ...student, name, email });
        // Update localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          user.name = name;
          user.email = email;
          localStorage.setItem('user', JSON.stringify(user));
        }
        showToast('Settings saved successfully.', 'success');
      } else {
        showToast('Failed to save settings.', 'error');
      }
    } catch {
      showToast('Failed to save settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNotifPref = (key: keyof typeof notifPrefs) => {
    setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AppLayout title="Settings">
      <div className="space-y-5 max-w-2xl">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Settings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your account and preferences.
          </p>
        </div>

        {/* Profile Completion */}
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Profile Completion</span>
              </div>
              <span className="text-sm font-bold tabular-nums">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-1.5" />
          </CardContent>
        </Card>

        {/* Profile */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" /> Profile
            </CardTitle>
            <CardDescription className="text-xs">Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Class</Label>
                <Input disabled value={`Class ${student?.grade}`} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Stream</Label>
                <Input disabled value={student?.stream} className="h-9 capitalize" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Goal Intensity</Label>
              <Badge variant="secondary" className="capitalize">
                {student?.goalIntensity?.replace('-', ' ')}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs">Interests</Label>
              {student?.interests && student.interests.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {student.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-xs">{interest}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No interests added.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Skills</Label>
              {student?.skills && student.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {student.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No skills added.</p>
              )}
            </div>

            <Button onClick={handleSave} disabled={isSaving} size="sm" className="gap-1.5 cursor-pointer">
              <Save className="h-3.5 w-3.5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {([
              { key: 'dailyReminders' as const, title: 'Daily Task Reminders', desc: 'Get reminded about daily tasks' },
              { key: 'missedTaskAlerts' as const, title: 'Missed Task Alerts', desc: 'Notify when you miss a task' },
              { key: 'motivationNudges' as const, title: 'Motivation Nudges', desc: 'Receive motivational messages' },
              { key: 'examCountdown' as const, title: 'Exam Countdown', desc: 'Notifications about upcoming exams' },
            ]).map((item, i) => (
              <div key={item.key}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={notifPrefs[item.key]} onCheckedChange={() => toggleNotifPref(item.key)} className="cursor-pointer" />
                </div>
                {i < 3 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Moon className="h-4 w-4" /> Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} className="cursor-pointer" />
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" /> Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" size="sm" className="w-full justify-start cursor-pointer" onClick={() => showToast('Change password coming soon.', 'info')}>Change Password</Button>
            <Button variant="outline" size="sm" className="w-full justify-start cursor-pointer" onClick={() => showToast('Export feature coming soon.', 'info')}>Export My Data</Button>
            <Separator />
            <Button variant="destructive" size="sm" className="w-full justify-start gap-2 cursor-pointer" onClick={() => logout()}>
              <LogOut className="h-3.5 w-3.5" /> Logout
            </Button>
          </CardContent>
        </Card>

        {/* Legal */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" /> Legal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="#privacy" className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer group">
              <span className="text-sm font-medium">Privacy Policy</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </a>
            <a href="#terms" className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer group">
              <span className="text-sm font-medium">Terms of Service</span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </a>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
