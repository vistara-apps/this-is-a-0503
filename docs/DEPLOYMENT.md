# FitFlow AI - Deployment Guide

## Overview

This guide covers deploying FitFlow AI to production environments, including setup for all external services and monitoring.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [External Services Configuration](#external-services-configuration)
4. [Build and Deploy](#build-and-deploy)
5. [Monitoring and Analytics](#monitoring-and-analytics)
6. [Security Considerations](#security-considerations)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts
- **OpenAI Account**: For AI-powered features
- **Supabase Account**: For database and authentication
- **Stripe Account**: For payment processing
- **Hosting Provider**: Vercel, Netlify, or similar
- **Domain Name**: For production deployment

### Development Tools
- Node.js 18+
- Git
- Docker (optional)

## Environment Setup

### 1. Clone and Install
```bash
git clone https://github.com/vistara-apps/this-is-a-0503.git
cd this-is-a-0503
npm install
```

### 2. Environment Variables
Create production `.env` file:

```bash
# Production Environment Variables

# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-your-production-openai-key
VITE_OPENAI_BASE_URL=https://api.openai.com/v1

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key

# App Configuration
VITE_APP_NAME=FitFlow AI
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://your-domain.com/api

# Production Settings
NODE_ENV=production
VITE_DEBUG=false
```

## External Services Configuration

### OpenAI Setup

1. **Create OpenAI Account**
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Create account and verify email
   - Add payment method for API usage

2. **Generate API Key**
   ```bash
   # Navigate to API Keys section
   # Create new secret key
   # Copy key to VITE_OPENAI_API_KEY
   ```

3. **Set Usage Limits**
   - Configure monthly spending limits
   - Set up usage alerts
   - Monitor API usage regularly

4. **API Key Security**
   ```bash
   # Restrict API key usage (optional)
   # Set allowed domains/IPs
   # Enable key rotation schedule
   ```

### Supabase Setup

1. **Create Supabase Project**
   ```bash
   # Visit https://supabase.com/
   # Create new project
   # Choose region closest to users
   # Set strong database password
   ```

2. **Database Schema Setup**
   ```sql
   -- Run in Supabase SQL Editor
   
   -- Enable Row Level Security
   ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
   
   -- User Profiles Table
   CREATE TABLE user_profiles (
     id UUID REFERENCES auth.users ON DELETE CASCADE,
     user_id UUID REFERENCES auth.users ON DELETE CASCADE,
     subscription_tier TEXT DEFAULT 'free',
     stripe_customer_id TEXT,
     preferences JSONB DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     PRIMARY KEY (id)
   );
   
   -- Workouts Table
   CREATE TABLE workouts (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users ON DELETE CASCADE,
     exercise_type TEXT NOT NULL,
     start_time TIMESTAMP WITH TIME ZONE NOT NULL,
     end_time TIMESTAMP WITH TIME ZONE,
     duration INTEGER,
     metrics JSONB DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Exercises Table
   CREATE TABLE exercises (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL UNIQUE,
     description TEXT,
     muscle_groups TEXT[],
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Row Level Security Policies
   CREATE POLICY "Users can view own profile" ON user_profiles
     FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can update own profile" ON user_profiles
     FOR UPDATE USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can view own workouts" ON workouts
     FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can insert own workouts" ON workouts
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can update own workouts" ON workouts
     FOR UPDATE USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can delete own workouts" ON workouts
     FOR DELETE USING (auth.uid() = user_id);
   
   -- Enable RLS on all tables
   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
   ```

3. **Authentication Configuration**
   ```bash
   # In Supabase Dashboard > Authentication > Settings
   
   # Site URL: https://your-domain.com
   # Redirect URLs: https://your-domain.com/auth/callback
   
   # Enable email confirmation
   # Configure email templates
   # Set up OAuth providers (optional)
   ```

4. **API Keys and URLs**
   ```bash
   # Copy from Supabase Dashboard > Settings > API
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Stripe Setup

1. **Create Stripe Account**
   ```bash
   # Visit https://stripe.com/
   # Create account and verify business details
   # Complete account setup for live payments
   ```

2. **Create Products and Prices**
   ```bash
   # In Stripe Dashboard > Products
   
   # Core Plan
   Product: FitFlow AI Core
   Price: $5.00 USD / month
   Price ID: price_core_monthly_live
   
   # Advanced Plan  
   Product: FitFlow AI Advanced
   Price: $15.00 USD / month
   Price ID: price_advanced_monthly_live
   ```

3. **Configure Webhooks**
   ```bash
   # Endpoint URL: https://your-domain.com/api/stripe/webhook
   # Events to send:
   # - customer.subscription.created
   # - customer.subscription.updated
   # - customer.subscription.deleted
   # - invoice.payment_succeeded
   # - invoice.payment_failed
   ```

4. **API Keys**
   ```bash
   # Copy from Stripe Dashboard > Developers > API Keys
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```

## Build and Deploy

### Build for Production
```bash
# Install dependencies
npm install

# Build application
npm run build

# Test build locally
npm run preview
```

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel --prod
   ```

3. **Configure Environment Variables**
   ```bash
   # In Vercel Dashboard > Project > Settings > Environment Variables
   # Add all production environment variables
   ```

4. **Custom Domain**
   ```bash
   # In Vercel Dashboard > Project > Settings > Domains
   # Add your custom domain
   # Configure DNS records as instructed
   ```

### Deploy to Netlify

1. **Build Settings**
   ```bash
   # Build command: npm run build
   # Publish directory: dist
   ```

2. **Environment Variables**
   ```bash
   # In Netlify Dashboard > Site Settings > Environment Variables
   # Add all production environment variables
   ```

3. **Deploy**
   ```bash
   # Connect GitHub repository
   # Configure auto-deploy on main branch
   # Deploy site
   ```

### Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t fitflow-ai .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 \
     -e VITE_OPENAI_API_KEY=your-key \
     -e VITE_SUPABASE_URL=your-url \
     -e VITE_SUPABASE_ANON_KEY=your-key \
     -e VITE_STRIPE_PUBLISHABLE_KEY=your-key \
     fitflow-ai
   ```

3. **Docker Compose**
   ```yaml
   version: '3.8'
   services:
     fitflow-ai:
       build: .
       ports:
         - "3000:3000"
       environment:
         - VITE_OPENAI_API_KEY=${VITE_OPENAI_API_KEY}
         - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
         - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
         - VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY}
   ```

## Monitoring and Analytics

### Error Tracking

1. **Sentry Setup**
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

   ```javascript
   // src/main.jsx
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: "your-sentry-dsn",
     environment: "production",
     tracesSampleRate: 1.0,
   });
   ```

2. **Error Boundaries**
   ```javascript
   // Wrap app with Sentry error boundary
   const SentryApp = Sentry.withErrorBoundary(App, {
     fallback: ErrorFallback,
     beforeCapture: (scope) => {
       scope.setTag("location", "app");
     },
   });
   ```

### Performance Monitoring

1. **Web Vitals**
   ```javascript
   // src/utils/analytics.js
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
   
   function sendToAnalytics(metric) {
     // Send to your analytics service
     console.log(metric);
   }
   
   getCLS(sendToAnalytics);
   getFID(sendToAnalytics);
   getFCP(sendToAnalytics);
   getLCP(sendToAnalytics);
   getTTFB(sendToAnalytics);
   ```

2. **API Monitoring**
   ```javascript
   // Monitor API response times and errors
   const apiMonitor = {
     logRequest: (endpoint, duration, success) => {
       // Log to monitoring service
     }
   };
   ```

### Usage Analytics

1. **Google Analytics 4**
   ```javascript
   // Install gtag
   npm install gtag
   
   // Configure in main.jsx
   import { gtag } from 'gtag';
   
   gtag('config', 'GA_MEASUREMENT_ID');
   ```

2. **Custom Events**
   ```javascript
   // Track user actions
   const trackEvent = (action, category, label) => {
     gtag('event', action, {
       event_category: category,
       event_label: label,
     });
   };
   ```

## Security Considerations

### HTTPS Configuration
```bash
# Ensure all traffic uses HTTPS
# Configure SSL certificates
# Set up HSTS headers
# Use secure cookies
```

### Content Security Policy
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://js.stripe.com;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://api.openai.com https://*.supabase.co https://api.stripe.com;">
```

### API Key Security
```bash
# Rotate API keys regularly
# Use environment-specific keys
# Monitor API usage for anomalies
# Set up usage alerts
```

### Database Security
```sql
-- Enable audit logging
-- Regular security updates
-- Monitor for suspicious queries
-- Backup encryption
```

## Health Checks and Monitoring

### Application Health Check
```javascript
// src/api/health.js
export const healthCheck = async () => {
  const checks = {
    openai: await checkOpenAI(),
    supabase: await checkSupabase(),
    stripe: await checkStripe(),
  };
  
  return {
    status: Object.values(checks).every(c => c.status === 'ok') ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString()
  };
};
```

### Uptime Monitoring
```bash
# Set up monitoring with services like:
# - Pingdom
# - UptimeRobot  
# - StatusPage.io
# - New Relic
```

## Backup and Recovery

### Database Backups
```bash
# Supabase automatic backups are enabled
# Configure backup retention policy
# Test restore procedures regularly
```

### Code Backups
```bash
# Git repository backups
# Multiple remote repositories
# Regular code snapshots
```

### Disaster Recovery Plan
```bash
# Document recovery procedures
# Test disaster recovery scenarios
# Maintain emergency contacts
# Keep offline backups
```

## Performance Optimization

### Build Optimization
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          ui: ['lucide-react']
        }
      }
    }
  }
});
```

### CDN Configuration
```bash
# Configure CDN for static assets
# Enable gzip compression
# Set appropriate cache headers
# Use image optimization
```

### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_start_time ON workouts(start_time);

-- Optimize queries
-- Monitor slow queries
-- Regular VACUUM and ANALYZE
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Check for TypeScript errors
   npm run type-check
   ```

2. **API Connection Issues**
   ```bash
   # Verify environment variables
   # Check API key validity
   # Test network connectivity
   # Review CORS settings
   ```

3. **Database Connection Problems**
   ```bash
   # Check Supabase project status
   # Verify connection strings
   # Review RLS policies
   # Check user permissions
   ```

4. **Payment Processing Issues**
   ```bash
   # Verify Stripe webhook endpoints
   # Check API key permissions
   # Review webhook event handling
   # Test in Stripe test mode
   ```

### Debug Mode
```bash
# Enable debug logging
VITE_DEBUG=true

# Check browser console
# Review network requests
# Monitor API responses
```

### Support Contacts
- **OpenAI Support**: https://help.openai.com/
- **Supabase Support**: https://supabase.com/support
- **Stripe Support**: https://support.stripe.com/
- **Vercel Support**: https://vercel.com/support
- **Netlify Support**: https://www.netlify.com/support/

## Maintenance

### Regular Tasks
```bash
# Weekly:
# - Review error logs
# - Check API usage
# - Monitor performance metrics

# Monthly:
# - Update dependencies
# - Review security alerts
# - Backup verification

# Quarterly:
# - Security audit
# - Performance review
# - Disaster recovery test
```

### Updates and Patches
```bash
# Security updates (immediate)
npm audit fix

# Dependency updates (scheduled)
npm update

# Major version updates (planned)
# Test in staging first
# Plan rollback strategy
```

This deployment guide ensures a secure, scalable, and maintainable production deployment of FitFlow AI.
