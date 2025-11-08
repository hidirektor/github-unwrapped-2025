# GitHub Unwrapped 2025 🚀

A beautiful web application that generates your GitHub yearly summary with commit-based leaderboard levels. Built with Next.js 16, React 19, and Tailwind CSS.

## Features

- 📊 **GitHub Year Summary**: View your total commits, PRs, issues, and stars for 2025
- 🏆 **Leaderboard Levels**: Unlock levels based on your commit count:
  - 🥷 Code Ninja (0-1000 commits)
  - ⚔️ Code Samurai (1001-5000 commits)
  - 🧠 Open Source Master (5001-10000 commits)
  - 🚀 Legendary Developer (10001+ commits)
- 📈 **Visualizations**: Interactive charts for commit timeline and language usage
- 🎨 **Beautiful UI**: Dark neon theme with glassmorphism effects
- 🔗 **LinkedIn Integration**: Share your achievements on LinkedIn

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS + Framer Motion
- **Charts**: Recharts
- **UI Library**: shadcn/ui (Radix primitives)
- **Icons**: lucide-react
- **Authentication**: GitHub OAuth

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- GitHub OAuth App (for authentication)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd github-unwrapped-2025
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

4. Set up GitHub OAuth App:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create a new OAuth App
   - Set Authorization callback URL to `http://localhost:3000/api/auth/callback`
   - Copy the Client ID and Client Secret to your `.env.local` file

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
github-unwrapped-2025/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── github/
│   │       └── callback/
│   ├── dashboard/
│   ├── demo/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── LevelBadge.tsx
│   ├── StatsCard.tsx
│   ├── CommitChart.tsx
│   ├── TopRepos.tsx
│   ├── LanguageChart.tsx
│   └── LinkedInShare.tsx
├── lib/
│   ├── github.ts
│   ├── leaderboard.ts
│   └── utils.ts
└── package.json
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your production environment:
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_REDIRECT_URI` (should be your production URL)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

