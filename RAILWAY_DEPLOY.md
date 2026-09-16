# Railway ga Deploy qilish — Qadamba-qadam

## 1. GitHub ga yuklash

```bash
# Loyiha papkasida terminal oching
git init
git add .
git commit -m "Initial commit"

# GitHub da yangi repo yarating (github.com/new)
git remote add origin https://github.com/SIZNING_USERNAME/loyiha-nomi.git
git push -u origin main
```

## 2. Railway da loyiha yaratish

1. **railway.app** ga kiring (GitHub bilan)
2. **"New Project"** tugmasini bosing
3. **"Deploy from GitHub repo"** tanlang
4. Repongizni tanlang
5. Railway avtomatik build boshlaydi ✅

## 3. Environment Variables qo'shish (MUHIM!)

Railway dashboardda: **Variables** bo'limiga o'ting va quyidagilarni qo'shing:

| Variable | Qiymat | Majburiy |
|---|---|---|
| `NODE_ENV` | `production` | ✅ |
| `SUPER_ADMIN_EMAIL` | `admin@sizningsayt.uz` | ✅ |
| `SUPER_ADMIN_PASSWORD` | Kuchli parol | ✅ |
| `JWT_SECRET` | Uzun random string (min 32 belgi) | ✅ |
| `APP_URL` | Railway bergan URL (quyida) | ✅ |
| `GEMINI_API_KEY` | Gemini API key | ❌ |

> **APP_URL ni qanday topish:**
> Railway deploy bo'lgandan keyin **Settings → Domains** bo'limida ko'rasiz.
> Masalan: `https://loyiha-production.railway.app`

## 4. To'lov tizimlari (ixtiyoriy)

Agar haqiqiy to'lov kerak bo'lsa, quyidagilarni ham qo'shing:

**Click:**
```
CLICK_MERCHANT_ID = my.click.uz dan olingan
CLICK_SERVICE_ID  = my.click.uz dan olingan
CLICK_SECRET_KEY  = my.click.uz dan olingan
```

**Payme:**
```
PAYME_MERCHANT_ID = merchant.payme.uz dan olingan
PAYME_SECRET_KEY  = merchant.payme.uz dan olingan
```

**Uzum:**
```
UZUM_MERCHANT_ID = business.uzumbank.uz dan olingan
```

**Stripe:**
```
STRIPE_PUBLISHABLE_KEY = pk_live_...
STRIPE_SECRET_KEY      = sk_live_...
```

> Kalitlar bo'lmasa — **demo rejimda** ishlaydi (to'lov simulyatsiya qilinadi).

## 5. Tekshirish

Deploy bo'lgandan keyin:
- `https://sizning-url.railway.app` — sayt
- `https://sizning-url.railway.app/api/health` — `{"status":"ok"}` chiqishi kerak

## Muammolar

**Build xatosi:** Railway loglarini tekshiring (Deployments → oxirgi deploy → Logs)

**"Application failed to respond":** `APP_URL` va `PORT` to'g'ri ekanligini tekshiring

**Admin kira olmayapti:** `SUPER_ADMIN_EMAIL` va `SUPER_ADMIN_PASSWORD` env da borligini tekshiring
