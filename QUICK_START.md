# Quick Setup Guide

Complete these steps to deploy your ProMaterial website:

## 1️⃣ Create GitHub Repository
```bash
cd /Users/yiningshen/ProMaterialWebsite/website
git init
git add .
git commit -m "Initial ProMaterial website"
git remote add origin https://github.com/YOUR_USERNAME/promaterial-website.git
git branch -M main
git push -u origin main
```

## 2️⃣ Get Required Credentials

### For Form Integration:
- [ ] Google Gemini API Key: https://ai.google.dev/
  
### Choose Your Hosting (pick ONE):

**Netlify (Easiest)**:
- [ ] Create account at https://netlify.com
- [ ] Connect GitHub repo
- [ ] Get `NETLIFY_SITE_ID` and `NETLIFY_AUTH_TOKEN`

**Vercel**:
- [ ] Create account at https://vercel.com
- [ ] Import GitHub repo
- [ ] Get `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

**GitHub Pages (Simplest)**:
- [ ] Enable in repository Settings → Pages
- [ ] No credentials needed!

## 3️⃣ Add GitHub Secrets
Go to: Repository Settings → Secrets and variables → Actions

Add based on your hosting choice:

### All options need:
```
Name: VITE_GEMINI_API_KEY
Value: [Your Gemini API key]
```

### If using Netlify:
```
Name: NETLIFY_AUTH_TOKEN
Value: [Your token]

Name: NETLIFY_SITE_ID
Value: [Your site ID]
```

### If using Vercel:
```
Name: VERCEL_TOKEN
Value: [Your token]

Name: VERCEL_ORG_ID
Value: [Your org ID]

Name: VERCEL_PROJECT_ID
Value: [Your project ID]
```

## 4️⃣ Configure DNS on GoDaddy

1. Log in to GoDaddy
2. Go to your domain settings
3. Find DNS records section

Add CNAME record:
- **Host**: `@` (root domain)
- **Points to**: 
  - Netlify: `[your-site].netlify.app`
  - Vercel: `cname.vercel-dns.com`
  - GitHub Pages: `[username].github.io`
- **TTL**: 3600

## 5️⃣ Test Everything

```bash
# Test locally
npm run dev
# Visit http://localhost:8000

# Then push to GitHub
git push origin main

# Deployment automatically starts!
# Watch GitHub Actions for status
```

## 6️⃣ Verify Deployment

1. Wait 5 minutes for deployment to complete
2. Check your GitHub Actions tab for build status
3. Visit your hosting provider URL to test
4. Wait 15-30 minutes for DNS propagation
5. Access via your GoDaddy domain

## 📋 You Need These Things

| Item | Get From | Priority |
|------|----------|----------|
| Gemini API Key | https://ai.google.dev/ | 🔴 REQUIRED |
| GitHub Account | https://github.com | 🔴 REQUIRED |
| Hosting Account | Netlify/Vercel/GitHub | 🔴 REQUIRED |
| GoDaddy Domain | Already registered | 🔴 REQUIRED |

## ⚡ Quick Commands

```bash
# Setup
git init && git add . && git commit -m "Initial"

# Test locally
npm install
npm run dev

# Deploy
git push origin main
```

## 🆘 Troubleshooting

**Domain not working?**
- DNS takes 15-30 minutes to update
- Check GitHub Actions for deployment status
- Clear browser cache (Ctrl+F5)

**Form not working?**
- Check GitHub Secrets for correct Gemini API key
- Open browser console (F12) for errors
- Test Gemini API key at https://ai.google.dev/

**Build failing?**
- Check GitHub Actions logs
- Run `npm run build` locally
- Verify all files are committed

## 🎉 Success!

Once deployed:
- ✅ Site accessible at your domain
- ✅ Demo form working
- ✅ Automatic updates on GitHub push
- ✅ HTTPS enabled automatically

**Need more details?** See `docs/DEPLOYMENT.md` and `docs/MISSING_DETAILS.md`
