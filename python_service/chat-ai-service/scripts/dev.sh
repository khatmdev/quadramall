#!/bin/bash
echo "🔧 Starting development mode..."
source venv/bin/activate
export DEBUG=true
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level debug
