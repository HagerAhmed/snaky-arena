FROM python:3.12-slim

# Install uv (The Python Package Manager)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Set working directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
# --frozen ensures we stick to the lockfile
# --no-dev excludes development dependencies
RUN uv sync --frozen --no-dev

# Copy the rest of the application code
COPY . .

# Run the application
# We use `uv run` to ensure we use the virtual environment created by uv
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
