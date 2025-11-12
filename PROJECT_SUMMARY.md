# Acoustic.uz - Project Summary

## Overview

This is a comprehensive, modular, and configurable full-stack application for acoustic.uz built according to the mission brief specifications. The project follows the structure and information architecture of sluh.by while using Acoustic brand colors (#F07E22 primary, #3F3091 accent).

## Architecture

### Monorepo Structure
- **Turborepo** + **pnpm** for workspace management
- **Shared package** for types, schemas, and utilities
- **Three main applications**: Frontend, Admin, Backend

### Technology Stack

#### Backend
- **NestJS** - Modern Node.js framework
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Relational database
- **JWT** - Authentication with httpOnly cookies
- **Swagger** - API documentation
- **Zod** - Schema validation
- **Telegram Bot API** - Form submissions
- **AWS S3 / Local Storage** - File storage

#### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - UI components
- **i18next** - Internationalization (UZ/RU)
- **TanStack Query** - Data fetching and caching

#### Admin
- **Vite** - Build tool
- **React 18** - UI library
- **Ant Design** - Component library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **TanStack Query** - Data fetching

## Key Features

### Backend Features
✅ JWT authentication with RBAC (superadmin, admin, editor, viewer)
✅ Complete CRUD APIs for all entities
✅ Bilingual content support (UZ/RU)
✅ File upload with local/S3 storage
✅ Telegram integration for leads
✅ Search functionality (PostgreSQL FTS)
✅ Rate limiting and security
✅ Audit logging
✅ Swagger API documentation

### Frontend Features (To Be Completed)
- Home page with all blocks (hero, services, products, etc.)
- Product listing and detail pages
- Service pages
- Blog functionality
- FAQ accordion
- Branches map/list
- Contact forms
- i18n support (UZ/RU)
- SEO optimization

### Admin Features (To Be Completed)
- Authentication and authorization
- CRUD interfaces for all entities
- Bilingual content editing
- Media manager
- WYSIWYG editor
- Settings management
- Menu management
- Leads management

## Database Schema

### Core Models
- **User** - User accounts with roles
- **Role** - RBAC roles and permissions
- **Media** - File storage with alt text (UZ/RU)
- **Setting** - Site settings and feature flags

### Content Models
- **Banner** - Home page banners
- **Service** - Services with bilingual content
- **Brand** - Product brands
- **ProductCategory** - Product categories (hierarchical)
- **Product** - Products with specs, gallery, pricing
- **Showcase** - Featured products (Interacoustics, Cochlear)
- **Post** - Blog posts
- **FAQ** - Frequently asked questions
- **Branch** - Branch locations
- **Page** - Custom pages
- **Menu** - Navigation menus

### Other Models
- **Lead** - Form submissions
- **AuditLog** - Change tracking

## Project Structure

```
acoustic-uz/
├── apps/
│   ├── frontend/          # Next.js 14 frontend
│   ├── admin/             # Vite React admin panel
│   └── backend/           # NestJS backend API
├── packages/
│   └── shared/            # Shared types, schemas, utilities
├── prisma/                # Prisma schema and migrations
├── infra/                 # Docker, nginx configurations
├── scripts/               # Utility scripts
└── docs/                  # Documentation
```

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up database:**
   ```bash
   cd apps/backend
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```

4. **Start development:**
   ```bash
   pnpm dev
   ```

## Default Credentials

- **Email**: admin@acoustic.uz
- **Password**: Admin#12345

## API Documentation

Once the backend is running:
- Swagger UI: http://localhost:3001/api/docs

## Docker Deployment

```bash
docker-compose up -d
```

## Next Steps

1. Complete frontend pages according to sluh.by structure
2. Implement admin CRUD interfaces
3. Add i18n support
4. Implement SEO optimization
5. Add testing
6. Configure production deployment

## Documentation

- [README.md](./README.md) - Main documentation
- [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) - Setup guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Implementation status

## License

Private - All rights reserved

