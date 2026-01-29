'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Student, Task, Roadmap, OnboardingData, ChatMessage } from '@/types';
import { mockStudent, mockTasks, mockRoadmap } from '@/data/mockData';

interface AppContextType {
  // Auth & User
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  student: Student | null;
  setStudent: (student: Student | null) => void;
  
  // Onboarding
  onboardingData: OnboardingData;
  setOnboardingData: (data: OnboardingData) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => void;
  
  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  toggleTask: (taskId: string) => void;
  
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
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set to true for demo
  const [student, setStudent] = useState<Student | null>(mockStudent);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultOnboardingData);
  const [onboardingComplete, setOnboardingComplete] = useState(true); // Set to true for demo
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [currentRoadmap, setCurrentRoadmap] = useState<Roadmap | null>(mockRoadmap);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [selectedCareersForComparison, setSelectedCareersForComparison] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date() : undefined }
        : task
    ));
  };

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
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
        onboardingData,
        setOnboardingData,
        onboardingComplete,
        setOnboardingComplete,
        tasks,
        setTasks,
        toggleTask,
        currentRoadmap,
        setCurrentRoadmap,
        chatMessages,
        addChatMessage,
        clearChat,
        selectedCareersForComparison,
        setSelectedCareersForComparison,
        theme,
        toggleTheme,
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
