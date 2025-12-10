# Snaky Arena Backend

FastAPI backend for Snaky Arena.

## Setup

1. Install `uv`:
   ```bash
   pip install uv
   ```

2. Install dependencies:
   ```bash
   uv sync
   ```

## Running

Start the development server:
```bash
uv run uvicorn app.main:app --reload
```

## Testing

Run tests:
```bash
uv run pytest
```
