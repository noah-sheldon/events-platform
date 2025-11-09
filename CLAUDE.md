# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start the Next.js development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Project Architecture

This is a Next.js 16 project using the App Router architecture with the following structure:

- **Frontend Framework**: Next.js 16 with React 19.2
- **Styling**: Tailwind CSS v4 with custom design system
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **TypeScript**: Strict mode enabled with path aliases (`@/*` maps to root)
- **Form Handling**: React Hook Form with Zod validation and Hookform resolvers
- **Theming**: next-themes for dark/light mode support

### Key Directories

- `app/` - Next.js App Router pages and layouts
- `components/ui/` - Reusable UI components built with Radix UI and class-variance-authority
- `lib/` - Utility functions (includes `cn()` for Tailwind class merging)

### Component Architecture

UI components follow the shadcn/ui pattern:
- Use `class-variance-authority` (cva) for variant-based styling
- Implement Radix UI primitives for accessibility
- Export both component and variant functions
- Use the `cn()` utility from `lib/utils.ts` for class merging
- Support `asChild` prop pattern for composition

### Styling System

The project uses a sophisticated Tailwind setup:
- Custom CSS variables in `app/globals.css`
- Design tokens for consistent spacing, colors, and typography
- Dark mode support via CSS variables
- Geist font family (Sans and Mono variants)

### State Management & Forms

Forms use React Hook Form with:
- Zod schemas for validation
- Hookform resolvers for schema integration
- Type-safe form handling

### Development Notes

- Path aliases configured: `@/*` points to project root
- ESLint configured with Next.js TypeScript rules
- Strict TypeScript configuration
- PostCSS with Tailwind CSS v4