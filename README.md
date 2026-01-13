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
  - PyTorch 2.9+ (CPU-only) with Transformers for neural grammar correction
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

## 🚀 Quick Start

### Option 1: Docker (Production - Recommended)
This runs both backend and frontend in a single optimized container:

```bash
# Build the image
docker build -t studykit .

# Run the container
docker run -p 8000:8000 studykit

# Access the app
open http://localhost:8000
```

### Option 2: Docker Compose (Development)
For local development with PostgreSQL database:

```bash
# Start all services (backend + database + frontend)
docker-compose up

# Access the app
# Backend API: http://localhost:8000
# Frontend Dev Server: http://localhost:8080
# PostgreSQL: localhost:5432
```

### Option 3: Manual Setup

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

## 🔧 Development Commands

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm test             # Run tests
npm run preview      # Preview production build
```

### Backend
```bash
uvicorn app.main:app --reload  # Start dev server
pytest tests/ -v               # Run all tests
pytest --cov=app              # Run with coverage
alembic upgrade head          # Apply migrations
```

### Docker
```bash
docker build -t studykit .                    # Build production image
docker-compose up                              # Start development environment
docker-compose down                            # Stop services
docker-compose logs -f backend                # View backend logs
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