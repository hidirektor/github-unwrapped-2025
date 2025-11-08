import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/callback`;
  
  if (!clientId) {
    // Daha kullanıcı dostu hata sayfası
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>GitHub OAuth Kurulum Gerekli</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #1e293b 0%, #7c3aed 100%);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 16px;
              padding: 40px;
            }
            h1 { margin-top: 0; }
            code {
              background: rgba(0, 0, 0, 0.3);
              padding: 2px 8px;
              border-radius: 4px;
              font-family: 'Monaco', 'Courier New', monospace;
            }
            .step {
              margin: 20px 0;
              padding: 15px;
              background: rgba(255, 255, 255, 0.05);
              border-radius: 8px;
            }
            a {
              color: #a78bfa;
              text-decoration: none;
            }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚙️ GitHub OAuth Kurulum Gerekli</h1>
            <p>GitHub OAuth entegrasyonu için environment variable'ları ayarlamanız gerekiyor.</p>
            
            <div class="step">
              <h3>1. GitHub OAuth App Oluşturun</h3>
              <p>
                <a href="https://github.com/settings/developers" target="_blank">GitHub Developer Settings</a> → 
                OAuth Apps → New OAuth App
              </p>
              <p><strong>Callback URL:</strong> <code>http://localhost:3000/api/auth/callback</code></p>
            </div>

            <div class="step">
              <h3>2. .env.local Dosyası Oluşturun</h3>
              <p>Proje kök dizininde <code>.env.local</code> dosyası oluşturun:</p>
              <pre style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; overflow-x: auto;">
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/callback</pre>
            </div>

            <div class="step">
              <h3>3. Development Server'ı Yeniden Başlatın</h3>
              <p>Environment variable'ları ekledikten sonra server'ı yeniden başlatın:</p>
              <code>npm run dev</code>
            </div>

            <p style="margin-top: 30px;">
              <a href="/">← Ana Sayfaya Dön</a> | 
              <a href="/demo">Demo Modunu Görüntüle →</a>
            </p>
            <p style="font-size: 0.9em; color: #cbd5e1; margin-top: 20px;">
              Detaylı kurulum için <code>KURULUM.md</code> dosyasına bakın.
            </p>
          </div>
        </body>
      </html>
    `;
    
    return new NextResponse(errorHtml, {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,repo`;

  return NextResponse.redirect(githubAuthUrl);
}

