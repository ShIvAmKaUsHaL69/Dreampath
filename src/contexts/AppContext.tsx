'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Student, Task, Roadmap, OnboardingData, ChatMessage } from '@/types';
import { useRouter } from 'next/navigation';

// ── API helper ──────────────────────────────────────────────
async function apiFetch(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    // Try refresh
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (refreshToken) {
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        headers['Authorization'] = `Bearer ${data.token}`;
        return fetch(url, { ...options, headers });
      }
    }
    // Redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }
  return res;
}

interface AppContextType {
  // Auth & User
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  student: Student | null;
  setStudent: (student: Student | null) => void;
  loading: boolean;
  logout: () => void;

  // Onboarding
  onboardingData: OnboardingData;
  setOnboardingData: (data: OnboardingData) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => void;

  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  toggleTask: (taskId: string) => void;
  fetchTasks: () => Promise<void>;

  // Roadmap
  currentRoadmap: Roadmap | null;
  setCurrentRoadmap: (roadmap: Roadmap | null) => void;

  // AI Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;

  // Career Comparison
  selectedCareersForComparison: string[];
  setSelectedCareersForComparison: (careers: string[]) => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // API helper
  apiFetch: typeof apiFetch;
}

const defaultOnboardingData: OnboardingData = {
  step: 1,
  name: '',
  email: '',
  grade: 10,
  stream: 'undecided',
  interests: [],
  hobbies: [],
  skills: [],
  goalIntensity: 'serious',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultOnboardingData);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentRoadmap, setCurrentRoadmap] = useState<Roadmap | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [selectedCareersForComparison, setSelectedCareersForComparison] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // ── Check auth on mount ──────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setIsAuthenticated(true);
        setStudent({
          id: String(user.id),
          name: user.name,
          email: user.email,
          grade: user.grade || 10,
          stream: user.stream || 'undecided',
          interests: user.interests || [],
          hobbies: user.hobbies || [],
          skills: user.skills || [],
          goalIntensity: user.goalIntensity || 'serious',
          dreamCareers: user.dreamCareers || [],
          streak: user.streak || 0,
          totalPoints: user.totalPoints || 0,
          badges: user.badges || [],
          createdAt: user.createdAt || new Date(),
        });
        setOnboardingComplete(true);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // ── Theme persistence ────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle('dark', saved === 'dark');
    }
  }, []);

  // ── Fetch tasks ──────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiFetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks.map((t: any) => ({
          id: String(t.id),
          title: t.title,
          description: t.description || '',
          category: t.category,
          priority: t.priority,
          dueDate: t.due_date ? new Date(t.due_date) : new Date(),
          completed: !!t.completed,
          completedAt: t.completed_at ? new Date(t.completed_at) : undefined,
        })));
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetchTasks();
  }, [isAuthenticated, fetchTasks]);

  // ── Toggle task completion ───────────────────────────────
  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;
    // Optimistic update
    setTasks(tasks.map(t =>
      t.id === taskId
        ? { ...t, completed: newCompleted, completedAt: newCompleted ? new Date() : undefined }
        : t
    ));

    try {
      await apiFetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: newCompleted }),
      });
    } catch {
      // Revert on error
      setTasks(tasks);
    }
  };

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  };

  const clearChat = async () => {
    setChatMessages([]);
    try {
      await apiFetch('/api/ai/chat', { method: 'DELETE' });
    } catch {
      // Silent fail
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setStudent(null);
    setTasks([]);
    setCurrentRoadmap(null);
    setChatMessages([]);
    setOnboardingComplete(false);
    if (typeof window !== 'undefined') {
      // Delete cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.location.href = '/login';
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        student,
        setStudent,
        loading,
        logout,
        onboardingData,
        setOnboardingData,
        onboardingComplete,
        setOnboardingComplete,
        tasks,
        setTasks,
        toggleTask,
        fetchTasks,
        currentRoadmap,
        setCurrentRoadmap,
        chatMessages,
        addChatMessage,
        clearChat,
        selectedCareersForComparison,
        setSelectedCareersForComparison,
        theme,
        toggleTheme,
        apiFetch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
