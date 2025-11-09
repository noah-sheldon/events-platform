# Events Platform

A modern events platform built for the Full Stack Technical Test, solving common challenges faced by organizations managing events. Built in 1 hour using AI-assisted development.

## 🔗 Deployed URL

**Live Demo:** [https://events-platform-bay.vercel.app/](https://events-platform-bay.vercel.app/)

## ⚡ My Approach

### Technology Choices:

- **Frontend**: Next.js 16 with App Router + React 19.2 + TypeScript
- **Styling**: Tailwind CSS v4 with shadcn/ui component library
- **Forms**: React Hook Form with Zod validation and @hookform/resolvers
- **State Management**: React hooks with localStorage for waitlist persistence
- **API Architecture**: Next.js API routes for secure server-side external API calls
- **Deployment**: Vercel (seamless Next.js integration)

### AI Tool Usage:

- **Claude Code**: Primary AI assistant for rapid development, architecture decisions, and debugging
- **Workflow**: AI-assisted component creation, API design, TypeScript interface generation, and responsive design implementation
- **Problem Solving**: Used AI to solve Next.js 16 async params compatibility issues and optimize build performance

### Bonus Feature (implemented):

**🎯 Event Capacity & Waitlists**

- Events show capacity status: Available/Few spots left/Full/Waitlist
- Users can join waitlists for full events with position tracking
- LocalStorage-based persistence across browser sessions
- Real-time waitlist size and position updates
- Leave waitlist functionality with confirmation

### Key Design Decisions:

- **Security First**: API keys stored server-side only, never exposed to frontend
- **Responsive Design**: Mobile-first approach with seamless desktop scaling
- **User Experience**: Optimistic updates, loading states, and comprehensive error handling
- **Component Architecture**: Reusable shadcn/ui components with consistent design system
- **Form Validation**: Schema-based validation with real-time feedback
- **Performance**: Static generation where possible, dynamic rendering for data-driven pages

## ✨ Features

### Core Features ✅

- **Events Listing**: Grid layout with search, category filtering, and status filters
- **Event Details**: Comprehensive event pages with registration forms
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Working Deployment**: Production-ready build and deployment

### Bonus: Waitlist System ✅

- Join waitlist for full events
- View waitlist position (#1, #2, etc.)
- Real-time waitlist size tracking
- Persistent waitlist data
- Leave waitlist functionality

### Additional Enhancements

- Toast notifications for user feedback
- Loading states and error handling
- Optimistic UI updates
- Professional design with consistent branding
- Accessibility-focused component library

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd events-platform

# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file in the root directory:

```bash
API_BASE_URL=https://x15zoj9on9.execute-api.us-east-1.amazonaws.com/prod
API_KEY=your-api-key-here
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Lint

```bash
# Run ESLint
npm run lint
```

## 🏗️ Architecture

### Project Structure

```
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes (secure external API proxy)
│   ├── events/         # Event listing and detail pages
│   └── layout.tsx      # Root layout with metadata
├── components/ui/      # shadcn/ui component library
├── lib/               # Utilities and API clients
│   ├── api.ts         # Server-side API client
│   ├── client-api.ts  # Frontend API client
│   ├── types.ts       # TypeScript interfaces
│   ├── utils.ts       # Utility functions
│   └── waitlist.ts    # Waitlist management system
└── public/            # Static assets
```

### API Security

- External API calls handled server-side via Next.js API routes
- API keys never exposed to frontend/browser
- Type-safe API interfaces throughout

### State Management

- React hooks for component state
- LocalStorage for waitlist persistence
- Optimistic updates for better UX

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with clear commit messages
4. Test your changes: `npm run build`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Standards

- TypeScript strict mode enabled
- ESLint configuration with Next.js rules
- Consistent component patterns using shadcn/ui
- Server-side security for all external API calls

### Testing

```bash
# Ensure build passes
npm run build

# Check for linting issues
npm run lint
```

## 📄 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---
