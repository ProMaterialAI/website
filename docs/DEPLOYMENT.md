# Deployment Guide - ProMaterial Website

Complete step-by-step guide to deploy the ProMaterial website.

## Prerequisites

- GitHub account with repository created
- Node.js installed locally
- Domain registered on GoDaddy
- Choice of hosting provider (Netlify, Vercel, or GitHub Pages)

## Step 1: Initialize GitHub Repository

```bash
# Navigate to project directory
cd /Users/yiningshen/ProMaterialWebsite/website

# Initialize git (if not already done)
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: ProMaterial website setup"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/promaterial-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Set Up SendGrid

1. Visit https://sendgrid.com/
2. Create or log in to your account
3. Verify a sender identity
4. Create an API key with Mail Send permissions
5. Copy the API key

## Step 3: Choose and Configure Hosting

### Option A: Netlify (Easiest - Recommended)

1. Go to https://netlify.com and sign up
2. Click "New site from Git"
3. Connect your GitHub account
4. Select your `promaterial-website` repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `public/`
6. Click "Deploy site"
7. Go to Site settings → Build & deploy → Environment
8. Add environment variables:
   - `SENDGRID_API_KEY`
   - `CONTACT_TO_EMAIL`
   - `CONTACT_FROM_EMAIL`
9. Note your Netlify subdomain (e.g., `promaterial-abc123.netlify.app`)

### Option B: Vercel

1. Go to https://vercel.com and sign up
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework: Other (Static)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `public/`
5. Add environment variables:
   - `SENDGRID_API_KEY`
   - `CONTACT_TO_EMAIL`
   - `CONTACT_FROM_EMAIL`
6. Click "Deploy"
7. Note your Vercel domain

### Option C: GitHub Pages

1. Go to your repository Settings
2. Navigate to Pages section
3. Select "Deploy from a branch"
4. Choose `main` branch and `/root` folder
5. Save
6. Wait for deployment to complete
7. Your site will be available at `https://YOUR_USERNAME.github.io/promaterial-website`

## Step 4: Add GitHub Secrets (for CI/CD)

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add secrets:

### For Netlify:
```
Name: NETLIFY_AUTH_TOKEN
Value: (get from Netlify → Account settings → Applications → Personal access tokens)

Name: NETLIFY_SITE_ID
Value: (get from Netlify → Site settings → General → Site ID)
```

### For Vercel:
```
Name: VERCEL_TOKEN
Value: (get from Vercel → Settings → Tokens)

Name: VERCEL_ORG_ID
Value: (from Vercel → Settings → General)

Name: VERCEL_PROJECT_ID
Value: (from Vercel → Settings → General)
```

### Contact Form:
```
Name: SENDGRID_API_KEY
Value: Your SendGrid API key

Name: CONTACT_TO_EMAIL
Value: Inbox where demo requests should be delivered

Name: CONTACT_FROM_EMAIL
Value: Verified SendGrid sender address
```

## Step 5: Update DNS on GoDaddy

1. Log in to your GoDaddy account
2. Go to My Products → Domains
3. Click on your domain
4. Find DNS section
5. Edit DNS records

### For Netlify:
Add/update CNAME record:
- Host: `@` (or your subdomain)
- Points to: Your Netlify app URL (e.g., `promaterial-abc123.netlify.app`)
- TTL: 3600

### For Vercel:
Add/update CNAME record:
- Host: `@`
- Points to: `cname.vercel-dns.com.`
- TTL: 3600

### For GitHub Pages:
Add A records:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```
And CNAME for www:
- Host: `www`
- Points to: `YOUR_USERNAME.github.io`

## Step 6: Verify Deployment

1. After 15-30 minutes, visit your domain
2. Should see your ProMaterial website
3. Test the demo form functionality
4. Check browser console for any errors

## Step 7: SSL Certificate (HTTPS)

Most hosting providers auto-enable HTTPS:
- **Netlify**: Automatic with Let's Encrypt
- **Vercel**: Automatic with Vercel SSL
- **GitHub Pages**: Automatic with GitHub's SSL
- **GoDaddy**: May need to enable in domain settings

## Troubleshooting

### Site not appearing
- DNS changes take 15-30 minutes to propagate
- Clear browser cache and hard refresh (Ctrl+F5 or Cmd+Shift+R)
- Check DNS settings on GoDaddy

### Form not working
- Check SendGrid variables are correctly set in environment variables
- Confirm `CONTACT_FROM_EMAIL` is a verified sender in SendGrid
- Open browser DevTools → Console for error messages
- Verify your SendGrid API key has Mail Send permission

### Build failing
- Check GitHub Actions logs
- Verify all secrets are added correctly
- Run `npm run build` locally to test

### HTTPS not working
- Wait 5-10 minutes for SSL to provision
- Clear browser cache
- Try in incognito mode

## Continuous Deployment

After setup, any push to the `main` branch will automatically:
1. Trigger GitHub Actions workflow
2. Deploy the site and `/api/contact` endpoint
3. Publish the update to your hosting provider
4. Site updates in ~2-5 minutes

## Testing Locally

```bash
# Serve locally to test
npm run preview

# Visit http://localhost:8000
```

## Update Content for Production

1. Edit `public/index.html`
2. Test locally: `npm run preview`
3. Commit and push:
   ```bash
   git add public/index.html
   git commit -m "Update website content"
   git push
   ```
4. Deployment happens automatically

## Support

- Netlify Support: https://docs.netlify.com/
- Vercel Docs: https://vercel.com/docs
- GitHub Pages: https://pages.github.com/
- GoDaddy Help: https://www.godaddy.com/help

---

**Next steps**: Test everything and monitor deployment logs!
