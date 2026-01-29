// User Types
export interface Student {
  id: string;
  name: string;
  email: string;
  grade: number;
  stream: 'science' | 'commerce' | 'arts' | 'undecided';
  goalIntensity: 'casual' | 'serious' | 'highly-focused';
  interests: string[];
  hobbies: string[];
  skills: string[];
  dreamCareers: string[];
  streak: number;
  totalPoints: number;
  badges: Badge[];
  createdAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

// Career Types
export interface Career {
  id: string;
  title: string;
  category: string;
  description: string;
  dailyLife: string;
  skillsRequired: string[];
  academicPath: string[];
  entranceExams: string[];
  collegeTypes: string[];
  realityCheck: {
    competition: 'low' | 'medium' | 'high' | 'very-high';
    difficulty: 'low' | 'medium' | 'high' | 'very-high';
    backupOptions: string[];
  };
  studyDuration: string;
  growthPotential: 'low' | 'medium' | 'high' | 'very-high';
  riskLevel: 'low' | 'medium' | 'high';
  averageSalary: string;
  lifestyle: string;
  image: string;
}

// Roadmap Types
export interface Roadmap {
  id: string;
  careerId: string;
  studentId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  milestones: Milestone[];
  progress: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  tasks: Task[];
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'study' | 'skill' | 'research' | 'self-improvement';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
}

// Resource Types
export interface Resource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'exam-guide' | 'skill-link';
  url: string;
  description: string;
  careerId?: string;
  taskId?: string;
  thumbnail?: string;
}

// Community Types
export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likes: number;
  comments: Comment[];
  createdAt: Date;
  tags: string[];
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: Date;
}

// Analytics Types
export interface Analytics {
  weeklyConsistency: number;
  taskCompletionRate: number;
  strongAreas: string[];
  weakAreas: string[];
  improvements: string[];
  skillProgress: { skill: string; progress: number }[];
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Onboarding Types
export interface OnboardingData {
  step: number;
  name: string;
  email: string;
  grade: number;
  stream: 'science' | 'commerce' | 'arts' | 'undecided';
  interests: string[];
  hobbies: string[];
  skills: string[];
  goalIntensity: 'casual' | 'serious' | 'highly-focused';
}
