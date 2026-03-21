# ProMaterial Website

Intelligence for Magnet Manufacturing - Official Website

## 📋 Project Overview

This is the official website for ProMaterial, showcasing AI-powered quality solutions for magnet manufacturing. The site is built with:

- **HTML5** - Semantic markup
- **Tailwind CSS** - Responsive styling via CDN
- **Vanilla JavaScript** - Interactive components (no build step required)
- **Static hosting ready** - Deploy to any static host

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:8000 in your browser
```

### Deployment

This is a static site with no build process required. Deploy the `public/` directory to any static hosting provider.

## 📁 Project Structure

```
website/
├── public/
│   └── index.html          # Main website file
├── docs/
│   └── DEPLOYMENT.md       # Detailed deployment guide
├── .github/
│   └── workflows/
│       ├── deploy-netlify.yml
│       └── deploy-vercel.yml
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Project metadata
└── README.md               # This file
```

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Required variables:
- `VITE_GEMINI_API_KEY` - Google Gemini API key for the demo form
- Deployment-specific variables (see below)

## 🌐 Hosting Options

### Option 1: Netlify (Recommended)

1. Connect your GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `public/`
4. Add environment variables in Netlify dashboard
5. Connect to GoDaddy DNS

**Workflow:** `.github/workflows/deploy-netlify.yml` will auto-deploy on push to main

### Option 2: Vercel

1. Import project from GitHub
2. Framework: Other (Static)
3. Root Directory: `./`
4. Build Command: `npm run build`
5. Output Directory: `public/`

**Workflow:** `.github/workflows/deploy-vercel.yml` will auto-deploy on push to main

### Option 3: GitHub Pages

1. Enable GitHub Pages in repository settings
2. Select `main` branch → `docs/` folder (or `gh-pages` branch)
3. Set custom domain to your GoDaddy domain

### Option 4: AWS S3 + CloudFront

1. Create S3 bucket for static hosting
2. Enable static website hosting
3. Create CloudFront distribution
4. Update GoDaddy DNS to point to CloudFront

## 🔑 Setting Up Secrets for CI/CD

Add these to GitHub Secrets (Settings → Secrets and variables → Actions):

### For Netlify:
- `NETLIFY_SITE_ID`
- `NETLIFY_AUTH_TOKEN`

### For Vercel:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### For Google Gemini API:
- `VITE_GEMINI_API_KEY`

## 📝 Customization

### Update Content

Edit `/public/index.html` directly. The site uses:
- **Tailwind CSS** for styling (via CDN)
- **Font Awesome** for icons (via CDN)
- **Google Fonts** for typography

### Update API Integration

The demo form uses Google's Gemini API:

```javascript
// In index.html, update the API call:
const apiKey = process.env.VITE_GEMINI_API_KEY;
```

## 🔗 DNS Configuration (GoDaddy)

1. Go to GoDaddy Domain Management
2. Find DNS settings
3. Add CNAME record pointing to your hosting provider:
   - **Netlify**: Your site URL (e.g., `promaterial.netlify.app`)
   - **Vercel**: Your site URL (e.g., `promaterial.vercel.app`)
   - **GitHub Pages**: `yourusername.github.io`

4. Set TTL to 3600 (1 hour) for faster propagation

## 🚢 Deployment Checklist

- [ ] Update `.env` with actual API keys
- [ ] Test locally: `npm run dev`
- [ ] Add GitHub Secrets for CI/CD
- [ ] Push to `main` branch
- [ ] Verify automated deployment
- [ ] Test on staging URL
- [ ] Configure DNS on GoDaddy
- [ ] Test on custom domain

## ⚠️ Important Notes

### Missing Configuration

Before deploying, you'll need to provide:

1. **Google Gemini API Key**
   - Get from: https://ai.google.dev/
   - Add to GitHub Secrets as `VITE_GEMINI_API_KEY`

2. **Hosting Provider Credentials**
   - Choose Netlify, Vercel, or GitHub Pages
   - Add credentials to GitHub Secrets

3. **Domain Setup**
   - Ensure domain is registered on GoDaddy
   - Configure DNS records per hosting provider

4. **Email Setup** (Optional)
   - Currently form submissions are sent to Gemini API
   - Consider adding email service (SendGrid, Mailgun, etc.) for form handling

### Form Submission Flow

Currently, the form uses Google's Gemini API. For production, consider:

1. **Email notifications**: SendGrid, Mailgun, or AWS SES
2. **Form storage**: Firebase, Airtable, or custom backend
3. **Lead management**: HubSpot, Pipedrive, or similar CRM

## 📞 Support

For questions or issues:
- Email: promaterialuk@gmail.com
- Website: https://www.promaterial.co.uk/
- LinkedIn: https://www.linkedin.com/company/promaterialai/

## 📄 License

MIT License - See LICENSE file for details

---

**Ready to deploy?** See `docs/DEPLOYMENT.md` for step-by-step instructions.
