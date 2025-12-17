# Snaky Arena

A multiplayer snake game with a reliable backend and a modern React frontend.

## 🚀 Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com/)

### Running with Docker (Recommended)

The easiest way to run the application is using Docker Compose. This starts the database and the application (Backend + Frontend) in a single container.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/HagerAhmed/snaky-arena.git
    cd snaky-arena
    ```

2.  **Start the application:**
    ```bash
    docker-compose up --build
    ```

3.  **Access the application:**
    - **Game UI:** http://localhost:8080
    - **API Documentation:** http://localhost:8080/docs

### Stopping the Application

To stop the containers:
```bash
docker-compose down
```

## 🛠️ Local Development

If you want to run the services individually for development:

### Backend

1.  Navigate to `backend/`.
2.  Install `uv`: `pip install uv`.
3.  Install dependencies: `uv sync`.
4.  Run the server: `uv run uvicorn app.main:app --reload`.

### Frontend

1.  Navigate to `frontend/`.
2.  Install dependencies: `npm install`.
3.  Start dev server: `npm run dev`.

## 🏗️ Architecture

- **Frontend**: React, Vite, Tailwind CSS.
- **Backend**: FastAPI, Python 3.12.
- **Database**: PostgreSQL (Production/Docker), SQLite (Local Dev default).
- **Deployment**: Docker (Single container serving both API and Static assets).

## ☁️ Deployment (Render)

This project includes a `render.yaml` Blueprint for easy deployment on [Render](https://render.com).

1.  **Push to GitHub**: Ensure your code is in a GitHub repository.
2.  **Render Dashboard**: Go to the [Render Dashboard](https://dashboard.render.com).
3.  **New Blueprint**: Click **New +** -> **Blueprint**.
4.  **Connect Repo**: Select your repository.
5.  **Apply**: Render will automatically detect `render.yaml` and prompt you to apply the changes.
6.  **Done**: It will create the **Web Service** and **Postgres Database** for you.

## 🔄 CI/CD Pipeline

Automated with GitHub Actions (`.github/workflows/ci-cd.yml`):
1.  **Tests**: Runs Backend Unit Tests, Backend Integration Tests (with Postgres), and Frontend Tests on every push.
2.  **Deploy**: Automatically triggers deployment to Render only if all tests pass on the `main` branch.

**Setup**:
-   Add `RENDER_DEPLOY_HOOK_URL` to your GitHub Repository Secrets (Settings -> Secrets -> Actions).
