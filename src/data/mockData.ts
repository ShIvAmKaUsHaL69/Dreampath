import { Student, Task, Roadmap, Resource, Post, Badge, Analytics, Milestone } from '@/types';

export const mockStudent: Student = {
  id: '1',
  name: 'Rahul Sharma',
  email: 'rahul@example.com',
  grade: 11,
  stream: 'science',
  goalIntensity: 'serious',
  interests: ['Technology', 'Mathematics', 'Problem Solving'],
  hobbies: ['Coding', 'Gaming', 'Reading'],
  skills: ['Programming', 'Logical Thinking', 'Quick Learning'],
  dreamCareers: ['software-engineer', 'data-scientist'],
  streak: 15,
  totalPoints: 2450,
  badges: [
    {
      id: '1',
      name: 'First Step',
      description: 'Completed your first task',
      icon: '🎯',
      unlockedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Week Warrior',
      description: '7 day streak achieved',
      icon: '🔥',
      unlockedAt: new Date('2024-01-22'),
    },
    {
      id: '3',
      name: 'Skill Builder',
      description: 'Completed 10 skill tasks',
      icon: '💪',
      unlockedAt: new Date('2024-02-01'),
    },
  ],
  createdAt: new Date('2024-01-01'),
};

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete Linear Algebra Chapter',
    description: 'Study matrices and determinants from NCERT',
    category: 'study',
    priority: 'high',
    dueDate: new Date(),
    completed: false,
  },
  {
    id: '2',
    title: 'Practice Python Problems',
    description: 'Solve 5 problems on HackerRank',
    category: 'skill',
    priority: 'medium',
    dueDate: new Date(),
    completed: true,
    completedAt: new Date(),
  },
  {
    id: '3',
    title: 'Research IIT Colleges',
    description: 'Compare top 5 IITs for CS branch',
    category: 'research',
    priority: 'low',
    dueDate: new Date(Date.now() + 86400000),
    completed: false,
  },
  {
    id: '4',
    title: 'Morning Exercise',
    description: '30 minutes of physical activity',
    category: 'self-improvement',
    priority: 'medium',
    dueDate: new Date(),
    completed: true,
    completedAt: new Date(),
  },
  {
    id: '5',
    title: 'JEE Main Previous Year Papers',
    description: 'Solve 2023 paper - Physics section',
    category: 'study',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000),
    completed: false,
  },
];

export const mockMilestones: Milestone[] = [
  {
    id: '1',
    title: 'Master Programming Fundamentals',
    description: 'Complete basic programming concepts and data structures',
    dueDate: new Date(Date.now() + 30 * 86400000),
    tasks: mockTasks.slice(0, 2),
    completed: false,
  },
  {
    id: '2',
    title: 'Complete JEE Preparation Phase 1',
    description: 'Finish NCERT syllabus for all subjects',
    dueDate: new Date(Date.now() + 90 * 86400000),
    tasks: mockTasks.slice(2, 4),
    completed: false,
  },
];

export const mockRoadmap: Roadmap = {
  id: '1',
  careerId: 'software-engineer',
  studentId: '1',
  title: 'Software Engineer Roadmap',
  description: 'Your personalized path to becoming a software engineer',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2026-06-01'),
  milestones: mockMilestones,
  progress: 35,
};

export const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Introduction to Python Programming',
    type: 'video',
    url: 'https://example.com/python-intro',
    description: 'A comprehensive introduction to Python for beginners',
    careerId: 'software-engineer',
    thumbnail: '/resources/python.jpg',
  },
  {
    id: '2',
    title: 'JEE Main Preparation Guide',
    type: 'exam-guide',
    url: 'https://example.com/jee-guide',
    description: 'Complete guide for JEE Main preparation',
    thumbnail: '/resources/jee.jpg',
  },
  {
    id: '3',
    title: 'Data Structures and Algorithms',
    type: 'article',
    url: 'https://example.com/dsa',
    description: 'Learn DSA concepts with examples',
    careerId: 'software-engineer',
    thumbnail: '/resources/dsa.jpg',
  },
  {
    id: '4',
    title: 'Mathematics for Computer Science',
    type: 'skill-link',
    url: 'https://example.com/math-cs',
    description: 'Essential math concepts for CS students',
    careerId: 'software-engineer',
    thumbnail: '/resources/math.jpg',
  },
];

export const mockPosts: Post[] = [
  {
    id: '1',
    authorId: '2',
    authorName: 'Priya Patel',
    authorAvatar: '/avatars/priya.jpg',
    content: 'Just completed my first week of JEE preparation! Any tips for staying consistent? 📚',
    likes: 24,
    comments: [
      {
        id: '1',
        authorId: '3',
        authorName: 'Amit Kumar',
        authorAvatar: '/avatars/amit.jpg',
        content: 'Make a timetable and stick to it! Also, take breaks regularly.',
        createdAt: new Date(Date.now() - 3600000),
      },
    ],
    createdAt: new Date(Date.now() - 7200000),
    tags: ['JEE', 'Study Tips', 'Motivation'],
  },
  {
    id: '2',
    authorId: '4',
    authorName: 'Neha Singh',
    authorAvatar: '/avatars/neha.jpg',
    content: 'Confused between Data Science and Software Engineering. Both seem interesting! What factors should I consider?',
    likes: 18,
    comments: [],
    createdAt: new Date(Date.now() - 86400000),
    tags: ['Career Choice', 'Technology', 'Help'],
  },
  {
    id: '3',
    authorId: '5',
    authorName: 'Vikram Rao',
    authorAvatar: '/avatars/vikram.jpg',
    content: '🎉 Achieved my 30-day streak today! Small consistent efforts really do add up. Keep going everyone!',
    likes: 45,
    comments: [
      {
        id: '2',
        authorId: '1',
        authorName: 'Rahul Sharma',
        authorAvatar: '/avatars/rahul.jpg',
        content: 'Congratulations! Thats amazing! 🔥',
        createdAt: new Date(Date.now() - 43200000),
      },
    ],
    createdAt: new Date(Date.now() - 172800000),
    tags: ['Achievement', 'Streak', 'Motivation'],
  },
];

export const mockAnalytics: Analytics = {
  weeklyConsistency: 85,
  taskCompletionRate: 72,
  strongAreas: ['Programming', 'Mathematics', 'Logical Thinking'],
  weakAreas: ['Physics', 'Time Management'],
  improvements: [
    'Focus more on Physics problems daily',
    'Use Pomodoro technique for better time management',
    'Review weak topics before moving to new ones',
  ],
  skillProgress: [
    { skill: 'Programming', progress: 65 },
    { skill: 'Mathematics', progress: 70 },
    { skill: 'Problem Solving', progress: 55 },
    { skill: 'Physics', progress: 40 },
    { skill: 'Communication', progress: 50 },
  ],
};

export const allBadges: Badge[] = [
  { id: '1', name: 'First Step', description: 'Completed your first task', icon: '🎯' },
  { id: '2', name: 'Week Warrior', description: '7 day streak achieved', icon: '🔥' },
  { id: '3', name: 'Skill Builder', description: 'Completed 10 skill tasks', icon: '💪' },
  { id: '4', name: 'Month Master', description: '30 day streak achieved', icon: '🏆' },
  { id: '5', name: 'Roadmap Champion', description: 'Completed a full roadmap', icon: '🗺️' },
  { id: '6', name: 'Research Pro', description: 'Completed 20 research tasks', icon: '🔍' },
  { id: '7', name: 'Community Star', description: 'Received 50 likes on posts', icon: '⭐' },
  { id: '8', name: 'Knowledge Seeker', description: 'Accessed 50 resources', icon: '📚' },
];

export const streakData = [
  { day: 'Mon', completed: true },
  { day: 'Tue', completed: true },
  { day: 'Wed', completed: true },
  { day: 'Thu', completed: true },
  { day: 'Fri', completed: false },
  { day: 'Sat', completed: true },
  { day: 'Sun', completed: true },
];
