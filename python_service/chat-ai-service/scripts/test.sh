#!/bin/bash
echo "🧪 Running tests..."
source venv/bin/activate
pytest tests/ -v
