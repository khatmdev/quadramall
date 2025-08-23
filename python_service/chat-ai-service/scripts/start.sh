#!/bin/bash

# Chat AI Service Complete Start Script with Vector Index
# Version: 2.1.0
# Enhanced with automatic vector index building

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1"
}

# Print header
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                🚀 Chat AI Service v2.1.0                    ║"
echo "║     Intelligent Chat with Vector Search & Memory            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

log "🚀 Starting Chat AI Service with Vector Search..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check service status
check_service_status() {
    local service=$1
    if systemctl is-active --quiet $service 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Check if we're in the right directory
if [ ! -f "app/main.py" ]; then
    log_error "❌ app/main.py not found. Please run this script from the project root directory."
    exit 1
fi

log_info "📁 Working directory: $(pwd)"

# Step 1: Check Python environment
log "🐍 Checking Python environment..."

if [ ! -d "venv" ]; then
    log_warning "Virtual environment not found. Creating one..."
    python3 -m venv venv
    log_success "✅ Virtual environment created"
fi

# Activate virtual environment
log "🔧 Activating virtual environment..."
source venv/bin/activate

if [ "$VIRTUAL_ENV" != "" ]; then
    log_success "✅ Virtual environment activated: $VIRTUAL_ENV"
else
    log_error "❌ Failed to activate virtual environment"
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python --version 2>&1)
log_info "🐍 Python version: $PYTHON_VERSION"

# Step 2: Install/Update dependencies
log "📦 Checking dependencies..."

if [ -f "requirements.txt" ]; then
    log "📥 Installing/updating Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    log_success "✅ Dependencies installed"
else
    log_warning "⚠️ requirements.txt not found"
fi

# Step 3: Check and start MySQL
log "🛢 Checking MySQL service..."

if command_exists mysql; then
    MYSQL_VERSION=$(mysql --version)
    log_info "🛢 MySQL found: $MYSQL_VERSION"

    if check_service_status mysql; then
        log_success "✅ MySQL is already running"
    else
        log "🛢 Starting MySQL service..."
        if sudo systemctl start mysql 2>/dev/null; then
            log_success "✅ MySQL started successfully"
        else
            log_warning "⚠️ Could not start MySQL with systemctl, trying alternative..."
            if sudo service mysql start 2>/dev/null; then
                log_success "✅ MySQL started with service command"
            else
                log_error "❌ Failed to start MySQL. Please start it manually."
            fi
        fi
    fi
else
    log_warning "⚠️ MySQL not found. Please install MySQL or ensure database is accessible."
fi

# Step 4: Check and start Redis
log "📦 Checking Redis service..."

if command_exists redis-server; then
    REDIS_VERSION=$(redis-server --version | head -n1)
    log_info "📦 Redis found: $REDIS_VERSION"

    if check_service_status redis; then
        log_success "✅ Redis is already running"
    elif check_service_status redis-server; then
        log_success "✅ Redis server is already running"
    else
        log "📦 Starting Redis service..."
        if sudo systemctl start redis 2>/dev/null; then
            log_success "✅ Redis started with systemctl"
        elif sudo systemctl start redis-server 2>/dev/null; then
            log_success "✅ Redis server started with systemctl"
        elif sudo service redis-server start 2>/dev/null; then
            log_success "✅ Redis started with service command"
        else
            log_warning "⚠️ Could not start Redis with system commands, trying direct start..."
            redis-server --daemonize yes 2>/dev/null && log_success "✅ Redis started directly" || log_error "❌ Failed to start Redis"
        fi
    fi

    # Test Redis connection
    log "🔗 Testing Redis connection..."
    if redis-cli ping >/dev/null 2>&1; then
        log_success "✅ Redis connection: PONG"
    else
        log_error "❌ Redis connection failed"
        log_warning "⚠️ Conversation memory requires Redis. Please ensure Redis is running."
    fi
else
    log_error "❌ Redis not found. Installing Redis..."
    if command_exists apt-get; then
        sudo apt-get update && sudo apt-get install -y redis-server
        sudo systemctl start redis-server
        log_success "✅ Redis installed and started"
    elif command_exists yum; then
        sudo yum install -y redis
        sudo systemctl start redis
        log_success "✅ Redis installed and started"
    else
        log_error "❌ Please install Redis manually for conversation memory"
    fi
fi

# Step 5: Check environment configuration
log "⚙️ Checking environment configuration..."

if [ ! -f ".env" ]; then
    log_warning "⚠️ .env file not found"
    if [ -f ".env.example" ]; then
        log "📝 Creating .env from .env.example..."
        cp .env.example .env
        log_success "✅ .env file created from template"
        log_warning "⚠️ Please update .env file with your API keys!"
    else
        log_error "❌ No .env.example found. Please create .env file manually."
    fi
else
    log_success "✅ .env file found"
fi

# Create necessary directories
log "📁 Creating necessary directories..."
mkdir -p data/vectors data/cache data/logs
log_success "✅ Directories created: data/vectors, data/cache, data/logs"

# Step 6: Test configuration and connections
log "🔍 Testing system configuration..."

log "🧪 Testing Python configuration..."
python -c "
import sys
print(f'✅ Python executable: {sys.executable}')
print(f'✅ Python version: {sys.version}')

try:
    from app.config.settings import get_settings
    settings = get_settings()
    print(f'✅ Configuration loaded successfully')
    print(f'   - App: {settings.APP_NAME} v{settings.APP_VERSION}')
    print(f'   - Database: {settings.MYSQL_HOST}:{settings.MYSQL_PORT}/{settings.MYSQL_DATABASE}')
    print(f'   - Redis: {settings.REDIS_HOST}:{settings.REDIS_PORT}')
    print(f'   - Debug Mode: {settings.DEBUG}')

    # Check API keys
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != 'your-openai-api-key':
        print('✅ OpenAI API key configured')
    else:
        print('⚠️ OpenAI API key not configured')

    if settings.GOOGLE_API_KEY and settings.GOOGLE_API_KEY != 'your-google-api-key':
        print('✅ Google API key configured')
    else:
        print('⚠️ Google API key not configured')

except Exception as e:
    print(f'❌ Configuration error: {e}')
    sys.exit(1)
"

if [ $? -eq 0 ]; then
    log_success "✅ Python configuration test passed"
else
    log_error "❌ Python configuration test failed"
    exit 1
fi

log "🔗 Testing database connections..."
python -c "
try:
    from app.config.database import db_manager

    # Test MySQL connection
    import asyncio
    async def test_connections():
        result = await db_manager.health_check()

        if result['database']['connected']:
            print('✅ MySQL connection: SUCCESS')
        else:
            print('❌ MySQL connection: FAILED')
            print('   Please check database configuration in .env file')

        if result['redis']['connected']:
            print('✅ Redis connection: SUCCESS')
            print('   - Conversation Memory: READY')
        else:
            print('❌ Redis connection: FAILED')
            print('   - Conversation Memory: NOT AVAILABLE')

        return result['database']['connected']

    db_ok = asyncio.run(test_connections())

    if not db_ok:
        print('❌ Database connection failed')
        import sys
        sys.exit(1)

except Exception as e:
    print(f'❌ Connection test error: {e}')
    import sys
    sys.exit(1)
"

if [ $? -eq 0 ]; then
    log_success "✅ Database connection tests completed"
else
    log_error "❌ Database connection tests failed"
    exit 1
fi

# Step 7: Test imports and services
log "🧪 Testing service imports..."
python -c "
try:
    # Test core imports
    from app.main import app
    print('✅ FastAPI app import: SUCCESS')

    from app.services.chat.conversation import ConversationService
    print('✅ Conversation Service import: SUCCESS')

    from app.services.search.hybrid_search import HybridSearchService
    print('✅ Hybrid Search Service import: SUCCESS')

    from app.api.v1.chat import router as chat_router
    print('✅ Chat API router import: SUCCESS')

    from app.models.schemas import ChatRequest, ChatResponse
    print('✅ Chat schemas import: SUCCESS')

    print('🎉 All critical imports successful!')

except ImportError as e:
    print(f'❌ Import error: {e}')
    import sys
    sys.exit(1)
except Exception as e:
    print(f'❌ Service test error: {e}')
    import sys
    sys.exit(1)
"

if [ $? -eq 0 ]; then
    log_success "✅ Service import tests passed"
else
    log_error "❌ Service import tests failed"
    exit 1
fi

# Step 8: Check and build vector index
log "🔍 Checking vector search index..."

# Check if index files exist
INDEX_FILE="data/vectors/faiss_index.bin"
METADATA_FILE="data/vectors/metadata.json"

if [ -f "$INDEX_FILE" ] && [ -f "$METADATA_FILE" ]; then
    log_success "✅ Vector index files found"

    # Check index validity
    python -c "
try:
    from app.services.ai.vector_search import VectorSearchService
    import asyncio

    async def check_index():
        service = VectorSearchService()
        stats = await service.get_stats()
        vector_count = stats.get('total_vectors', 0)

        if vector_count > 0:
            print(f'✅ Vector index loaded: {vector_count} products')
            return True
        else:
            print('⚠️ Vector index is empty')
            return False

    index_ok = asyncio.run(check_index())
    if not index_ok:
        import sys
        sys.exit(1)

except Exception as e:
    print(f'⚠️ Vector index check failed: {e}')
    import sys
    sys.exit(1)
"

    if [ $? -eq 0 ]; then
        log_success "✅ Vector index is ready"
    else
        log_warning "⚠️ Vector index needs rebuilding"
        REBUILD_INDEX=true
    fi
else
    log_warning "⚠️ Vector index not found"
    REBUILD_INDEX=true
fi

# Build or rebuild index if needed
if [ "$REBUILD_INDEX" = true ]; then
    log "🔨 Building vector search index..."
    log_info "This may take a few minutes depending on database size..."

    python -c "
import asyncio
import logging
import sys

# Setup logging for build process
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

async def build_index():
    try:
        from app.services.ai.vector_search import VectorSearchService

        print('🚀 Initializing VectorSearchService...')
        service = VectorSearchService()

        print('📊 Building index from database...')
        success = await service.build_index(force_rebuild=True)

        if success:
            stats = await service.get_stats()
            vector_count = stats.get('total_vectors', 0)
            print(f'✅ Index built successfully: {vector_count} products')

            # Test search
            print('🧪 Testing search functionality...')
            results = await service.search('điện thoại', top_k=3)
            print(f'✅ Search test: found {len(results)} results')

            return True
        else:
            print('❌ Failed to build index')
            return False

    except Exception as e:
        print(f'❌ Build error: {e}')
        import traceback
        traceback.print_exc()
        return False

success = asyncio.run(build_index())
sys.exit(0 if success else 1)
"

    if [ $? -eq 0 ]; then
        log_success "✅ Vector index built successfully"
    else
        log_error "❌ Failed to build vector index"
        log_warning "⚠️ Vector search will not be available"
        log_info "You can build the index later using: python build_index.py"
    fi
fi

# Step 9: Show startup information
log "📋 System Information Summary:"
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                        System Status                        ║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║${NC} Service Version: Chat AI Service v2.1.0                   ${CYAN}║${NC}"
echo -e "${CYAN}║${NC} Features: Conversation Memory + Vector Search + AI        ${CYAN}║${NC}"
echo -e "${CYAN}║${NC} Python Environment: $(python --version | cut -d' ' -f2) (Virtual Env)         ${CYAN}║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║${NC} 🗄️  MySQL: $(systemctl is-active mysql 2>/dev/null || echo "Unknown")                                   ${CYAN}║${NC}"
echo -e "${CYAN}║${NC} 📦 Redis: $(systemctl is-active redis 2>/dev/null || systemctl is-active redis-server 2>/dev/null || echo "Unknown")                                    ${CYAN}║${NC}"
echo -e "${CYAN}║${NC} 🧠 Conversation Memory: Ready                             ${CYAN}║${NC}"
echo -e "${CYAN}║${NC} 🔍 Vector Search: $([ -f "$INDEX_FILE" ] && echo "Ready" || echo "Not Available")                               ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"

# Step 10: Start the FastAPI service
log "🎯 Starting Chat AI Service..."
log_info "🌐 Service will be available at:"
log_info "   • Main API: http://localhost:8000"
log_info "   • API Documentation: http://localhost:8000/docs"
log_info "   • ReDoc Documentation: http://localhost:8000/redoc"
log_info "   • Health Check: http://localhost:8000/health"

echo ""
log_info "🎮 API Endpoints Ready:"
log_info "   • POST /api/v1/chat/ask - Chat with Memory"
log_info "   • POST /api/v1/chat/ask/stream - Streaming Chat"
log_info "   • GET /api/v1/chat/history/{user_id} - Chat History"
log_info "   • POST /api/v1/search/products - Product Search"
log_info "   • GET /api/v1/admin/system-stats - System Stats"

echo ""
log_info "🧪 Test Commands:"
log_info "   • curl http://localhost:8000/health"
log_info "   • curl -X POST http://localhost:8000/api/v1/chat/ask -H 'Content-Type: application/json' -d '{\"message\":\"Tìm iPhone\",\"user_id\":\"test\"}'"

echo ""
log "🚀 Launching Chat AI Service..."
echo -e "${GREEN}Press Ctrl+C to stop the service${NC}"
echo -e "${YELLOW}────────────────────────────────────────────────────────────────${NC}"

# Check if port 8000 is already in use
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    log_warning "⚠️ Port 8000 is already in use. Attempting to kill existing process..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start the service with enhanced logging
export PYTHONPATH=$(pwd):$PYTHONPATH

# Determine the appropriate uvicorn command
if command_exists uvicorn; then
    UVICORN_CMD="uvicorn"
else
    UVICORN_CMD="python -m uvicorn"
fi

# Start with full logging
log_success "🎉 Starting FastAPI server..."
$UVICORN_CMD app.main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --reload \
    --reload-dir app \
    --log-level info \
    --access-log \
    --use-colors

# This will only execute if the server stops
echo ""
log "👋 Chat AI Service stopped"
log "📊 Service Summary:"
log "   • Total uptime: $(date)"
log "   • Thank you for using Chat AI Service v2.1.0!"
