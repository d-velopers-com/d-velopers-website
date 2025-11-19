# D-VELOPERS Community Platform

A modern community platform built with Next.js 15, featuring Discord OAuth integration, public user profiles, and role-based permissions.

## ✨ Features

- 🔐 **Discord OAuth Authentication** - Secure login with Discord
- 👥 **Public User Profiles** - Customizable profiles with descriptions and links
- 🎭 **Role-Based Access Control** - Configurable allowed roles for public profiles
- 🌐 **Multi-language Support** - English and Spanish with automatic language detection
- 🎨 **Modern UI** - Built with HeroUI v2 and Tailwind CSS
- 🌓 **Dark/Light Theme** - Seamless theme switching
- 📱 **Fully Responsive** - Works perfectly on all devices
- ⚡ **Server Member Verification** - Checks if users are members of your Discord server

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library:** [HeroUI v2](https://heroui.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Database:** PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Authentication:** Discord OAuth2 (Manual implementation)
- **Language:** TypeScript
- **Package Manager:** pnpm

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **pnpm** 8.x or higher
- **PostgreSQL** database
- **Discord Application** (for OAuth)

## 🚀 Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd d-velopers-website
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Set up environment variables:**

Create a `.env.local` file in the root directory:

```env
# Discord OAuth Configuration
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback/discord
DISCORD_GUILD_ID=your_discord_server_id

# Role-Based Access Control (optional)
# Comma-separated list of Discord role IDs that can make profiles public
# Leave empty to allow all server members
ALLOWED_ROLES=role_id_1,role_id_2,role_id_3

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database_name

# Security
JWT_SECRET=your_random_secret_key_here
```

4. **Generate Prisma Client:**

```bash
pnpm exec prisma generate
```

@ 5. **Run database migrations:**

```bash
pnpm exec prisma migrate dev
```

Or push the schema directly (for development):

```bash
pnpm exec prisma db push
```

6. **Start the development server:**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Discord Application Setup

### 1. Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name and create

### 2. Configure OAuth2

1. Navigate to **OAuth2** → **General**
2. Add a redirect URL:
   ```
   http://localhost:3000/api/auth/callback/discord
   ```
   For production, use your domain:
   ```
   https://yourdomain.com/api/auth/callback/discord
   ```

### 3. Set OAuth2 Scopes

The application requires the following scopes:

- `identify` - Get user's Discord profile
- `email` - Get user's email (optional)
- `guilds.members.read` - Check server membership and roles

### 4. Get Your Credentials

1. **Client ID:** Found in OAuth2 → General
2. **Client Secret:** Generate in OAuth2 → General (keep it secret!)
3. **Guild ID:** Enable Developer Mode in Discord → Right-click your server → Copy ID

## 📁 Project Structure

```
d-velopers-website/
├── app/
│   ├── api/
│   │   ├── auth/               # Authentication endpoints
│   │   ├── config/             # Configuration endpoints
│   │   └── users/              # User-related endpoints
│   ├── dashboard/              # User dashboard
│   ├── login/                  # Login page
│   ├── users/[handler]/        # Public profile pages
│   └── page.tsx                # Home page (public profiles list)
├── components/
│   ├── navbar.tsx              # Main navigation
│   ├── theme-switch.tsx        # Theme toggle
│   └── language-switcher.tsx   # Language selector
├── contexts/
│   └── language-context.tsx    # i18n context
├── hooks/
│   ├── useSession.ts           # Session management
│   └── useProfile.ts           # User profile management
├── lib/
│   ├── discord-oauth.ts        # Discord API utilities
│   ├── session.ts              # Session utilities
│   ├── prisma.ts               # Prisma client
│   └── user.ts                 # User database operations
├── locales/
│   ├── en.ts                   # English translations
│   └── es.ts                   # Spanish translations
├── prisma/
│   └── schema.prisma           # Database schema
└── styles/
    └── globals.css             # Global styles
```

## 🔑 Environment Variables Explained

| Variable                | Description                                            | Required |
| ----------------------- | ------------------------------------------------------ | -------- |
| `DISCORD_CLIENT_ID`     | Your Discord application's client ID                   | ✅ Yes   |
| `DISCORD_CLIENT_SECRET` | Your Discord application's client secret               | ✅ Yes   |
| `DISCORD_REDIRECT_URI`  | OAuth callback URL                                     | ✅ Yes   |
| `DISCORD_GUILD_ID`      | Your Discord server ID                                 | ✅ Yes   |
| `ALLOWED_ROLES`         | Comma-separated role IDs that can make profiles public | ❌ No    |
| `DATABASE_URL`          | PostgreSQL connection string                           | ✅ Yes   |
| `JWT_SECRET`            | Secret key for JWT token encryption                    | ✅ Yes   |

## 📝 Available Scripts

```bash
# Development
pnpm dev              # Start development server

# Build
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm exec prisma generate       # Generate Prisma Client
pnpm exec prisma migrate dev    # Run migrations
pnpm exec prisma db push        # Push schema to database
pnpm exec prisma studio         # Open Prisma Studio (DB GUI)

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors
```

## 🎯 Features Breakdown

### Authentication Flow

1. User navigates to `/login`
2. Clicks "Continue with Discord"
3. Redirected to Discord OAuth
4. After approval, redirected back with authorization code
5. Backend exchanges code for access token
6. Fetches user data and server membership
7. Creates/updates user in database
8. Creates session with JWT (httpOnly cookie)

### Role-Based Public Profiles

- Configure `ALLOWED_ROLES` in `.env.local`
- Only users with specified roles can make profiles public
- Leave empty to allow all server members
- Non-members see a prompt to join the server

### Profile Customization

Users can customize their public profiles with:

- **Description** - Up to 500 characters
- **Link** - Personal website or social media
- **Public/Private Toggle** - Control profile visibility

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Update `DISCORD_REDIRECT_URI` to your production URL
5. Deploy!

### Other Platforms

Ensure you:

- Set all environment variables
- Run `pnpm exec prisma generate` in build step
- Use Node.js 18+
- Configure PostgreSQL database

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [HeroUI Documentation](https://heroui.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Discord Developer Portal](https://discord.com/developers/applications)

## 💬 Support

For support, visit our [Discord page](https://www.d-velopers.com/discord) or open an issue.

---

Made with ❤️ by D-VELOPERS Community
