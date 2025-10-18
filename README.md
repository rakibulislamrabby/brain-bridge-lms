# Brain Bridge

A clean, responsive education marketplace UI inspired by TeachMe.To, built with Next.js 14, TypeScript, and TailwindCSS.

## 🎨 Design System

- **Primary Color**: Black (#000000)
- **Secondary Color**: Orange (#FF7A00) 
- **Accent Color**: Purple (#8B5CF6)
- **Background**: White (#FFFFFF)
- **Theme**: Light mode only (no dark mode toggle)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The application will be available at `http://localhost:3000`

## 📱 Features

### Landing Page Sections
- **Hero Section**: Bold messaging with search functionality
- **Trusted By**: Media mentions and credibility indicators
- **Why Choose Us**: Key value propositions with icons
- **Testimonials**: Student reviews and success stories
- **Features**: Comprehensive list for students and teachers
- **Platform Features**: Technical capabilities and AI features
- **Statistics**: Platform metrics and achievements
- **Call-to-Action**: Multiple conversion points
- **Footer**: Complete navigation and links

### Key Components
- Responsive header with navigation
- Search functionality (UI ready)
- Feature cards with icons
- Testimonial cards with ratings
- Statistics display
- Multi-section layout
- Professional footer

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Build Tool**: Turbopack

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and CSS variables
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Main landing page
├── components/
│   ├── app-header.tsx       # Navigation header
│   └── ui/                  # shadcn/ui components
└── lib/
    └── utils.ts             # Utility functions
```

## 🎯 Static Data Implemented

Based on the requirements, the following static data sections are implemented:

### For Students
- 1-on-1 & Group Learning
- Flexible Scheduling
- HD Video Calls
- Endless Skill Categories
- Smart Search Filters
- Student Points System
- Progress Tracker
- Secure Payments

### For Teachers
- Open to Everyone (no certification required)
- Public Instructor Profiles
- Fixed Base Pay + Automatic Raises
- Performance-Based Progression
- Teacher Level Path (Bronze → Silver → Gold → Platinum → Master)
- Video Lesson Uploads
- Earnings Dashboard
- Smart Schedule Manager

### Platform Features
- AI Matchmaking
- Built-In HD Video Integration
- Secure Payment Gateway
- Dynamic Pay Algorithm
- Community Ranking System
- Mobile & Desktop Access
- AI Moderation & Safety Tools
- Data Insights Dashboard
- Referral & Loyalty Rewards

## 🔧 Development

The project is configured with:
- ESLint for code quality
- TypeScript for type safety
- TailwindCSS for styling
- shadcn/ui for components
- Modern Next.js App Router

All components are responsive and follow modern React best practices.

## 📄 License

This project is created for educational purposes.