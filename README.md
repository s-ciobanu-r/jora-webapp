# Jora Frontend - Contract Management System

A modern, multi-language web application for automotive contract creation and buyer management, built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🌍 **Multi-language support** (Romanian, German, English, Russian)
- 💬 **Chat-based contract flow** with real-time state management
- 👥 **Buyer management** with CRUD operations
- 🔍 **OCR document processing** support
- 🎨 **Dark/Light theme** toggle
- 🔐 **Secure API integration** with n8n backend
- 📱 **Fully responsive** design

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **HTTP Client**: Axios with interceptors

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- n8n backend with configured workflows
- API key for authentication

## Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment file and update with your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_JORA_API_BASE=https://your-n8n-instance.com/webhook/api
NEXT_PUBLIC_JORA_FRONTEND_API_KEY=your-secret-api-key
```

⚠️ **IMPORTANT**: The API key must match exactly what's configured in your n8n workflows. All requests will include the header `joraapikey: <your-key>`.

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Backend Integration

### Required n8n Endpoints

The frontend expects these endpoints from your n8n backend:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/contract-session` | Main contract state machine |
| GET | `/buyers?search=TEXT` | Search buyers |
| POST | `/buyers` | Create new buyer |
| PATCH | `/buyers/:id` | Update buyer |
| GET | `/buyers/:id` | Get buyer by ID |
| POST | `/jora-login` | User authentication |
| GET | `/jora-last-contract` | Get most recent contract |

### Authentication Header

Every request includes the authentication header:
```
joraapikey: <NEXT_PUBLIC_JORA_FRONTEND_API_KEY>
```

## Project Structure

```
jora-frontend/
├── app/                    # Next.js app router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page (redirects)
│   ├── login/             # Login page
│   ├── dashboard/         # Dashboard with stats
│   ├── contracts/new/     # Contract creation flow
│   └── buyers/            # Buyer management
├── components/
│   ├── layout/            # Layout components (header, footer)
│   ├── contract/          # Contract-specific components
│   ├── buyers/            # Buyer-specific components
│   └── ui/                # shadcn/ui components
├── i18n/
│   ├── config.ts          # i18n configuration
│   └── messages/          # Translation files
│       ├── ro/            # Romanian
│       ├── de/            # German
│       ├── en/            # English
│       └── ru/            # Russian
├── lib/
│   ├── apiClient.ts       # Axios configuration
│   └── utils.ts           # Utility functions
├── store/
│   ├── authStore.ts       # Authentication state
│   └── contractSessionStore.ts # Contract session state
└── types/                 # TypeScript type definitions
```

## Available Scripts

```bash
# Development
npm run dev           # Start development server

# Production
npm run build         # Build for production
npm run start         # Start production server

# Code Quality
npm run lint          # Run ESLint
npm run type-check    # Check TypeScript types
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Internationalization

The app supports 4 languages with Romanian as default:
- 🇷🇴 Romanian (ro)
- 🇩🇪 German (de)
- 🇬🇧 English (en)
- 🇷🇺 Russian (ru)

Translation files are located in `/i18n/messages/[lang]/common.json`.

### Adding New Translations

1. Add keys to all language JSON files
2. Use in components:
```tsx
const { t } = useTranslation();
<h1>{t('common.welcome')}</h1>
```

## Troubleshooting

### CORS Issues

Ensure your n8n webhook nodes include CORS headers:
```javascript
// In n8n webhook response
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "joraapikey, Content-Type"
}
```

### Authentication Errors (401)

1. Verify `NEXT_PUBLIC_JORA_FRONTEND_API_KEY` is set correctly
2. Check n8n workflow expects header `joraapikey`
3. Ensure the API key values match exactly

### Session Expiration

Sessions expire after 15 minutes of inactivity. The app will prompt to start a new contract when this happens.

## Security Notes

- API key is exposed to client (use backend-for-frontend pattern for production)
- Implement rate limiting on n8n side
- Use HTTPS in production
- Consider JWT tokens for enhanced security
- Validate all inputs on backend

## License

MIT

## Support

For issues related to:
- **Frontend**: Open an issue in this repository
- **n8n workflows**: Check n8n documentation
- **Integration**: Verify API endpoints and authentication

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
