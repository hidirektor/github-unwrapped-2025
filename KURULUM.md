# 🔧 GitHub OAuth Kurulum Rehberi

Bu rehber, GitHub Unwrapped 2025 uygulaması için GitHub OAuth entegrasyonunu adım adım kurmanızı sağlar.

## 📋 Adım 1: GitHub OAuth App Oluşturma

1. **GitHub'a giriş yapın** ve sağ üst köşedeki profil resminize tıklayın
2. **Settings** (Ayarlar) seçeneğine gidin
3. Sol menüden **Developer settings** (Geliştirici Ayarları) seçeneğine tıklayın
4. **OAuth Apps** sekmesine gidin
5. **New OAuth App** (Yeni OAuth Uygulaması) butonuna tıklayın

## 📝 Adım 2: OAuth App Bilgilerini Doldurma

Aşağıdaki bilgileri girin:

- **Application name**: `GitHub Unwrapped 2025` (veya istediğiniz bir isim)
- **Homepage URL**: `http://localhost:3000` (development için) veya production URL'iniz
- **Authorization callback URL**: `http://localhost:3000/api/auth/callback` (development için)

**Önemli**: Production'da kullanacaksanız, callback URL'ini production domain'inize göre güncelleyin:
- Production örneği: `https://your-domain.com/api/auth/callback`

## 🔑 Adım 3: Client ID ve Client Secret Alma

1. OAuth App'i oluşturduktan sonra, sayfada **Client ID** göreceksiniz
2. **Generate a new client secret** (Yeni bir client secret oluştur) butonuna tıklayın
3. Client Secret'ı kopyalayın (bir daha gösterilmeyecek, güvenli bir yerde saklayın!)

## 🔐 Adım 4: Environment Variables Ayarlama

1. Proje kök dizininde `.env.local` dosyası oluşturun:

```bash
touch .env.local
```

2. `.env.local` dosyasına aşağıdaki içeriği ekleyin:

```env
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

3. `your_client_id_here` ve `your_client_secret_here` kısımlarını GitHub'dan aldığınız gerçek değerlerle değiştirin

## 🚀 Adım 5: Uygulamayı Başlatma

1. Development server'ı başlatın:

```bash
npm run dev
```

2. Tarayıcınızda `http://localhost:3000` adresine gidin
3. **Sign in with GitHub** butonuna tıklayın
4. GitHub'da giriş yapın ve uygulamaya erişim izni verin
5. Başarılı girişten sonra dashboard sayfasına yönlendirileceksiniz

## 🌐 Production Deployment (Vercel)

Vercel'de deploy ederken:

1. Vercel dashboard'a gidin
2. Projenizi seçin
3. **Settings** → **Environment Variables** sekmesine gidin
4. Aşağıdaki environment variable'ları ekleyin:
   - `GITHUB_CLIENT_ID`: GitHub'dan aldığınız Client ID
   - `GITHUB_CLIENT_SECRET`: GitHub'dan aldığınız Client Secret
   - `GITHUB_REDIRECT_URI`: `https://your-domain.vercel.app/api/auth/callback`

5. GitHub OAuth App ayarlarında **Authorization callback URL**'ini production URL'inize güncelleyin

## ⚠️ Önemli Notlar

- **Client Secret'ı asla public repository'lerde paylaşmayın**
- `.env.local` dosyası `.gitignore`'da olduğu için Git'e commit edilmeyecek
- Production'da `GITHUB_REDIRECT_URI`'yi mutlaka production URL'inize göre güncelleyin
- OAuth App ayarlarında callback URL'inin hem development hem production için doğru olduğundan emin olun

## 🧪 Test Modu

OAuth kurulumu yapmadan uygulamayı test etmek isterseniz:

- Ana sayfadaki **View Demo** butonuna tıklayın
- Demo modu mock data ile çalışır ve GitHub girişi gerektirmez

## 🐛 Sorun Giderme

### "GitHub Client ID not configured" Hatası

- `.env.local` dosyasının proje kök dizininde olduğundan emin olun
- Environment variable isimlerinin doğru yazıldığından emin olun (büyük/küçük harf duyarlı)
- Development server'ı yeniden başlatın (`Ctrl+C` ve `npm run dev`)

### "redirect_uri_mismatch" Hatası

- GitHub OAuth App ayarlarında callback URL'inin doğru olduğundan emin olun
- `.env.local` dosyasındaki `GITHUB_REDIRECT_URI` değerinin GitHub'daki callback URL ile eşleştiğinden emin olun

### Token Alınamıyor

- Client Secret'ın doğru kopyalandığından emin olun
- GitHub OAuth App'in aktif olduğundan emin olun
- Browser console'da hata mesajlarını kontrol edin

## 📚 Daha Fazla Bilgi

- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

