#!/bin/bash

set -e

echo "🚀 Setting up Chat AI Service..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python 3.8+ is installed
echo "🐍 Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
if [[ -z "$python_version" ]]; then
    echo -e "${RED}❌ Python3 not found. Please install Python 3.8 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python $python_version found${NC}"

# Create virtual environment
echo "📦 Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
else
    echo -e "${YELLOW}⚠️  Virtual environment already exists${NC}"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data/vectors
mkdir -p data/cache
mkdir -p data/logs
mkdir -p tests

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env 2>/dev/null || echo "Please create .env file manually from the template"
fi

# Check database connection
echo "🛢  Checking database connection..."
python3 -c "
try:
    from app.config.database import db_manager
    import asyncio

    async def test():
        result = await db_manager.health_check()
        if result['database']['connected']:
            print('✅ Database connection successful')
        else:
            print('❌ Database connection failed')
            print('Please check your MySQL configuration in .env')
except Exception as e:
    print(f'❌ Database test failed: {e}')
    print('Please ensure MySQL is running and credentials are correct')
" || echo -e "${YELLOW}⚠️  Database connection test failed. Please check configuration.${NC}"

# Check Redis connection
echo "📦 Checking Redis connection..."
python3 -c "
try:
    from app.config.database import get_redis_client
    redis_client = get_redis_client()
    redis_client.ping()
    print('✅ Redis connection successful')
except Exception as e:
    print(f'❌ Redis connection failed: {e}')
    print('Please ensure Redis is running')
" || echo -e "${YELLOW}⚠️  Redis connection test failed. Please ensure Redis is running.${NC}"

# Test AI services
echo "🤖 Testing AI services..."
python3 -c "
try:
    from app.services.ai.llm_service import LLMService
    from app.config.settings import get_settings

    settings = get_settings()
    llm_service = LLMService()

    if settings.GOOGLE_API_KEY and settings.GOOGLE_API_KEY != 'your-google-api-key':
        print('✅ Google Gemini API key configured')
    else:
        print('⚠️  Google Gemini API key not configured')

    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != 'your-openai-api-key':
        print('✅ OpenAI API key configured')
    else:
        print('⚠️  OpenAI API key not configured')

except Exception as e:
    print(f'❌ AI services test failed: {e}')
" || echo -e "${YELLOW}⚠️  AI services test failed.${NC}"

# Create test script
echo "🧪 Creating test script..."
cat > scripts/test.sh << 'EOF'
#!/bin/bash
echo "🧪 Running tests..."
source venv/bin/activate
pytest tests/ -v
EOF
chmod +x scripts/test.sh

# Create start script
echo "🚀 Creating start script..."
cat > scripts/start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Chat AI Service..."

# Activate virtual environment
source venv/bin/activate

# Check services
echo "🔍 Checking dependencies..."

# Start MySQL if not running
if ! pgrep -x "mysqld" > /dev/null; then
    echo "🛢  Starting MySQL..."
    sudo systemctl start mysql || sudo service mysql start
fi

# Start Redis if not running
if ! pgrep -x "redis-server" > /dev/null; then
    echo "📦 Starting Redis..."
    sudo systemctl start redis || sudo service redis-server start
fi

# Start the application
echo "🎯 Starting FastAPI application..."
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
EOF
chmod +x scripts/start.sh

# Create development script
echo "🔧 Creating development script..."
cat > scripts/dev.sh << 'EOF'
#!/bin/bash
echo "🔧 Starting development mode..."
source venv/bin/activate
export DEBUG=true
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level debug
EOF
chmod +x scripts/dev.sh

echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Configure your .env file with proper database credentials and API keys"
echo "2. Run: ./scripts/start.sh to start the service"
echo "3. Visit: http://localhost:8000/docs for API documentation"
echo ""
echo "🔧 Development commands:"
echo "- Start development server: ./scripts/dev.sh"
echo "- Run tests: ./scripts/test.sh"
echo "- Check health: curl http://localhost:8000/health"
echo ""
echo -e "${GREEN}🎉 Happy coding!${NC}"
