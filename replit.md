# Replit Project Guide

## Overview

This is a full-stack web application built with React, TypeScript, and Express.js. The project follows a monorepo structure with a shared schema layer, using modern tooling including Vite for frontend development, Drizzle ORM for database management, and shadcn/ui for UI components. The application is configured for PostgreSQL database integration and includes comprehensive UI components for rapid development.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for development and production
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: TailwindCSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Storage**: PostgreSQL-based sessions using connect-pg-simple
- **Build Tool**: esbuild for server bundling

### Storage Architecture
- **Primary Database**: PostgreSQL via Neon Database serverless
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migrations**: Drizzle Kit for database migrations
- **Development Fallback**: In-memory storage implementation for development

## Key Components

### Database Schema (`shared/schema.ts`)
- **Users Table**: Basic user model with id, username, and password fields
- **Type Safety**: Full TypeScript integration with Drizzle and Zod
- **Validation**: Schema validation using drizzle-zod integration

### Storage Layer (`server/storage.ts`)
- **Interface Design**: IStorage interface defining CRUD operations
- **Implementation**: MemStorage class for development/testing
- **Methods**: getUser, getUserByUsername, createUser operations
- **Extensibility**: Designed for easy database implementation swap

### Frontend Components
- **UI Components**: Complete shadcn/ui component library including forms, dialogs, navigation, and data display
- **Layout Components**: Header, Footer, and page structure components
- **Pages**: Home page and 404 error handling
- **Responsive Design**: Mobile-first approach with responsive breakpoints

### Development Tools
- **Hot Reload**: Vite HMR with runtime error overlay
- **Type Checking**: Strict TypeScript configuration
- **Code Quality**: ESLint and Prettier integration implied
- **Path Aliases**: Configured for clean imports (@/, @shared/, @assets/)

## Data Flow

### Request Flow
1. Client requests hit Vite dev server or static assets in production
2. API requests are proxied to Express server with `/api` prefix
3. Express middleware handles JSON parsing, CORS, and request logging
4. Route handlers interact with storage layer for data operations
5. Responses are logged and returned to client

### State Management
1. TanStack Query manages server state caching and synchronization
2. Query functions use fetch with credentials for authentication
3. Error handling includes unauthorized request management
4. Optimistic updates and background refetching configured

### Database Operations
1. Drizzle ORM provides type-safe database queries
2. Schema changes managed through migration files
3. Connection pooling handled by Neon Database driver
4. Development uses in-memory storage for rapid iteration

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components foundation
- **wouter**: Lightweight routing library

### Development Dependencies
- **vite**: Frontend build tool and dev server
- **@vitejs/plugin-react**: React integration for Vite
- **tailwindcss**: Utility-first CSS framework
- **typescript**: Static type checking
- **drizzle-kit**: Database migration management

### UI Dependencies
- **shadcn/ui**: Pre-built component library
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utility
- **tailwind-merge**: TailwindCSS class merging

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds optimized React bundle to `dist/public`
2. **Backend**: esbuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations applied during deployment
4. **Assets**: Static assets served from build output

### Environment Configuration
- **Development**: Uses Vite dev server with HMR and error overlay
- **Production**: Express serves static files and API routes
- **Database**: Requires DATABASE_URL environment variable
- **Sessions**: PostgreSQL-based session storage for scalability

### Hosting Requirements
- **Node.js**: Runtime environment for Express server
- **PostgreSQL**: Database instance (Neon Database recommended)
- **Static Hosting**: Optional CDN for frontend assets
- **Environment Variables**: DATABASE_URL for database connection

### Development Workflow
1. `npm run dev`: Starts development server with hot reload
2. `npm run build`: Creates production build
3. `npm run start`: Runs production server
4. `npm run db:push`: Applies database schema changes
5. `npm run check`: TypeScript type checking

The architecture prioritizes developer experience with hot reload, type safety, and modern tooling while maintaining production readiness with optimized builds and scalable database integration.