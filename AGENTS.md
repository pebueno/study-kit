# AGENTS.md - AI Assistant Development Guide

This file guides AI assistants (like Claude, ChatGPT, or other AI coding tools) through the development process of StudyKit. It documents AI-assisted workflows, MCP usage, and ensures all project requirements are met.

---

## 🎯 Project Overview

**Project Name**: StudyKit - Grammar & Writing Tools  
**Type**: Full-stack educational web application  
**Goal**: Create a grammar checker with future expansion to complete study toolkit  
**Timeline**: Rapid development (3-hour initial frontend build, expanding to full stack)

---

## 📋 Development Checklist (Approval Criteria)

Track progress for each requirement:

- [x] 1. Problem description in README ✅
- [ ] 2. AI-assisted development + MCP documentation
- [ ] 3. Technology stack & architecture documentation
- [ ] 4. Frontend implementation + tests
- [ ] 5. OpenAPI specification
- [ ] 6. Backend implementation + tests
- [ ] 7. Database integration (SQLite + PostgreSQL)
- [ ] 8. Docker/docker-compose setup
- [ ] 9. Integration tests
- [ ] 10. Cloud deployment (with URL)
- [ ] 11. CI/CD pipeline
- [ ] 12. Complete setup/run/test/deploy instructions

---

## 🤖 AI-Assisted Development Workflow

### Phase 1: Frontend Development (CURRENT)

G**MCP Usage**: File system access, git operations

#### Steps:
1. **Generate React Frontend**
```bash
   # AI generates initial React + TypeScript + Tailwind project
   # Components: Header, TextEditor, ResultsPanel, ErrorCard, Statistics
```

2. **Implement Core Features**
   - Text input with character/word counting
   - Three tabs: Grammar Checker, Summarize, Synonyms
   - Mock error detection (frontend only initially)
   - Copy/download functionality

3. **Add Tests**
```bash
   # Create test files for each component
   # Test user interactions, text processing, statistics
   npm test
```

4. **Git Commits**
```bash
   git add .
   git commit -m "feat: implement grammar checker UI with 3 tools (grammar, summarize, synonyms)"
   git commit -m "test: add unit tests for TextEditor component"
   git commit -m "style: improve responsive design for mobile devices"
```

**MCP Tools Used**:
- `read_file`: Review existing code
- `write_file`: Create/update components
- `list_directory`: Check project structure
- `search_files`: Find patterns in codebase

---

### Phase 2: API Contract (OpenAPI Specification)

**AI Tool**: Claude with OpenAPI knowledge  
**MCP Usage**: File operations

#### Steps:
1. **Create OpenAPI spec** (`openapi.yaml`):
```yaml
   openapi: 3.0.0
   info:
     title: StudyKit API
     version: 1.0.0
   paths:
     /api/grammar-check:
       post:
         summary: Check text for grammar and spelling errors
         requestBody:
           required: true
           content:
             application/json:
               schema:
                 type: object
                 properties:
                   text:
                     type: string
                     example: "Their are many mistake in this sentense."
         responses:
           200:
             description: Grammar check results
             content:
               application/json:
                 schema:
                   type: object
                   properties:
                     correctedText:
                       type: string
                     errors:
                       type: array
                       items:
                         type: object
```

2. **Document all endpoints**:
   - `POST /api/grammar-check`
   - `POST /api/summarize`
   - `POST /api/synonyms`

3. **Git Commit**:
```bash
   git commit -m "docs: add OpenAPI specification for all API endpoints"
```

---

### Phase 3: Backend Development (Python + FastAPI)

**AI Tool**: Claude / Gemini  
**MCP Usage**: Python environment, file operations, terminal commands  
**Dependency Manager**: `uv` (ultra-fast Python package installer)

#### Setup Backend:
```bash
# Initialize Python project with uv
cd backend
uv init
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Add dependencies
uv add fastapi
uv add uvicorn[standard]
uv add language-tool-python
uv add sqlalchemy
uv add alembic
uv add psycopg2-binary
uv add python-dotenv
uv add pytest
uv add httpx  # for testing

# Sync dependencies
uv sync
```

#### Create Backend Structure:
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI app
│   ├── api/
│   │   ├── __init__.py
│   │   ├── grammar.py   # Grammar check endpoint
│   │   ├── summarize.py # Summarization endpoint
│   │   └── synonyms.py  # Synonyms endpoint
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py   # Pydantic models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── grammar_service.py
│   │   └── nlp_service.py
│   └── db/
│       ├── __init__.py
│       ├── database.py
│       └── models.py
├── tests/
│   ├── __init__.py
│   ├── test_grammar.py
│   └── test_api.py
├── alembic/
├── pyproject.toml
├── .env
└── README.md
```

#### Implement Backend:
```bash
# Run backend
uv run uvicorn app.main:app --reload

# Run tests
uv run pytest

# Run with specific Python file
uv run python app/main.py
```

#### Git Commits:
```bash
git commit -m "chore: setup backend with uv and FastAPI"
git commit -m "feat: implement grammar check endpoint with LanguageTool integration"
git commit -m "feat: add summarization endpoint using transformers"
git commit -m "feat: implement synonym replacement endpoint"
git commit -m "test: add unit tests for grammar service"
git commit -m "test: add API endpoint integration tests"
```

**MCP Tools Used**:
- `execute_command`: Run uv commands
- `read_file`: Review Python code
- `write_file`: Create Python modules
- `search_files`: Find imports and dependencies

---

### Phase 4: Database Integration

**Databases**: SQLite (dev) + PostgreSQL (prod)  
**ORM**: SQLAlchemy

#### Setup:
```bash
# Add database dependencies
uv add sqlalchemy alembic psycopg2-binary

# Initialize Alembic
uv run alembic init alembic

# Create migration
uv run alembic revision --autogenerate -m "create initial tables"

# Run migration
uv run alembic upgrade head
```

#### Environment Variables:
```bash
# .env.development
DATABASE_URL=sqlite:///./studykit_dev.db

# .env.production
DATABASE_URL=postgresql://user:pass@host:5432/studykit
```

#### Git Commits:
```bash
git commit -m "feat: setup SQLAlchemy ORM with SQLite and PostgreSQL support"
git commit -m "feat: create database models for user history and corrections"
git commit -m "chore: add Alembic migrations for database schema"
```

---

### Phase 5: Containerization (Docker)

**Goal**: Entire system runs via `docker-compose`

#### Create Dockerfiles:

**Frontend Dockerfile**:
```dockerfile
# frontend/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

**Backend Dockerfile**:
```dockerfile
# backend/Dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install uv
RUN uv sync
COPY . .
EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://studykit:password@db:5432/studykit
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=studykit
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=studykit
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

#### Run:
```bash
# Build and start all services
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
```

#### Git Commit:
```bash
git commit -m "chore: add Docker and docker-compose configuration for full stack"
```

---

### Phase 6: Testing

#### Frontend Tests:
```bash
cd frontend
npm test                    # Run unit tests
npm run test:e2e           # Run E2E tests with Playwright
npm run test:coverage      # Check code coverage
```

#### Backend Tests:
```bash
cd backend
uv run pytest                              # All tests
uv run pytest tests/test_grammar.py        # Specific test
uv run pytest --cov=app                    # With coverage
uv run pytest -v                           # Verbose output
```

#### Integration Tests:
```bash
# Create tests/integration/ directory
cd backend
uv run pytest tests/integration/test_full_workflow.py
```

#### Git Commits:
```bash
git commit -m "test: add frontend unit tests with 80% coverage"
git commit -m "test: add backend API tests with pytest"
git commit -m "test: add integration tests for complete user workflows"
```

---

### Phase 7: CI/CD Pipeline

**Platform**: GitHub Actions

#### Create `.github/workflows/ci-cd.yml`:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install frontend dependencies
        run: cd frontend && npm install
      
      - name: Run frontend tests
        run: cd frontend && npm test
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      
      - name: Install uv
        run: pip install uv
      
      - name: Install backend dependencies
        run: cd backend && uv sync
      
      - name: Run backend tests
        run: cd backend && uv run pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy Frontend to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
      
      - name: Deploy Backend to Railway
        run: |
          # Railway deployment commands
```

#### Git Commit:
```bash
git commit -m "ci: add GitHub Actions workflow for testing and deployment"
```

---

### Phase 8: Deployment

#### Frontend Deployment (Vercel):
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

#### Backend Deployment (Railway):
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Verify Deployment:
- Frontend URL: `https://studykit.vercel.app`
- Backend URL: `https://studykit-api.railway.app`
- API Health: `https://studykit-api.railway.app/health`

#### Git Commit:
```bash
git commit -m "deploy: configure production deployment to Vercel and Railway"
```

---

## 🔧 MCP (Model Context Protocol) Usage

### MCP Servers Used:

1. **Filesystem MCP**
   - Read/write project files
   - Create directory structures
   - Search codebase

2. **Git MCP**
   - Commit changes with descriptive messages
   - Create branches
   - View commit history

3. **Shell MCP**
   - Run `uv` commands
   - Execute tests
   - Build Docker containers

### Example MCP Workflow:
```json
{
  "mcp_action": "write_file",
  "path": "backend/app/api/grammar.py",
  "content": "# Grammar checking endpoint implementation"
}

{
  "mcp_action": "execute_command",
  "command": "uv run pytest tests/test_grammar.py"
}

{
  "mcp_action": "git_commit",
  "message": "feat: implement grammar checking with LanguageTool API"
}
```

---

## 📝 Git Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):
```bash
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code restructuring
test: adding tests
chore: maintenance tasks
ci: CI/CD changes
perf: performance improvements
```

**Examples**:
```bash
git commit -m "feat(frontend): add grammar checker UI with three tabs"
git commit -m "fix(backend): resolve LanguageTool API timeout issue"
git commit -m "test(integration): add end-to-end workflow tests"
git commit -m "docs: update README with deployment instructions"
git commit -m "chore: configure Docker for development environment"
```

---

## 🎓 AI Development Best Practices

1. **Always read existing files** before modifying
2. **Run tests** after each significant change
3. **Commit frequently** with clear messages
4. **Document as you build** (inline comments + README updates)
5. **Use MCP tools** for file operations and command execution
6. **Follow the OpenAPI spec** exactly when building backend
7. **Test locally with Docker** before deploying
8. **Check CI/CD status** after every push

---

## 🚀 Quick Commands Reference

### Frontend:
```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm test             # Run tests
npm run build        # Production build
npm run preview      # Preview production build
```

### Backend:
```bash
uv sync              # Install dependencies
uv add <package>     # Add new package
uv run uvicorn app.main:app --reload  # Start server
uv run pytest        # Run tests
uv run python <file> # Run Python file
```

### Docker:
```bash
docker-compose up --build    # Build and start
docker-compose down          # Stop services
docker-compose logs -f       # View logs
docker-compose exec backend bash  # Enter container
```

### Deployment:
```bash
vercel --prod                # Deploy frontend
railway up                   # Deploy backend
```

---

## ✅ Final Checklist Before Submission

- [ ] All 12 approval criteria completed
- [ ] README.md fully documents the project
- [ ] OpenAPI spec matches backend implementation
- [ ] All tests passing (frontend + backend + integration)
- [ ] Docker setup works end-to-end
- [ ] CI/CD pipeline runs successfully
- [ ] Application deployed with working URLs
- [ ] Git history shows clear, conventional commits
- [ ] MCP usage documented in this file

---

**Last Updated**: 2026-01-12  
**AI Assistants**: Claude (Anthropic), Gemini, Lovable.dev  
**MCP Version**: 1.0