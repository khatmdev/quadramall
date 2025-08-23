#!/usr/bin/env python3
"""
Build Vector Index Script
Build FAISS index from database products for Chat AI Service
"""
import asyncio
import sys
import os
import logging
from datetime import datetime

# Add the current directory to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def print_header():
    """Print script header"""
    print("🚀 Chat AI Service - Vector Index Builder")
    print("=" * 60)
    print(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

def print_config_info(settings):
    """Print configuration information"""
    print("📋 Configuration:")
    print(f"   • Database: {settings.MYSQL_HOST}:{settings.MYSQL_PORT}/{settings.MYSQL_DATABASE}")
    print(f"   • Vector storage: {settings.VECTOR_STORAGE_PATH}")
    print(f"   • Embedding model: {settings.EMBEDDING_MODEL}")
    print(f"   • Vector dimension: {settings.VECTOR_DIMENSION}")
    print(f"   • Top K results: {settings.TOP_K_RESULTS}")
    print()

async def test_database_connection():
    """Test database connection"""
    try:
        from app.config.database import db_manager
        
        print("🔗 Testing database connection...")
        health = await db_manager.health_check()
        
        if not health["database"]["connected"]:
            print("❌ Database connection failed!")
            print("   Please check your database configuration in .env file")
            print("   Make sure MySQL is running and credentials are correct")
            return False
        
        print("✅ Database connection successful")
        
        if health["redis"]["connected"]:
            print("✅ Redis connection successful")
        else:
            print("⚠️ Redis connection failed (optional for index building)")
        
        print()
        return True
        
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
        return False

async def check_existing_index(vector_service):
    """Check if index already exists"""
    try:
        print("🔍 Checking existing index...")
        stats = await vector_service.get_stats()
        existing_vectors = stats.get("total_vectors", 0)
        
        if existing_vectors > 0:
            print(f"⚠️  Existing index found with {existing_vectors} vectors")
            print(f"   Index file: {stats.get('index_path', 'N/A')}")
            print(f"   Metadata file: {stats.get('metadata_path', 'N/A')}")
            
            # Ask for confirmation in interactive mode
            if sys.stdin.isatty():
                response = input("Do you want to rebuild? (y/N): ").strip().lower()
                if response not in ['y', 'yes']:
                    print("🚫 Build cancelled by user")
                    return False
            else:
                print("🔄 Non-interactive mode: rebuilding automatically")
        else:
            print("💫 No existing index found")
        
        print()
        return True
        
    except Exception as e:
        print(f"⚠️ Error checking existing index: {e}")
        print("   Proceeding with build...")
        print()
        return True

async def build_vector_index(vector_service):
    """Build the vector index"""
    try:
        print("🔨 Building vector index from database...")
        print("   This may take a few minutes depending on database size...")
        print("   Progress will be shown below:")
        print()

        start_time = datetime.now()
        success = await vector_service.build_index(force_rebuild=True)
        build_time = datetime.now() - start_time

        if not success:
            print("❌ Failed to build vector index")
            print("   Check the logs above for error details")
            return False, None

        return True, build_time
        
    except Exception as e:
        print(f"❌ Build error: {e}")
        logger.exception("Vector index build failed")
        return False, None

async def show_build_results(vector_service, build_time):
    """Show build results and stats"""
    try:
        # Get final stats
        final_stats = await vector_service.get_stats()
        total_vectors = final_stats.get("total_vectors", 0)

        print("✅ Vector index built successfully!")
        print(f"   📊 Total products indexed: {total_vectors}")
        print(f"   ⏱️  Build time: {build_time.total_seconds():.2f} seconds")
        print(f"   📁 Index file: {final_stats.get('index_path', 'N/A')}")
        print(f"   📋 Metadata file: {final_stats.get('metadata_path', 'N/A')}")
        print(f"   🔤 Model dimension: {final_stats.get('dimension', 'N/A')}")
        print()
        
        return total_vectors > 0
        
    except Exception as e:
        print(f"⚠️ Error getting build results: {e}")
        return False

async def test_search_functionality(vector_service):
    """Test search functionality with sample queries"""
    try:
        print("🧪 Testing search functionality...")
        test_queries = [
            "điện thoại",
            "laptop", 
            "tv samsung",
            "iphone",
            "máy tính"
        ]
        
        success_count = 0
        
        for query in test_queries:
            try:
                results = await vector_service.search(query, top_k=3)
                result_count = len(results)
                
                if result_count > 0:
                    # Show top result
                    top_result = results[0]
                    score = top_result.get('similarity_score', 0)
                    name = top_result.get('name', 'N/A')
                    print(f"   🔍 '{query}': {result_count} results (top: {name}, score: {score:.3f})")
                    success_count += 1
                else:
                    print(f"   🔍 '{query}': 0 results")
                    
            except Exception as e:
                print(f"   ❌ Test '{query}' failed: {e}")

        print()
        if success_count > 0:
            print(f"✅ Search tests completed: {success_count}/{len(test_queries)} queries successful")
        else:
            print("⚠️ No search tests were successful - check your data")
            
        return success_count > 0
        
    except Exception as e:
        print(f"❌ Search testing failed: {e}")
        return False

async def main():
    """Main build index function"""
    try:
        print_header()

        # Import after path setup
        try:
            from app.services.ai.vector_search import VectorSearchService
            from app.config.settings import get_settings
        except ImportError as e:
            print(f"❌ Import error: {e}")
            print("   Make sure you're running this script from the project root directory")
            print("   and that all dependencies are installed")
            print("   Try: pip install -r requirements.txt")
            return False

        # Check configuration
        settings = get_settings()
        print_config_info(settings)

        # Test database connection
        if not await test_database_connection():
            return False

        # Initialize vector service
        print("📦 Initializing Vector Search Service...")
        try:
            vector_service = VectorSearchService()
            print("✅ Vector service initialized")
            print()
        except Exception as e:
            print(f"❌ Failed to initialize vector service: {e}")
            return False

        # Check existing index
        if not await check_existing_index(vector_service):
            return True  # User cancelled

        # Build index
        success, build_time = await build_vector_index(vector_service)
        if not success:
            return False

        # Show results
        if not await show_build_results(vector_service, build_time):
            return False

        # Test search functionality
        if not await test_search_functionality(vector_service):
            print("⚠️ Search testing had issues, but index was built")

        print("🎉 Index build completed successfully!")
        print(f"📅 Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        print("💡 You can now start the Chat AI Service:")
        print("   ./scripts/start.sh")
        print("   or")
        print("   python -m uvicorn app.main:app --reload")
        
        return True

    except KeyboardInterrupt:
        print("\n🚫 Build cancelled by user")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        logger.exception("Build index fatal error")
        return False

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n🚫 Build cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        sys.exit(1)
