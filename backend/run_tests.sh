#!/bin/bash
export PATH=$HOME/.local/bin:$PATH
cd /mnt/d/Zoomcamp/snake/snaky-arena/backend
uv run pytest -v
