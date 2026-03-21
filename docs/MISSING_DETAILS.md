# Missing Configuration Details

This document outlines all the information you need to gather to complete the deployment setup.

## 🔑 Required API Keys & Credentials

### 1. Google Gemini API Key
**Status**: ⚠️ REQUIRED for demo form functionality

- **What it is**: Authentication key for Google's AI API
- **Where to get it**: https://ai.google.dev/
- **How to use**: 
  1. Visit the link and sign up/log in
  2. Create a new API key
  3. Copy and save securely
  4. Add to `.env` file as `VITE_GEMINI_API_KEY`
  5. Add to GitHub Secrets

**Alternative**: If you want to use email instead of AI responses for form submissions, consider:
- SendGrid API key
- Mailgun API key
- AWS SES credentials

## 📋 Hosting Provider Information

Choose ONE of the following:

### Option 1: Netlify (Recommended)
**Status**: ⚠️ REQUIRED if using Netlify

- `NETLIFY_SITE_ID`: Get from Netlify dashboard → Site settings → General → Site ID
- `NETLIFY_AUTH_TOKEN`: Get from Netlify → Account settings → Applications → Personal access tokens

### Option 2: Vercel
**Status**: ⚠️ REQUIRED if using Vercel

- `VERCEL_TOKEN`: Personal access token from Vercel settings
- `VERCEL_ORG_ID`: Organization ID from Vercel settings
- `VERCEL_PROJECT_ID`: Project ID from Vercel settings

### Option 3: GitHub Pages
**Status**: ⚠️ Built-in (no external credentials needed)

- Automatically deploys from main branch
- No additional setup required

## 🌐 GitHub Repository Setup

**Status**: ⚠️ REQUIRED

1. GitHub username/organization
2. Repository name (suggest: `promaterial-website`)
3. Repository URL (will be: `https://github.com/YOUR_USERNAME/promaterial-website.git`)

Steps:
- [ ] Create new repository on GitHub
- [ ] Initialize git locally
- [ ] Push code to repository
- [ ] Add GitHub Secrets (see below)

## 🔐 GitHub Secrets to Add

Location: Settings → Secrets and variables → Actions

**Required for ANY deployment**:
- [ ] `VITE_GEMINI_API_KEY` - Your Gemini API key

**If using Netlify**:
- [ ] `NETLIFY_AUTH_TOKEN`
- [ ] `NETLIFY_SITE_ID`

**If using Vercel**:
- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`

## 🌍 GoDaddy Domain Information

**Status**: ⚠️ REQUIRED for custom domain

1. Domain name you want to use (already registered on GoDaddy)
2. GoDaddy account access
3. Decision on hosting provider (determines DNS CNAME record)

For DNS setup, you'll need:
- Your hosting provider's URL/domain
- GoDaddy login credentials
- Administrator access to domain DNS

## 📧 Email Integration (Optional)

For form submissions to send you emails, you'll need:

**Option 1: SendGrid**
- SendGrid API key
- From email address
- To email address(es) for notifications

**Option 2: Mailgun**
- Mailgun API key
- Domain
- From email address

**Option 3: AWS SES**
- AWS Access Key ID
- AWS Secret Access Key
- SES verified sender email

**Option 4: Custom Backend**
- Backend URL
- Authentication method
- API documentation

*Currently the form uses Gemini API for responses. Email integration requires backend changes.*

## 🎯 Checklist Before Deployment

### Pre-Deployment
- [ ] Google Gemini API key obtained
- [ ] Hosting provider chosen and account created
- [ ] GitHub repository created
- [ ] Domain registered on GoDaddy
- [ ] GitHub Secrets added
- [ ] `.env` file created locally

### Deployment
- [ ] Code pushed to GitHub main branch
- [ ] GitHub Actions workflow triggered successfully
- [ ] Site deployed to staging URL
- [ ] DNS records updated on GoDaddy
- [ ] Domain resolves (wait 15-30 minutes for propagation)
- [ ] HTTPS certificate installed (auto with most providers)
- [ ] Forms tested and working

### Post-Deployment
- [ ] Site accessible via custom domain
- [ ] Demo form submitting successfully
- [ ] Analytics configured (if desired)
- [ ] Monitoring set up
- [ ] Backup strategy planned

## 📱 Contact Information to Collect

For the website form recipients:
- [ ] Email address(es) for demo requests
- [ ] Fallback contact method
- [ ] Response SLA (e.g., within 24 hours)

## 🔄 Maintenance Considerations

- How often will you update the website?
- Who has deployment access?
- Version control strategy?
- Disaster recovery plan?
- Analytics/monitoring setup?

## 📞 Quick Reference

| Item | Needed For | Priority |
|------|-----------|----------|
| Gemini API Key | Demo form | High |
| Hosting credentials | Site hosting | High |
| GitHub repo | CI/CD pipeline | High |
| GoDaddy access | DNS records | High |
| Email integration | Form notifications | Medium |
| Analytics setup | Traffic tracking | Low |

---

## Next Steps

1. **Gather all information** from this checklist
2. **Follow DEPLOYMENT.md** step-by-step
3. **Test at each stage** before moving forward
4. **Keep credentials secure** - use GitHub Secrets, not hardcoding
5. **Document** your setup for future reference

For questions about any items, refer to the links in README.md or contact ProMaterial support.
