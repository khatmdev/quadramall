"""
Search API Routes - Product search endpoints
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List

from app.services.ai.vector_search import VectorSearchService
from app.services.search.hybrid_search import HybridSearchService
from app.core.dependencies import get_vector_service, get_search_service

logger = logging.getLogger(__name__)
router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5
    min_score: Optional[float] = None

class SearchResponse(BaseModel):
    query: str
    products: List[dict]
    total_found: int
    search_time_ms: float

@router.post("/products", response_model=SearchResponse)
async def search_products(
    request: SearchRequest,
    vector_service: VectorSearchService = Depends(get_vector_service)
):
    """
    Search products using vector similarity
    """
    try:
        import time
        start_time = time.time()

        products = await vector_service.search(
            query=request.query,
            top_k=request.top_k,
            min_score=request.min_score
        )

        search_time = (time.time() - start_time) * 1000

        return SearchResponse(
            query=request.query,
            products=products,
            total_found=len(products),
            search_time_ms=search_time
        )

    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/products")
async def search_products_get(
    q: str = Query(..., description="Search query"),
    limit: int = Query(5, ge=1, le=20, description="Number of results"),
    vector_service: VectorSearchService = Depends(get_vector_service)
):
    """
    Search products via GET request
    """
    try:
        products = await vector_service.search(query=q, top_k=limit)

        return {
            "query": q,
            "products": products,
            "total_found": len(products)
        }

    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/smart")
async def smart_search(
    request: SearchRequest,
    search_service: HybridSearchService = Depends(get_search_service)
):
    """
    Smart search with AI analysis
    """
    try:
        result = await search_service.process_message(request.query)

        return {
            "query": request.query,
            "answer": result.answer,
            "products": result.products or [],
            "total_found": result.total_found,
            "search_type": result.search_type,
            "confidence": result.confidence
        }

    except Exception as e:
        logger.error(f"Smart search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
