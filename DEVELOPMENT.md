# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in the values
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`

## Available Scripts

### Development

- `npm run dev` - Start development server with Turbopack
- `npm run dev:debug` - Start development server with debugging enabled
- `npm run build` - Build for production
- `npm run start` - Start production server

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is formatted
- `npm run type-check` - Check TypeScript types
- `npm run check-all` - Run all quality checks

### Utilities

- `npm run clean` - Clean build artifacts
- `npm run reset` - Clean everything and reinstall dependencies

## Development Features

### Debug Logging

Use development utilities for logging:

```typescript
import { devLog, devWarn, devError } from "@/config";

devLog("Debug information");
devWarn("Warning message");
devError("Error message");
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

- Database connection
- Authentication (Clerk)
- Payment processing (Stripe)
- Email service (Loops)
- Content API (ScrapeCreators)

### Git Hooks

Pre-commit hooks automatically:

- Run ESLint and fix issues
- Format code with Prettier
- Ensure code quality before commits

## Project Structure

```
src/
├── app/                # Next.js App Router pages
├── components/         # React components
│   ├── ui/            # ShadCN UI components
│   ├── shared/        # Reusable components
│   └── layout/        # Layout components
├── lib/               # Utilities and services
├── hooks/             # Custom React hooks
├── types/             # TypeScript definitions
└── config/            # Configuration files
```

## Development Tips

- Use the test UI page at `/test-ui` for component testing
- All commits are automatically checked for code quality
- TypeScript strict mode is enabled
- Import paths use `@/` aliases for clean imports
