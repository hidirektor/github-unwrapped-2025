import {ImageResponse} from 'next/og';
import {NextRequest} from 'next/server';

// Edge runtime is required for ImageResponse in Next.js
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'GitHub User';
    const commits = searchParams.get('commits') || '0';
    const level = searchParams.get('level') || 'Code Ninja';
    const levelEmoji = searchParams.get('levelEmoji') || '🥷';
    const stars = searchParams.get('stars') || '0';
    const prs = searchParams.get('prs') || '0';
    const repos = searchParams.get('repos') || '0';

    // Validate parameters
    if (!username || username === 'GitHub User') {
      return new Response('Username is required', { status: 400 });
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1e293b',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                fontSize: '80px',
                marginBottom: '20px',
              }}
            >
              {levelEmoji}
            </div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '10px',
              }}
            >
              {level}
            </div>
            <div
              style={{
                fontSize: '32px',
                color: '#a78bfa',
              }}
            >
              @{username}
            </div>
          </div>

          {/* Stats Grid */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '40px',
              marginTop: '40px',
            }}
          >
            {/* Commits */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '30px 40px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '56px',
                  fontWeight: 'bold',
                  color: '#60a5fa',
                  marginBottom: '10px',
                }}
              >
                {parseInt(commits).toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: '24px',
                  color: '#cbd5e1',
                }}
              >
                Commits
              </div>
            </div>

            {/* Stars */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '30px 40px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '56px',
                  fontWeight: 'bold',
                  color: '#fbbf24',
                  marginBottom: '10px',
                }}
              >
                {parseInt(stars).toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: '24px',
                  color: '#cbd5e1',
                }}
              >
                Stars
              </div>
            </div>

            {/* PRs */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '30px 40px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '56px',
                  fontWeight: 'bold',
                  color: '#34d399',
                  marginBottom: '10px',
                }}
              >
                {parseInt(prs).toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: '24px',
                  color: '#cbd5e1',
                }}
              >
                Pull Requests
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: '60px',
              fontSize: '28px',
              color: '#94a3b8',
            }}
          >
            GitHub Unwrapped 2025
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error('Error generating OG image:', e);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate image',
        message: e.message,
        stack: process.env.NODE_ENV === 'development' ? e.stack : undefined
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

