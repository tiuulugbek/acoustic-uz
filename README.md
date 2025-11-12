# Acoustic.uz - Full Stack Application

A comprehensive, modular, and configurable full-stack application for acoustic.uz built with Next.js, NestJS, and PostgreSQL.

## 🏗️ Architecture

- **Monorepo**: Turborepo + pnpm
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind, shadcn/ui, i18next
- **Admin**: Vite + React + TypeScript, Ant Design
- **Backend**: NestJS, Prisma ORM, PostgreSQL
- **Shared**: Types, Zod schemas, utilities

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 14 (or Docker Desktop for Mac/Windows)
- Docker Desktop (optional, for development - see [DOCKER_SETUP.md](./DOCKER_SETUP.md))

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
cd apps/backend
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Start development servers
pnpm dev
```

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm --filter @acoustic/frontend dev
pnpm --filter @acoustic/admin dev
pnpm --filter @acoustic/backend dev
```

### Building

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter @acoustic/frontend build
```

## 📁 Project Structure

```
.
├── apps/
│   ├── frontend/     # Next.js 14 frontend
│   ├── admin/        # Vite React admin panel
│   └── backend/      # NestJS backend API
├── packages/
│   └── shared/       # Shared types, schemas, utilities
├── prisma/           # Prisma schema and migrations
├── infra/            # Docker, nginx, deployment configs
└── scripts/          # Utility scripts
```

## 🔐 Default Credentials

- **Email**: admin@acoustic.uz
- **Password**: Admin#12345
- **Note**: First login will require password change

## 🌐 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:3001/api/docs

## 🐳 Docker

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down
```

## 📝 Environment Variables

See `.env.example` for all required environment variables.

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific app tests
pnpm --filter @acoustic/backend test
pnpm --filter @acoustic/frontend test
```

## 📚 Documentation

- [Backend API Documentation](./apps/backend/README.md)
- [Frontend Documentation](./apps/frontend/README.md)
- [Admin Documentation](./apps/admin/README.md)

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- i18next
- TanStack Query

### Admin
- Vite
- React 18
- TypeScript
- Ant Design
- React Hook Form
- Zod

### Backend
- NestJS
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Swagger/OpenAPI
- Zod Validation

## 📄 License

Private - All rights reserved

## 🤝 Contributing

This is a private project. Contact the project maintainer for contribution guidelines.

