# ACME Corp - Next.js Authentication App

[![Deploy to Azure](https://github.com/cameronking4/acme-corp/actions/workflows/azure-deploy.yml/badge.svg)](https://github.com/cameronking4/acme-corp/actions/workflows/azure-deploy.yml)

A modern Next.js application with GitHub OAuth authentication, built with NextAuth, shadcn/ui components, and Vercel-style theming.

## Features

- 🔐 GitHub OAuth authentication with NextAuth
- 🎨 Beautiful UI with shadcn/ui components
- 🎯 Vercel-inspired design
- 🌙 Dark mode support
- 📱 Fully responsive
- ⚡ Built with Next.js 15 App Router
- 🎭 TypeScript support
- 🎨 Tailwind CSS styling
- 🎪 Lucide React icons
- ☁️ Azure deployment with Infrastructure as Code (ARM templates)
- 🚀 Automated CI/CD with GitHub Actions

## Prerequisites

- Node.js 18+ installed
- A GitHub account
- GitHub OAuth App credentials

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/cameronking4/acme-corp.git
cd acme-corp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: ACME Corp (or your preferred name)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID**
6. Generate a new **Client Secret** and copy it

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here-generate-with-openssl-rand-base64-32
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

To generate a secure `NEXTAUTH_SECRET`, run:

```bash
openssl rand -base64 32
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
acme-corp/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts        # NextAuth API route
│   ├── dashboard/
│   │   └── page.tsx                # Protected dashboard page
│   ├── login/
│   │   └── page.tsx                # Login page
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Home page (redirects)
├── components/
│   ├── ui/
│   │   ├── button.tsx              # Button component
│   │   └── card.tsx                # Card component
│   ├── providers.tsx               # SessionProvider wrapper
│   └── sign-out-button.tsx         # Sign out button
├── lib/
│   ├── auth.ts                     # Auth configuration
│   └── utils.ts                    # Utility functions
├── types/
│   └── next-auth.d.ts              # NextAuth type extensions
├── middleware.ts                   # Route protection middleware
└── tailwind.config.ts              # Tailwind configuration
```

## Pages

### Login Page (`/login`)

- Clean, Vercel-inspired design
- GitHub OAuth sign-in button
- Responsive layout with gradient background

### Dashboard Page (`/dashboard`)

- Protected route (requires authentication)
- Displays user profile information
- Modern card-based layout
- Sign-out functionality
- Welcome message and getting started guide

## Authentication Flow

1. User visits the app and is redirected to `/login`
2. User clicks "Continue with GitHub"
3. User is redirected to GitHub for authorization
4. After approval, user is redirected back to `/dashboard`
5. User can sign out, which redirects back to `/login`

## Middleware

The `middleware.ts` file protects the `/dashboard` route and all nested routes. Unauthenticated users are automatically redirected to the login page.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Authentication**: NextAuth.js v4
- **OAuth Provider**: GitHub

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Azure (Infrastructure as Code)

Deploy to Azure with automated CI/CD using ARM templates and GitHub Actions. See the complete guide: [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)

**Quick Start:**

1. Create Azure service principal and configure GitHub secrets
2. Push to main branch to trigger automated deployment
3. Application automatically deploys to Azure App Service with:
   - App Service Plan (Linux, Node.js 20)
   - App Service (Web App)
   - Application Insights (Monitoring)

For detailed instructions, troubleshooting, and manual deployment options, see [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md).

### Vercel (Alternative)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXTAUTH_URL` - Your production URL (e.g., `https://your-app.vercel.app`)
   - `NEXTAUTH_SECRET` - Your secret key
   - `GITHUB_ID` - Your GitHub OAuth App Client ID
   - `GITHUB_SECRET` - Your GitHub OAuth App Client Secret
4. Update GitHub OAuth App callback URL to: `https://your-app.vercel.app/api/auth/callback/github`
5. Deploy!

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_URL` | The base URL of your application | Yes |
| `NEXTAUTH_SECRET` | Secret key for signing tokens | Yes |
| `GITHUB_ID` | GitHub OAuth App Client ID | Yes |
| `GITHUB_SECRET` | GitHub OAuth App Client Secret | Yes |

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
