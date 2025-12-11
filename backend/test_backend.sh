#!/bin/bash
export PATH=$HOME/.local/bin:$PATH
cd /mnt/d/Zoomcamp/snake/snaky-arena/backend
uv run uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload
