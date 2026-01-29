# DreamPath - Career Exploration Platform

A student-first career exploration and execution platform designed to help school students discover, plan, and realistically work toward their future goals.

## Features

### Core Features
- **Career Library** - Browse detailed career profiles with information about daily life, skills required, academic paths, entrance exams, and reality checks
- **Career Comparison** - Compare up to 3 careers side-by-side
- **Personalized Roadmaps** - Auto-generated roadmaps based on class, career choice, and academic stream
- **Daily Task System** - Track study, skill, research, and self-improvement tasks
- **Progress Analytics** - Visual insights on strong/weak areas with AI-based improvement suggestions
- **AI Assistant** - Get informational guidance about careers, exams, and study tips (not mentorship)
- **Peer Community** - Share progress and discuss careers with fellow students
- **Achievement System** - Badges and streaks for motivation

### User Types
- **Students** (Classes 8-12) - Primary users exploring career paths
- **Admin** - Content and system management

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **State Management:** React Context

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd demo-meeting-client

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard
│   ├── careers/           # Career library & details
│   ├── roadmap/           # Personalized roadmaps
│   ├── tasks/             # Daily task management
│   ├── progress/          # Progress analytics
│   ├── ai-assistant/      # AI chat interface
│   ├── resources/         # Study resources
│   ├── community/         # Peer community
│   ├── achievements/      # Badges & achievements
│   ├── settings/          # User settings
│   ├── admin/             # Admin panel
│   └── onboarding/        # User onboarding flow
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # App layout components
│   ├── dashboard/         # Dashboard components
│   ├── careers/           # Career-related components
│   ├── roadmap/           # Roadmap components
│   ├── tasks/             # Task components
│   ├── ai/                # AI chat components
│   ├── community/         # Community components
│   ├── progress/          # Analytics components
│   ├── resources/         # Resource components
│   └── achievements/      # Achievement components
├── contexts/              # React Context providers
├── data/                  # Mock data & career information
├── types/                 # TypeScript type definitions
└── lib/                   # Utility functions
```

## Key Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Main overview with stats, tasks, and quick actions |
| Career Library | `/careers` | Browse and compare careers |
| Career Details | `/careers/[id]` | Detailed career information |
| My Roadmap | `/roadmap` | Personalized career roadmap |
| Daily Tasks | `/tasks` | Task management with filters |
| Progress | `/progress` | Analytics and insights |
| AI Assistant | `/ai-assistant` | Chat-based guidance |
| Resources | `/resources` | Study materials and guides |
| Community | `/community` | Peer discussions |
| Achievements | `/achievements` | Badges and streaks |
| Settings | `/settings` | Account preferences |
| Admin Panel | `/admin` | Content management |

## Note

This is a **frontend-only** application with mock data. No database is connected. The application demonstrates the complete UI/UX flow of the DreamPath platform.

## License

MIT
