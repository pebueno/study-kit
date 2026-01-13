# StudyKit - Grammar & Writing Tools

![StudyKit Banner](https://via.placeholder.com/1200x300/6366f1/ffffff?text=StudyKit+-+Your+Complete+Study+Toolkit)

## 🎯 Problem Description

Students and writers frequently struggle with grammar, spelling, and writing quality issues that can negatively impact their academic performance and professional communication.

**StudyKit** addresses these challenges by providing a free, student-focused writing assistant that combines grammar checking, text summarization, and synonym suggestions in one unified platform.

---

## 🏗️ Technologies & Architecture

### Frontend Stack
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack React Query
- **Routing**: React Router DOM
- **Testing**: Vitest + React Testing Library

### Backend Stack
- **Framework**: FastAPI 0.128 (Python 3.10+)
- **Server**: Uvicorn (ASGI)
- **NLP Libraries**:
  - **Google Gemini API** (Cloud) for lightweight, high-accuracy correction
  - PyTorch 2.9+ (CPU-only) with Transformers for local neural grammar correction
  - LanguageTool for spelling/grammar checks
  - NLTK, TextBlob for synonym suggestions
  - Sumy for text summarization
- **Database**: SQLAlchemy 2.0 with Alembic migrations
  - Development: SQLite
  - Production: PostgreSQL support
- **Testing**: pytest with integration tests

### Infrastructure
- **Containerization**: Docker with optimized multi-stage build (1.67GB image)
- **Development**: docker-compose with PostgreSQL
- **CI/CD**: GitHub Actions (automated testing + deployment)
- **Deployment**: Render.com (free tier compatible)
- **API Documentation**: OpenAPI 3.0 specification

---

## ⚡ Prerequisites

Before starting, ensure you have:
- ✅ **Docker** (v20+) - [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
- ✅ **Docker Compose** (included with Docker Desktop)
- ✅ **Git** (v2.x+) - [Download Git](https://git-scm.com/downloads)

**Quick verification:**
```bash
docker --version       # Should show version 20+
docker compose version # Should show version 2.x
git --version          # Should show version 2.x
```

**Installation help:**
- **Windows/Mac**: Docker Compose is included with Docker Desktop
- **Linux**: `sudo apt-get install docker.io docker-compose-plugin`
- **Note**: Use `docker compose` (with space) instead of `docker-compose` (with dash) on newer versions

## 🤖 AI Configuration (New!)

StudyKit now supports two powerful AI modes for grammar correction:

### 1. Cloud AI (Lightweight & Fast) - Recommended
Uses Google's Gemini API. Extremely fast, smart, and uses **zero memory** on your machine.
-   **Setup**:
    1.  Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    2.  Add it to your `.env` file: `GEMINI_API_KEY=your_key_here`.
    3.  Restart the backend.

### 2. Local AI (Privacy Focused)
Uses a local T5 Transformer model. Runs entirely offline but requires ~1GB download and more RAM.
-   **Setup**:
    1.  Ensure `GEMINI_API_KEY` is empty or not set.
    2.  Set `USE_T5_MODEL=true` in your `.env`.
    3.  Restart the backend. The first request will download the model.

### 3. Basic Mode (Default)
If neither of the above is configured, StudyKit uses standard libraries (LanguageTool & TextBlob) for basic grammar checking.

---

## 🚀 Quick Start (3 Steps!)


### Option 1: Docker - Production Mode (Simplest ⭐)
Runs both backend and frontend in a single optimized container.

```bash
# Step 1: Clone repository
git clone <your-repo-url>
cd study-kit

# Step 2: Build the image (takes 5-8 minutes first time)
docker build -t studykit .

# Step 3: Run the container
docker run -p 8000:8000 studykit

# ✅ Done! Open http://localhost:8000 in your browser
```

**Troubleshooting:**
- If build fails: Make sure Docker Desktop is running
- If port 8000 is busy: Use `docker run -p 8001:8000 studykit`
- If "permission denied": Run Docker Desktop as administrator

---

### Option 2: Docker Compose - Development Mode (Best for Development)
Runs backend, frontend, and PostgreSQL database with hot-reload.

```bash
# Step 1: Clone repository (if not done)
git clone <your-repo-url>
cd study-kit

# Step 2: Start all services
docker compose up

# ✅ Done! Services will start:
# - Backend API: http://localhost:8000/docs
# - Frontend: http://localhost:8080
# - Database: PostgreSQL on port 5432
```

**Stop services:**
```bash
# Press Ctrl+C, then:
docker compose down
```

**View logs:**
```bash
docker compose logs -f backend  # Backend logs
docker compose logs -f postgres # Database logs
```

**Troubleshooting:**
- **"docker-compose: command not found"**: Try `docker compose` (with space) instead
- **Port already in use**: Change ports in `docker-compose.yml`
- **Services won't start**: Run `docker compose down` then `docker compose up --build`

---

### Option 3: Manual Setup (Advanced Users Only)

For developers who want to run services individually.

**Prerequisites:**
- Node.js 20+ (frontend)
- Python 3.10+ (backend)
- PostgreSQL (optional, for database features)

#### Backend Setup
```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
pip install uv
uv pip install --system -r <(uv export --no-hashes --format requirements-txt)

# 3. Download NLP data
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet'); nltk.download('punkt_tab')"
python -m textblob.download_corpora

# 4. (Optional) Set environment variables
export USE_T5_MODEL=true  # Enable neural grammar (uses 400MB+ RAM)
export DATABASE_URL=sqlite:///./studykit.db

# 5. Run database migrations (optional)
alembic upgrade head

# 6. Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# ✅ Backend running at http://localhost:8000
```

#### Frontend Setup (separate terminal)
```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# ✅ Frontend running at http://localhost:8080
```

#### Verify Everything Works
```bash
# Test backend health
curl http://localhost:8000/health
# Expected: {"status":"ok"}

# Test API endpoint
curl -X POST http://localhost:8000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"text":"This is a test. We want to summarize it."}'
```

---

## 🧪 Testing

### Run All Tests
```bash
# Backend tests (unit + integration)
cd backend
pytest tests/ -v

# Frontend tests
cd frontend
npm test
```

### CI/CD Pipeline
GitHub Actions automatically runs all tests on every push/PR. See `.github/workflows/ci-cd.yml`.

---

## 🗄️ Database

### Current Setup
- **Development**: SQLite (auto-created)
- **Production**: SQLite in container (optional PostgreSQL)
- **Status**: Implemented but optional

### Database Features
- ✅ Models defined (User, TextHistory)
- ✅ Migrations ready (Alembic)
- ✅ Multi-environment support (SQLite/PostgreSQL)
- ⚠️ Currently optional (app works without database)

### Enable Database (Future Enhancement)
The database layer exists for evaluation criteria and future features like:
- User session tracking
- Recent corrections history
- Usage analytics
- Personalized suggestions

To enable, uncomment database code in API endpoints and set `DATABASE_URL`.

---

## 🎯 Project Goals

1. **Solve a real problem**: Help students improve writing quality.
2. **Provide free access**: Accessible tools for everyone.
3. **Support learning**: Clear explanations for mistakes.
4. **Scale for the future**: Foundation for a complete study toolkit.

---

## 🤖 AI-Assisted Development

This project was developed with AI assistance using Claude Code and Model Context Protocol (MCP).

### AI Development Workflow
The development process leveraged MCP tools for:
- File system operations (`read_file`, `write_file`, `list_directory`)
- Code generation and refactoring
- Test creation and validation
- Docker optimization and configuration
- CI/CD pipeline setup

See `AGENTS.md` for detailed documentation of the AI-assisted development workflow, including:
- 8 development phases from frontend to deployment
- MCP tool usage patterns
- Integration strategies
- Testing approaches

---

## 📁 Project Structure

```
study-kit/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   └── __tests__/    # Component tests
│   │   ├── pages/            # Page components
│   │   └── lib/              # Utilities
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── db/               # Database configuration
│   │   ├── models/           # SQLAlchemy models
│   │   └── utils/            # NLP utilities
│   ├── tests/                # Backend tests
│   │   └── integration/      # Integration tests
│   ├── alembic/              # Database migrations
│   ├── pyproject.toml
│   └── pytest.ini
├── .github/
│   └── workflows/
│       └── ci-cd.yml         # GitHub Actions pipeline
├── Dockerfile                # Production build (optimized)
├── docker-compose.yml        # Development environment
├── render.yaml               # Render.com deployment config
├── openapi.yaml              # API specification
└── README.md
```

---

## 📊 API Documentation

Full API documentation is available via OpenAPI specification:
- **Specification File**: `openapi.yaml`
- **Interactive Docs**: `http://localhost:8000/docs` (when running)

### Available Endpoints
- `POST /api/check-grammar` - Grammar and spelling check
- `POST /api/summarize` - Text summarization
- `POST /api/synonyms` - Synonym suggestions
- `GET /health` - Health check endpoint

---

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm test             # Run tests
```

### Backend
```bash
# Install/Sync dependencies
uv sync

# Start dev server
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
uv run pytest tests/ -v
```

### Docker (Production)
```bash
# Build image
docker build -t studykit .

# Run container
docker run -p 8000:8000 studykit
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

All PRs must pass CI/CD checks (tests + linting).

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- Built with AI assistance using Claude Code and MCP
- UI components from shadcn/ui
- NLP powered by Transformers, NLTK, and TextBlob
- Icons by Lucide React