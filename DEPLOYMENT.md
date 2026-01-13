# Deployment Guide for StudyKit

## ✅ Pre-Deployment Checklist

### Code Quality
- [x] All tests passing (frontend + backend + integration)
- [x] CI/CD pipeline configured (GitHub Actions)
- [x] Docker image optimized (1.67GB)
- [x] Database migrations ready
- [x] Environment variables documented

### Documentation
- [x] README.md comprehensive and up-to-date
- [x] API documentation (OpenAPI specification)
- [x] AI development workflow documented (AGENTS.md)
- [x] Project structure documented

### Testing
- [x] Frontend tests: 7 component test files
- [x] Backend tests: 10+ test cases (unit + integration)
- [x] Integration tests with database
- [x] pytest configuration
- [x] GitHub Actions testing pipeline

## 🚀 Deployment Steps

### 1. Push to GitHub

```bash
# Stage all changes
git add .

# Commit with deployment message
git commit -m "feat: complete project implementation with CI/CD, tests, and database"

# Push to main branch
git push origin main
```

### 2. Deploy to Render.com

#### Method A: Automatic via render.yaml
1. Sign in to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will detect `render.yaml` automatically
5. Click "Create Web Service"

#### Method B: Manual Configuration
1. **Service Type**: Web Service
2. **Runtime**: Docker
3. **Branch**: main
4. **Docker Build Context**: `.`
5. **Dockerfile Path**: `./Dockerfile`
6. **Plan**: Free
7. **Health Check Path**: `/health`

### 3. Configure Environment Variables (Optional)

In Render dashboard, add:
- `DATABASE_URL`: If using external PostgreSQL
- `OPENAI_API_KEY`: If using OpenAI features
- `ENVIRONMENT`: `production`

### 4. Verify Deployment

After deployment completes (~5-10 minutes):

```bash
# Check health endpoint
curl https://your-app.onrender.com/health

# Expected response:
# {"status":"ok"}

# Test API endpoints
curl -X POST https://your-app.onrender.com/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"text":"This is a test sentence. We want to summarize it."}'
```

## 📊 Resource Usage (Render Free Tier)

### Limits
- **Instance Hours**: 750 hours/month (sufficient for 24/7)
- **RAM**: 512 MB (our app fits comfortably)
- **Image Size**: 10 GB max (ours is 1.67 GB ✅)
- **Bandwidth**: 100 GB/month outbound
- **Build Time**: ~10 minutes first deploy, ~5 minutes updates

### Optimizations Applied
- Multi-stage Docker build
- PyTorch CPU-only (saves 4.3 GB)
- Minimal NLTK data downloads
- Aggressive layer caching
- Build dependency cleanup

## 🔄 Continuous Deployment

### GitHub Actions CI/CD
The project includes automated testing and deployment:

**On every push/PR:**
1. Frontend tests run
2. Backend tests run
3. Integration tests run
4. Docker image builds

**On main branch push:**
5. Automatic deployment to Render (if configured)

### Configure Auto-Deployment
Add GitHub Secrets:
1. Go to GitHub repo → Settings → Secrets → Actions
2. Add secrets:
   - `RENDER_API_KEY`: Get from Render → Account Settings → API Keys
   - `RENDER_SERVICE_ID`: Get from Render service URL

## 🗄️ Database Configuration

### Development (Default)
- SQLite automatically created at `backend/studykit.db`
- No configuration needed

### Production (Recommended)
Add PostgreSQL database on Render:
1. Create new PostgreSQL database (free tier available)
2. Copy Internal Database URL
3. Set as `DATABASE_URL` environment variable
4. Migrations run automatically on deployment

## 📈 Monitoring & Logs

### View Logs
```bash
# Using Render dashboard
Render Dashboard → Your Service → Logs

# Using Render CLI (optional)
render logs <service-id>
```

### Health Checks
Render automatically monitors `/health` endpoint:
- **Healthy**: Returns 200 OK
- **Unhealthy**: Service auto-restarts

## 🐛 Troubleshooting

### Build Fails
```bash
# Check build logs in Render dashboard
# Common issues:
# 1. Missing dependencies → Check pyproject.toml/package.json
# 2. NLTK data download timeout → Increase build timeout
# 3. Memory limit → Check image size (should be 1.67GB)
```

### App Not Responding
```bash
# Check logs for errors
# Verify environment variables
# Ensure health check passes
curl https://your-app.onrender.com/health
```

### Slow Cold Starts
Free tier services sleep after 15 min inactivity:
- First request after sleep: ~30s startup
- Subsequent requests: Normal speed
- Upgrade to paid tier for always-on

## 🎯 Post-Deployment

### Verify All Features
- [ ] Grammar checker working
- [ ] Text summarization working
- [ ] Synonym lookup working
- [ ] Frontend loads correctly
- [ ] API endpoints responsive

### Share Your Deployment
- Get your Render URL: `https://<your-service>.onrender.com`
- Test all features end-to-end
- Share with users!

## 📝 Updating the Application

```bash
# Make changes locally
git add .
git commit -m "Update: description of changes"
git push origin main

# GitHub Actions will:
# 1. Run all tests
# 2. Build Docker image
# 3. Deploy to Render (if on main branch)
```

## 🎉 Success!

Your StudyKit application is now:
- ✅ Deployed to production
- ✅ Automatically tested via CI/CD
- ✅ Monitored for health
- ✅ Ready for users

**Live URL**: Check your Render dashboard for the production URL.
