# Deployment Guide

> **Version:** 1.0  
> **Last Updated:** 5 July 2026  
> **Status:** Draft

---

## Purpose

This document provides step-by-step instructions for setting up local development environments and deploying the KuHu Apparels platform to production. It covers all services: Vercel (frontend), Railway (backend), Neon (database), Cloudinary (images), Resend (emails), and Razorpay (payments).

---

## 1. Architecture Overview

```mermaid
graph TB
    User[User Browser] --> Vercel[Vercel - Frontend]
    Vercel --> Railway[Railway - Django Backend]
    Railway --> Neon[Neon - PostgreSQL]
    Railway --> Cloudinary[Cloudinary - Images]
    Railway --> Resend[Resend - Emails]
    Railway --> Razorpay[Razorpay - Payments]
    Vercel --> GA4[Google Analytics 4]
    
    style Vercel fill:#000,color:#fff
    style Railway fill:#7B3FE4,color:#fff
    style Neon fill:#00E599,color:#000
    style Cloudinary fill:#3448C5,color:#fff
    style Resend fill:#000,color:#fff
    style Razorpay fill:#02042C,color:#fff
    style GA4 fill:#FF9800,color:#000
```

---

## 2. Local Development

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Backend runtime |
| Node.js | 20 LTS | Frontend runtime |
| PostgreSQL | 15+ | Database (optional — use Neon in dev too) |
| Git | Latest | Version control |
| pip | Latest | Python package manager |

### Backend Setup

```bash
# Clone the repository
git clone <repo-url>
cd ecommerce/backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements/local.txt

# Create environment file
cp .env.example .env
# Edit .env with your local settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### Frontend Setup

```bash
cd ecommerce/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Docker Setup (Alternative)

TODO: Create and document Docker-based local development.

---

## 3. Environment Variables

### Backend (`backend/.env`)

```env
# Django
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@host:5432/kuhu_apparels

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

# Resend
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@kuhuapparels.com

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret

# Frontend URL (for emails, redirects)
FRONTEND_URL=http://localhost:5173

# Sentry (optional, post-MVP)
SENTRY_DSN=
```

### Frontend (`frontend/.env`)

```env
# API
VITE_API_BASE_URL=http://localhost:8000/api

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# Razorpay
VITE_RAZORPAY_KEY_ID=your-key-id

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Environment Variable Security Rules

- Never commit `.env` files to Git (except `.env.example`).
- All secrets must be set as environment variables in production (Railway, Vercel).
- Use different credentials for development and production.
- Rotate secrets if they are ever exposed.

---

## 4. Neon (Database)

### Setup

1. Go to [neon.tech](https://neon.tech) and sign up (GitHub OAuth recommended).
2. Create a new project.
3. Copy the connection string from the dashboard.

### Connection String Format

```
postgresql://{user}:{password}@{hostname}/{dbname}?sslmode=require
```

### Configuration Notes

- Use the **Pooled connection** string for production (includes `-pooler` in hostname).
- Enable **PgBouncer** for connection pooling (available in Neon free tier).
- Set `sslmode=require` in production.

### Branching (Development)

Neon supports database branching. Use branches for:
- Feature development (branch per feature)
- Staging environment
- Testing migrations

---

## 5. Railway (Backend)

### Setup

1. Go to [railway.app](https://railway.app) and sign up (GitHub OAuth recommended).
2. Create a new project → "Deploy from GitHub repo".
3. Connect your repository.
4. Railway auto-detects the `Dockerfile` or `manage.py`.
5. Set environment variables in the Railway dashboard.

### Railway Configuration

#### `railway.json` (Project Root)

TODO: Create `railway.json` for project configuration.

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && pip install -r requirements/production.txt && python manage.py collectstatic --noinput && python manage.py migrate"
  },
  "deploy": {
    "startCommand": "cd backend && gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4 --timeout 120",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### Dockerfile (Alternative)

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY backend/requirements/ ./requirements/
RUN pip install --no-cache-dir -r requirements/production.txt

COPY backend/ .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120"]
```

### Environment Variables on Railway

| Variable | Value |
|---|---|
| `DJANGO_SECRET_KEY` | Generate via `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DJANGO_DEBUG` | `False` |
| `DJANGO_ALLOWED_HOSTS` | `{railway-domain}.railway.app, kuhuapparels.com, www.kuhuapparels.com` |
| `DATABASE_URL` | Neon connection string |
| `CORS_ALLOWED_ORIGINS` | `https://kuhuapparels.vercel.app, https://kuhuapparels.com` |
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth client secret |
| `CLOUDINARY_*` | Cloudinary credentials |
| `RAZORPAY_*` | Razorpay live credentials |
| `RESEND_*` | Resend API key |
| `FRONTEND_URL` | `https://kuhuapparels.vercel.app` |
| `DJANGO_SETTINGS_MODULE` | `config.settings.production` |

### Deployment Commands

```bash
# Manual deploy (if not using auto-deploy)
railway up

# View logs
railway logs

# Open in browser
railway open
```

### Health Check

Railway automatically checks if the app is responding. Ensure the root URL returns a 200 response.

---

## 6. Vercel (Frontend)

### Setup

1. Go to [vercel.com](https://vercel.com) and sign up (GitHub OAuth recommended).
2. Click "Add New" → "Project".
3. Import your repository.
4. Configure:

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js Version | 20.x |

### Environment Variables on Vercel

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://{railway-domain}.railway.app/api` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Upload preset (unsigned) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (same as backend) |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key ID (live) |
| `VITE_GA_MEASUREMENT_ID` | GA4 measurement ID |

### Vercel Configuration

```json
// vercel.json (inside frontend/)
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### Custom Domain

1. Go to Vercel project → "Domains".
2. Add `kuhuapparels.com` and `www.kuhuapparels.com`.
3. Update DNS records at your domain provider:
   - `A` record: `76.76.21.21`
   - `CNAME` for `www`: `cname.vercel-dns.com`

---

## 7. Cloudinary

### Setup

1. Go to [cloudinary.com](https://cloudinary.com) and sign up.
2. Note your **Cloud Name**, **API Key**, and **API Secret** from the dashboard.

### Upload Preset (Unsigned)

For frontend direct uploads (customizer logo upload):

1. Go to Settings → Upload → Upload Presets.
2. Create a new preset:
   - Name: `kuhu_uploads` (or similar)
   - Signing Mode: **Unsigned**
   - Folder: `kuhu-apparels/customizations`
   - Allowed formats: `png`, `jpg`, `jpeg`, `svg`, `webp`

### Transformations

See the [UI Design Bible](./04_UI_Design_Bible.md#cloudinary-transformations) for image transformation URLs.

---

## 8. Resend

### Setup

1. Go to [resend.com](https://resend.com) and sign up.
2. Verify your domain (`kuhuapparels.com`):
   - Add DKIM records to your DNS provider.
   - This may take up to 48 hours to propagate.
3. Create an API key.
4. Set the API key in Railway environment variables.

### Email Templates

TODO: Create email templates using React Email for:
- Order confirmation
- Payment receipt
- Shipping update
- Account registration welcome

---

## 9. Razorpay

### Setup

1. Go to [razorpay.com](https://razorpay.com) and sign up.
2. Complete KYC for live mode.
3. In Dashboard → Settings → API Keys:
   - Generate Key ID and Key Secret.
   - Use **Test mode** keys for development, **Live mode** keys for production.

### Webhook Configuration

1. In Razorpay Dashboard → Settings → Webhooks:
   - URL: `https://{railway-domain}.railway.app/api/payments/webhook/`
   - Events: `payment.captured`, `payment.failed`, `order.paid`
   - Secret: Generate a webhook secret and set as `RAZORPAY_WEBHOOK_SECRET` in Railway.

### Testing

Use Razorpay test card numbers:
- **Visa:** `4111 1111 1111 1111`
- **UPI:** `success@razorpay` (for successful payment)
- **UPI:** `failure@razorpay` (for failed payment)

---

## 10. Google Analytics 4

### Setup

1. Go to [analytics.google.com](https://analytics.google.com).
2. Create a new GA4 property for `KuHu Apparels`.
3. Copy the **Measurement ID** (`G-XXXXXXXXXX`).
4. Add to Vercel environment variables as `VITE_GA_MEASUREMENT_ID`.

### Events to Track

| Event | Trigger |
|---|---|
| `page_view` | Automatic (GA4) |
| `view_item` | Product detail page view |
| `add_to_cart` | Add to cart click |
| `remove_from_cart` | Remove from cart |
| `begin_checkout` | Checkout page load |
| `add_shipping_info` | Shipping details filled |
| `add_payment_info` | Payment method selected |
| `purchase` | Successful payment |
| `customize_product` | Customizer loaded |
| `save_design` | Design saved |

---

## 11. CI/CD

### GitHub Actions (Suggestion)

TODO: Set up GitHub Actions for:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements/local.txt
      - name: Run tests
        run: |
          cd backend
          pytest --cov
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      - name: Lint
        run: |
          cd frontend
          npm run lint
      - name: Type check
        run: |
          cd frontend
          npm run typecheck
      - name: Build
        run: |
          cd frontend
          npm run build
```

---

## 12. Production Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured in Railway and Vercel
- [ ] `DJANGO_DEBUG=False` in production
- [ ] `SECRET_KEY` is a strong, unique value (not the default)
- [ ] `ALLOWED_HOSTS` configured for production domains
- [ ] `CORS_ALLOWED_ORIGINS` set to production frontend URL
- [ ] Database migrations have been applied
- [ ] Static files collected (`python manage.py collectstatic`)
- [ ] Cloudinary configuration verified
- [ ] Razorpay live keys configured
- [ ] Resend domain verified (DKIM records propagated)

### Post-Deployment

- [ ] Frontend loads without errors
- [ ] Backend health endpoint responds
- [ ] API calls work from frontend to backend (CORS)
- [ ] User registration works end-to-end
- [ ] Product images load from Cloudinary
- [ ] Cart operations work
- [ ] Checkout flow works (test mode)
- [ ] Email notifications are delivered
- [ ] Analytics events are firing
- [ ] HTTPS is working (SSL certificate valid)
- [ ] Custom domain is resolving (if set up)

---

## 13. Monitoring & Logging

### Backend Logging

- Railway provides log streaming in the dashboard.
- For structured logging, use Python's `logging` module with JSON formatter.

### Error Tracking

TODO: Set up Sentry for production error tracking.

```python
# settings/production.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

if SENTRY_DSN := env("SENTRY_DSN", default=None):
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        environment="production",
        traces_sample_rate=0.1,
    )
```

### Uptime Monitoring

TODO: Set up uptime monitoring (e.g., UptimeRobot free tier, or Railway's built-in monitoring).

---

## 14. Backup Strategy

### Database Backups

- **Neon** provides automatic backups (point-in-time recovery).
- For additional safety:
  - Weekly `pg_dump` via cron job or Railway cron.
  - Store backups in Cloudinary or S3-compatible storage.

### Media Backups

- Cloudinary stores all images — no additional backup needed.
- Customization design JSON is stored in PostgreSQL (backed up with DB).

---

## 15. Rollback Plan

### Frontend Rollback

1. In Vercel dashboard → Deployments → Find the last working deployment.
2. Click the "..." menu → "Promote to Production".

### Backend Rollback

1. **Simple:** Railway auto-deploys from GitHub — revert the commit.
2. **Complex:** Use `railway rollback` to previous deployment.
3. **Database:** Restore from Neon backup if schema changes need reverting.

---

## 16. Cost Estimates (Monthly)

| Service | Free Tier | Paid Tier (If Needed) |
|---|---|---|
| Vercel | 100GB bandwidth, 6000 build mins | $20/month (Pro) |
| Railway | $5 credit | $5/month (Starter) |
| Neon | 500MB storage | $19/month (Launch) |
| Cloudinary | 25GB storage, 25GB bandwidth | $89/month (Plus) |
| Resend | 100 emails/day | $10/month (250K emails) |
| Razorpay | No monthly fee | Pay per transaction (2% + GST) |
| Domain | ~₹800/year (`.com`) | — |
| **Total (Free)** | **~₹0-₹800/year** | — |
| **Total (Paid)** | **~$40-50/month** | If we need to scale |

---

## 17. Open Questions

- [ ] Should we use Railway's built-in PostgreSQL add-on instead of Neon?
- [ ] Do we need a staging environment (separate Railway project)?
- [ ] Should we implement a CDN for static files (Cloudinary serves media, but what about Django static files)?
- [ ] What monitoring/alerting setup should we use?
- [ ] Should we set up a CI/CD pipeline before or after MVP launch?

## 18. References

- [Architecture Decisions](./03_Architecture_Decisions.md) — ADR-013 (Vercel + Railway), ADR-009 (Cloudinary), ADR-010 (Razorpay), ADR-011 (Resend)
- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Resend Documentation](https://resend.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)

---

*This deployment guide should be updated as infrastructure evolves.*
