# GitHub Unwrapped 2025 🚀

A beautiful web application that generates your GitHub yearly summary with commit-based leaderboard levels. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## ✨ Features

- 📊 **GitHub Year Summary**: View your total commits, PRs, issues, and stars for 2025
- 🏆 **Leaderboard Levels**: Unlock levels based on your commit count:
  - 🥷 **Code Ninja** (0-1000 commits) - Silent but deadly coder
  - ⚔️ **Code Samurai** (1001-5000 commits) - Master of repositories
  - 🧠 **Open Source Master** (5001-10000 commits) - Inspires through code
  - 🚀 **Legendary Developer** (10001+ commits) - Leaves commits in the stars
- 📈 **Visualizations**: Interactive charts for commit timeline and language usage
- 🎨 **Beautiful UI**: Dark neon theme with glassmorphism effects and smooth animations
- 🔗 **LinkedIn Integration**: Share your achievements on LinkedIn with automatically generated summary images
- 🖼️ **Shareable Images**: Download or share beautiful summary images of your GitHub stats
- 🔐 **Multiple Authentication Methods**: Choose from OAuth, Public Data, or Token-based access

## 🎯 Authentication Methods

### 1. Sign in via GitHub (OAuth)
- Full access with OAuth authentication
- View all your private and public repositories
- Most secure and user-friendly method
- Requires GitHub OAuth App setup
- **Best for**: Personal use, full access to all repositories

### 2. Retrieve Public Data
- Enter a GitHub username to view public repository statistics
- No authentication required
- Perfect for viewing any user's public GitHub activity
- Limited to public repositories only
- **Best for**: Quick stats, viewing other users' public profiles

### 3. Use GitHub Token
- Enter your personal access token for full access
- Access to all repositories and private data
- More control over token permissions
- Token is stored locally in browser sessionStorage
- **Best for**: Advanced users who want more control

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS + Framer Motion
- **Charts**: Recharts
- **UI Library**: shadcn/ui (Radix primitives)
- **Icons**: lucide-react
- **Authentication**: GitHub OAuth, Personal Access Tokens, Public API
- **Image Generation**: Next.js OG Image API (@vercel/og)
- **Animations**: Framer Motion with spring easing

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- GitHub account (for OAuth or token methods)
- GitHub OAuth App (optional, for OAuth method)

## 🚀 Getting Started

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd github-unwrapped-2025
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create a `.env.local` file** (only required for OAuth method):
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/callback
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## ⚙️ GitHub OAuth Setup (Optional)

This is only required if you want to use the OAuth authentication method.

1. **Go to GitHub Settings:**
   - Navigate to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
   - Click "New OAuth App"

2. **Fill in the OAuth App details:**
   - **Application name**: `GitHub Unwrapped 2025` (or any name you prefer)
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback`

3. **Get your credentials:**
   - Copy the **Client ID**
   - Click "Generate a new client secret" and copy the **Client Secret**
   - Add them to your `.env.local` file

4. **For production:**
   - Update the callback URL to your production domain
   - Update `GITHUB_REDIRECT_URI` in your production environment variables
   - Set `NEXT_PUBLIC_BASE_URL` to your production URL

## 📖 Usage

### Method 1: OAuth (Recommended)

1. Click "Sign in via GitHub" on the home page
2. Authorize the application on GitHub
3. You'll be redirected to your dashboard with full stats
4. Click "Share on LinkedIn" to share your achievements
5. Click "Download Image" to save your summary image

### Method 2: Public Data

1. Click "Retrieve Public Data" on the home page
2. Enter any GitHub username
3. View public repository statistics (no authentication required)
4. Note: Some features may be limited for public data

### Method 3: Personal Access Token

1. **Create a GitHub Personal Access Token:**
   - Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select scopes: `public_repo`, `repo`, `read:user`
   - Generate and copy the token

2. **Use the token:**
   - Click "Use GitHub Token" on the home page
   - Paste your token
   - View your full dashboard with all repositories

## 🏗️ Project Structure

```
github-unwrapped-2025/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── github/          # OAuth initiation
│   │   │   └── callback/        # OAuth callback handler
│   │   ├── github/
│   │   │   ├── stats/           # OAuth/Token stats endpoint
│   │   │   ├── public-stats/    # Public data endpoint
│   │   │   └── validate-token/  # Token validation
│   │   └── og-image/            # OG image generation endpoint
│   ├── dashboard/               # Main dashboard page
│   │   ├── layout.tsx           # Dashboard layout with metadata
│   │   └── page.tsx             # Dashboard content
│   ├── public/                  # Public data input page
│   ├── token/                   # Token input page
│   ├── demo/                    # Demo page with mock data
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── avatar.tsx
│   │   └── input.tsx
│   ├── LevelBadge.tsx           # Leaderboard level badge
│   ├── StatsCard.tsx            # Statistics card component
│   ├── CommitChart.tsx          # Commit timeline chart
│   ├── TopRepos.tsx             # Top repositories list
│   ├── LanguageChart.tsx        # Language usage chart
│   └── LinkedInShare.tsx        # LinkedIn sharing component
├── lib/
│   ├── github.ts                # GitHub API functions
│   ├── leaderboard.ts           # Leaderboard level logic
│   └── utils.ts                 # Utility functions
└── package.json
```

## 🔗 LinkedIn Sharing & Image Generation

The app includes built-in LinkedIn sharing with automatically generated summary images:

### Features:
- **Automatic OG Image Generation**: Creates beautiful summary images with your stats
- **LinkedIn Integration**: Share directly to LinkedIn with one click
- **Image Download**: Download your summary image for use anywhere
- **Open Graph Tags**: Automatic meta tags for rich social media previews

### How it works:
1. When you view your dashboard, an OG image is automatically generated
2. Click "Share on LinkedIn" to open the LinkedIn share dialog
3. LinkedIn automatically fetches the OG image for rich previews
4. Click "Download Image" to save the image locally

### Image includes:
- Your GitHub username
- Your leaderboard level with emoji
- Total commits
- Total stars received
- Total pull requests
- Beautiful gradient background matching the app theme

## 🌐 Deployment

### Vercel (Recommended)

1. **Push your code to GitHub**

2. **Import your repository on Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Add environment variables:**
   - `GITHUB_CLIENT_ID`: Your GitHub OAuth Client ID
   - `GITHUB_CLIENT_SECRET`: Your GitHub OAuth Client Secret
   - `GITHUB_REDIRECT_URI`: Your production callback URL (e.g., `https://your-domain.vercel.app/api/auth/callback`)
   - `NEXT_PUBLIC_BASE_URL`: Your production URL (e.g., `https://your-domain.vercel.app`)

4. **Deploy!**

### Environment Variables for Production

Make sure to set these in your production environment:
- `GITHUB_CLIENT_ID` (required for OAuth method)
- `GITHUB_CLIENT_SECRET` (required for OAuth method)
- `GITHUB_REDIRECT_URI` (should be your production URL)
- `NEXT_PUBLIC_BASE_URL` (required for OG image generation and sharing)

**Note:** Public data and token methods work without environment variables, but OG image sharing requires `NEXT_PUBLIC_BASE_URL`.

## 🔒 Security

- **OAuth tokens**: Stored securely in HTTP-only cookies
- **Personal access tokens**: Stored locally in browser sessionStorage (never sent to our servers except for GitHub API calls)
- **Public data**: No authentication required, uses GitHub's public API
- **Rate limiting**: Be mindful of GitHub API rate limits (60 requests/hour for unauthenticated, 5000/hour for authenticated)
- **Token security**: Tokens are never stored in cookies or localStorage, only in sessionStorage for token-based auth

## 📊 API Rate Limits

- **Unauthenticated requests**: 60 requests/hour
- **OAuth/Token authenticated**: 5000 requests/hour
- The app limits repository fetching to 50 repos per request for performance
- OG image generation does not count against GitHub API rate limits

## 🐛 Troubleshooting

### "GitHub Client ID not configured" Error

- This error only appears if you try to use OAuth without setting up environment variables
- You can still use "Retrieve Public Data" or "Use GitHub Token" methods
- To fix: Create `.env.local` file with your GitHub OAuth credentials (see setup instructions above)

### "User not found" Error (Public Data)

- Make sure the GitHub username is correct
- The user must have at least one public repository
- Check if the username is spelled correctly

### "Invalid token" Error

- Make sure your token has the correct scopes: `public_repo`, `repo`, `read:user`
- Check if the token has expired
- Generate a new token if needed

### Rate Limit Errors

- You've exceeded GitHub's API rate limit
- Wait an hour or use an authenticated method (OAuth or token) for higher limits
- Authenticated requests have a 5000/hour limit vs 60/hour for unauthenticated

### OG Image Not Loading

- Make sure `NEXT_PUBLIC_BASE_URL` is set in your environment variables
- Check that the `/api/og-image` endpoint is accessible
- Verify that your deployment platform supports Edge Runtime (required for OG image generation)

### LinkedIn Preview Not Showing Image

- Ensure `NEXT_PUBLIC_BASE_URL` is correctly set to your production URL
- Use LinkedIn's [Post Inspector](https://www.linkedin.com/post-inspector/) to debug OG tags
- Clear LinkedIn's cache if you've recently updated the image
- Make sure the OG image URL is publicly accessible

## 🎨 Customization

### Leaderboard Levels

Edit `lib/leaderboard.ts` to customize:
- Level names and emojis
- Commit ranges
- Badge colors and gradients
- Motivational messages

### Themes

Edit `app/globals.css` to customize:
- Color scheme
- Gradients
- Neon glow effects
- Glassmorphism styles

### OG Images

Edit `app/api/og-image/route.tsx` to customize:
- Image layout
- Colors and fonts
- Stats displayed
- Image dimensions

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚧 Known Limitations

1. **Commit counting**: GitHub API doesn't provide exact commit counts for all repositories. The app uses estimates for repositories with more than 100 commits.
2. **Private repositories**: Only accessible with OAuth or token authentication
3. **Rate limits**: Unauthenticated requests are limited to 60/hour
4. **OG images**: Require Edge Runtime support (available on Vercel, Netlify, etc.)

## 🎯 Future Enhancements

- [ ] Support for multiple years
- [ ] Comparison with previous years
- [ ] More detailed commit breakdowns
- [ ] Export data as JSON/CSV
- [ ] Custom themes
- [ ] Team/organization statistics
- [ ] Integration with other platforms (Twitter, Facebook)

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Contributing Guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [lucide-react](https://lucide.dev/)
- Charts from [Recharts](https://recharts.org/)
- Animations with [Framer Motion](https://www.framer.com/motion/)
- OG Image generation with [Vercel OG](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)

## 📮 Support

For issues, questions, or suggestions, please open an issue on GitHub.

## 📚 Additional Resources

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel OG Image Generation](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)
- [LinkedIn Share API](https://www.linkedin.com/help/linkedin/answer/46687)

---

Made with ❤️ for developers who love to code
