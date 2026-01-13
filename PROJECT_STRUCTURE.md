# Soundz.uz Project Structure
## Node.js (Express) Backend + React Frontend Architecture

```
soundz-uz/
│
├── backend/                          # Node.js/Express Backend
│   ├── src/
│   │   ├── config/                   # Configuration files
│   │   │   ├── database.js           # Database connection config
│   │   │   ├── email.js              # Email service config (SMTP/SendGrid)
│   │   │   ├── multer.js             # File upload config
│   │   │   ├── constants.js          # App constants
│   │   │   └── env.js                # Environment variables validation
│   │   │
│   │   ├── models/                   # Database models (using Prisma/Sequelize)
│   │   │   ├── Product.js            # Product model
│   │   │   ├── ProductTranslation.js # Product translations model
│   │   │   ├── Page.js               # Static page content model
│   │   │   ├── PageTranslation.js    # Page translations model
│   │   │   ├── Inquiry.js            # Contact form inquiries model
│   │   │   ├── AdminUser.js          # Admin users model
│   │   │   ├── Language.js           # Languages model (active/inactive)
│   │   │   ├── Setting.js            # Site settings model
│   │   │   └── Media.js              # Uploaded media/files model
│   │   │
│   │   ├── controllers/              # Request handlers
│   │   │   ├── products.controller.js
│   │   │   ├── pages.controller.js
│   │   │   ├── inquiries.controller.js
│   │   │   ├── admin.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── media.controller.js
│   │   │   └── settings.controller.js
│   │   │
│   │   ├── services/                 # Business logic layer
│   │   │   ├── product.service.js
│   │   │   ├── page.service.js
│   │   │   ├── inquiry.service.js
│   │   │   ├── email.service.js      # Email sending service
│   │   │   ├── media.service.js      # File upload/management service
│   │   │   ├── translation.service.js
│   │   │   └── language.service.js
│   │   │
│   │   ├── middleware/               # Express middleware
│   │   │   ├── auth.middleware.js    # JWT authentication
│   │   │   ├── validation.middleware.js
│   │   │   ├── error.middleware.js   # Error handling
│   │   │   ├── rateLimit.middleware.js
│   │   │   ├── sanitize.middleware.js
│   │   │   └── language.middleware.js
│   │   │
│   │   ├── routes/                   # API routes
│   │   │   ├── api/
│   │   │   │   ├── products.routes.js
│   │   │   │   ├── pages.routes.js
│   │   │   │   ├── inquiries.routes.js
│   │   │   │   ├── media.routes.js
│   │   │   │   └── settings.routes.js
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── auth.routes.js
│   │   │       ├── products.routes.js
│   │   │       ├── pages.routes.js
│   │   │       ├── inquiries.routes.js
│   │   │       ├── media.routes.js
│   │   │       ├── languages.routes.js
│   │   │       └── settings.routes.js
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── logger.js             # Logging utility
│   │   │   ├── validators.js         # Input validation helpers
│   │   │   ├── sanitizers.js         # Input sanitization
│   │   │   ├── fileHelpers.js        # File operations
│   │   │   └── responseHelpers.js    # API response formatters
│   │   │
│   │   ├── validators/               # Request validation schemas
│   │   │   ├── product.validator.js
│   │   │   ├── inquiry.validator.js
│   │   │   ├── page.validator.js
│   │   │   └── auth.validator.js
│   │   │
│   │   ├── migrations/               # Database migrations (if using Sequelize)
│   │   │   └── ...
│   │   │
│   │   ├── seeders/                  # Database seeders
│   │   │   ├── languages.seeder.js
│   │   │   ├── admin.seeder.js
│   │   │   └── default-content.seeder.js
│   │   │
│   │   └── app.js                    # Express app setup
│   │   └── server.js                 # Server entry point
│   │
│   ├── prisma/                       # Prisma ORM (if using Prisma)
│   │   ├── schema.prisma
│   │   └── migrations/
│   │       └── ...
│   │
│   ├── uploads/                      # Uploaded files directory
│   │   ├── products/                 # Product images
│   │   ├── pages/                    # Page images
│   │   └── temp/                     # Temporary uploads
│   │
│   ├── tests/                        # Backend tests
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── .env.example                  # Environment variables template
│   ├── .env                          # Environment variables (gitignored)
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json                 # TypeScript config (if using TS)
│   └── README.md
│
├── frontend/                         # React Frontend
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo.png                  # Soundz logo
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   │
│   ├── src/
│   │   ├── components/               # Reusable React components
│   │   │   ├── common/
│   │   │   │   ├── Header/
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   ├── Navigation.tsx
│   │   │   │   │   ├── LanguageSwitcher.tsx
│   │   │   │   │   └── MobileMenu.tsx
│   │   │   │   │
│   │   │   │   ├── Footer/
│   │   │   │   │   ├── Footer.tsx
│   │   │   │   │   └── SocialLinks.tsx
│   │   │   │   │
│   │   │   │   ├── Button/
│   │   │   │   │   └── Button.tsx
│   │   │   │   │
│   │   │   │   ├── Loading/
│   │   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   │   └── SkeletonLoader.tsx
│   │   │   │   │
│   │   │   │   ├── Modal/
│   │   │   │   │   └── Modal.tsx
│   │   │   │   │
│   │   │   │   └── ErrorBoundary/
│   │   │   │       └── ErrorBoundary.tsx
│   │   │   │
│   │   │   ├── products/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductGrid.tsx
│   │   │   │   ├── ProductDetail.tsx
│   │   │   │   └── ProductImage.tsx
│   │   │   │
│   │   │   ├── forms/
│   │   │   │   ├── ContactForm.tsx
│   │   │   │   ├── FormField.tsx
│   │   │   │   ├── FormSelect.tsx
│   │   │   │   └── FileUpload.tsx
│   │   │   │
│   │   │   └── ui/                   # UI library components (if using Material-UI, etc.)
│   │   │       └── ...
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── Home/
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── ProductOverview.tsx
│   │   │   │   └── TestimonialsSection.tsx
│   │   │   │
│   │   │   ├── Products/
│   │   │   │   ├── ProductsPage.tsx
│   │   │   │   ├── ProductList.tsx
│   │   │   │   └── ProductDetailPage.tsx
│   │   │   │
│   │   │   ├── About/
│   │   │   │   └── AboutPage.tsx
│   │   │   │
│   │   │   ├── HowItWorks/
│   │   │   │   ├── HowItWorksPage.tsx
│   │   │   │   └── ProcessSteps.tsx
│   │   │   │
│   │   │   ├── Contact/
│   │   │   │   ├── ContactPage.tsx
│   │   │   │   └── InquiryForm.tsx
│   │   │   │
│   │   │   └── NotFound/
│   │   │       └── NotFoundPage.tsx
│   │   │
│   │   ├── admin/                    # Admin Panel (separate or integrated)
│   │   │   ├── components/
│   │   │   │   ├── AdminLayout/
│   │   │   │   │   ├── AdminLayout.tsx
│   │   │   │   │   ├── AdminSidebar.tsx
│   │   │   │   │   └── AdminHeader.tsx
│   │   │   │   │
│   │   │   │   ├── Dashboard/
│   │   │   │   │   └── Dashboard.tsx
│   │   │   │   │
│   │   │   │   ├── Products/
│   │   │   │   │   ├── ProductList.tsx
│   │   │   │   │   ├── ProductForm.tsx
│   │   │   │   │   └── ProductImageUpload.tsx
│   │   │   │   │
│   │   │   │   ├── Pages/
│   │   │   │   │   ├── PageList.tsx
│   │   │   │   │   ├── PageEditor.tsx
│   │   │   │   │   └── RichTextEditor.tsx
│   │   │   │   │
│   │   │   │   ├── Inquiries/
│   │   │   │   │   ├── InquiryList.tsx
│   │   │   │   │   └── InquiryDetail.tsx
│   │   │   │   │
│   │   │   │   ├── Media/
│   │   │   │   │   ├── MediaLibrary.tsx
│   │   │   │   │   └── MediaUpload.tsx
│   │   │   │   │
│   │   │   │   ├── Languages/
│   │   │   │   │   └── LanguageSettings.tsx
│   │   │   │   │
│   │   │   │   └── Settings/
│   │   │   │       └── SiteSettings.tsx
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── AdminLogin.tsx
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── AdminProducts.tsx
│   │   │   │   ├── AdminPages.tsx
│   │   │   │   ├── AdminInquiries.tsx
│   │   │   │   ├── AdminMedia.tsx
│   │   │   │   ├── AdminLanguages.tsx
│   │   │   │   └── AdminSettings.tsx
│   │   │   │
│   │   │   └── hooks/
│   │   │       ├── useAuth.ts
│   │   │       └── useAdmin.ts
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useLanguage.ts
│   │   │   ├── useApi.ts
│   │   │   ├── useForm.ts
│   │   │   └── useMediaQuery.ts
│   │   │
│   │   ├── services/                 # API service layer
│   │   │   ├── api/
│   │   │   │   ├── products.api.js
│   │   │   │   ├── pages.api.js
│   │   │   │   ├── inquiries.api.js
│   │   │   │   └── settings.api.js
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── auth.api.js
│   │   │       ├── products.api.js
│   │   │       ├── pages.api.js
│   │   │       ├── inquiries.api.js
│   │   │       ├── media.api.js
│   │   │       └── languages.api.js
│   │   │
│   │   ├── store/                    # State management (Redux/Zustand/Context)
│   │   │   ├── slices/
│   │   │   │   ├── languageSlice.js
│   │   │   │   ├── authSlice.js
│   │   │   │   └── contentSlice.js
│   │   │   │
│   │   │   └── store.js
│   │   │
│   │   ├── i18n/                     # Internationalization
│   │   │   ├── config.js
│   │   │   ├── locales/
│   │   │   │   ├── uz/
│   │   │   │   │   ├── common.json
│   │   │   │   │   ├── navigation.json
│   │   │   │   │   ├── products.json
│   │   │   │   │   └── forms.json
│   │   │   │   │
│   │   │   │   ├── ru/
│   │   │   │   │   ├── common.json
│   │   │   │   │   ├── navigation.json
│   │   │   │   │   ├── products.json
│   │   │   │   │   └── forms.json
│   │   │   │   │
│   │   │   │   └── en/
│   │   │   │       ├── common.json
│   │   │   │       ├── navigation.json
│   │   │   │       ├── products.json
│   │   │   │       └── forms.json
│   │   │   │
│   │   │   └── index.js
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   ├── helpers.js
│   │   │   └── constants.js
│   │   │
│   │   ├── styles/                   # Global styles
│   │   │   ├── globals.css
│   │   │   ├── variables.css         # CSS variables (colors, fonts)
│   │   │   └── themes/
│   │   │       ├── light.css
│   │   │       └── dark.css          # Dark mode (optional)
│   │   │
│   │   ├── App.tsx                    # Main App component
│   │   ├── App.css
│   │   ├── main.tsx                   # Entry point
│   │   └── router.tsx                 # React Router setup
│   │
│   ├── .env.example
│   ├── .env                          # Environment variables (gitignored)
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.js                # Vite config (if using Vite)
│   ├── tailwind.config.js            # Tailwind CSS config (if using)
│   └── README.md
│
├── database/                         # Database scripts and schemas
│   ├── schema.sql                    # Database schema
│   ├── migrations/
│   │   └── ...
│   ├── seeders/
│   │   └── ...
│   └── backup/                       # Backup scripts
│       └── backup.sh
│
├── infrastructure/                   # Deployment and infrastructure
│   ├── docker/
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.frontend
│   │   └── docker-compose.yml
│   │
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── sites-available/
│   │       └── soundz.conf
│   │
│   ├── scripts/
│   │   ├── deploy.sh
│   │   ├── setup.sh
│   │   └── backup-db.sh
│   │
│   └── ci-cd/
│       ├── .github/
│       │   └── workflows/
│       │       ├── deploy-backend.yml
│       │       └── deploy-frontend.yml
│       └── .gitlab-ci.yml            # If using GitLab CI
│
├── docs/                             # Documentation
│   ├── API.md                        # API documentation
│   ├── DEPLOYMENT.md
│   ├── ARCHITECTURE.md
│   ├── ADMIN_GUIDE.md
│   └── CONTRIBUTING.md
│
├── tests/                            # E2E tests (if any)
│   └── e2e/
│       └── ...
│
├── .gitignore
├── .env.example                      # Root environment template
├── package.json                      # Root package.json (monorepo setup)
├── README.md
└── LICENSE
```

## Database Schema Overview

### Tables Structure:

1. **languages**
   - id, code (uz/ru/en), name, is_active, created_at, updated_at

2. **products**
   - id, slug, is_published, main_image_url, created_at, updated_at

3. **product_translations**
   - id, product_id, language_id, name, description, specifications (JSON), created_at, updated_at

4. **pages**
   - id, slug, page_type (home/about/how-it-works), created_at, updated_at

5. **page_translations**
   - id, page_id, language_id, title, content (HTML/text), meta_title, meta_description, created_at, updated_at

6. **inquiries**
   - id, name, email, phone, product_interest, message, status (new/processed), created_at, updated_at

7. **admin_users**
   - id, username, email, password_hash, role, last_login, created_at, updated_at

8. **settings**
   - id, key, value (JSON), created_at, updated_at

9. **media**
   - id, filename, original_filename, file_path, file_type, file_size, uploaded_by, created_at, updated_at

## API Endpoints Structure

### Public API (`/api/`):
- GET `/api/products?lang=uz` - Get all products
- GET `/api/products/:id?lang=uz` - Get product details
- GET `/api/pages/:slug?lang=uz` - Get page content
- POST `/api/inquiries` - Submit contact form
- GET `/api/settings` - Get site settings

### Admin API (`/admin/api/`):
- POST `/admin/api/auth/login` - Admin login
- POST `/admin/api/auth/logout` - Admin logout
- GET `/admin/api/products` - List products (admin)
- POST `/admin/api/products` - Create product
- PUT `/admin/api/products/:id` - Update product
- DELETE `/admin/api/products/:id` - Delete product
- GET `/admin/api/pages` - List pages
- PUT `/admin/api/pages/:id` - Update page
- GET `/admin/api/inquiries` - List inquiries
- PUT `/admin/api/inquiries/:id` - Update inquiry status
- POST `/admin/api/media/upload` - Upload media
- GET `/admin/api/languages` - Get languages
- PUT `/admin/api/languages/:id` - Toggle language active status
- GET `/admin/api/settings` - Get settings
- PUT `/admin/api/settings` - Update settings

## Frontend Routes Structure

### Public Routes:
- `/` - Home page
- `/products` - Products listing
- `/products/:slug` - Product detail
- `/about` - About page
- `/how-it-works` - How it works page
- `/contact` - Contact/Order form
- `/:lang/products` - Language-prefixed routes (optional)

### Admin Routes:
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard
- `/admin/products` - Manage products
- `/admin/products/new` - Create product
- `/admin/products/:id/edit` - Edit product
- `/admin/pages` - Manage pages
- `/admin/pages/:id/edit` - Edit page
- `/admin/inquiries` - View inquiries
- `/admin/media` - Media library
- `/admin/languages` - Language settings
- `/admin/settings` - Site settings

## Key Technologies Stack

### Backend:
- Node.js + Express
- Prisma ORM (or Sequelize)
- PostgreSQL (or MySQL)
- JWT for authentication
- Multer for file uploads
- Nodemailer for emails
- Express-validator for validation

### Frontend:
- React 18+
- React Router v6
- React i18next for translations
- Axios for API calls
- React Hook Form for forms
- Zustand/Redux for state management
- Tailwind CSS (or styled-components)
- Vite (or Create React App)

### Admin Panel:
- React Admin (or custom with Material-UI/Ant Design)
- Rich text editor (TinyMCE/CKEditor)
- Image upload component

### DevOps:
- Docker & Docker Compose
- Nginx (reverse proxy)
- PM2 (process manager for Node.js)
- SSL/HTTPS setup






