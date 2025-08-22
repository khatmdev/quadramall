import { SuggestionRequest, SuggestionResponse } from '@/types/api';

const API_BASE_URL = 'http://localhost:5000';

const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 30000): Promise<Response> => {
    const controller = new AbortController();
    const id = setTimeout(() => {
        controller.abort(new Error('Request timed out after 30 seconds'));
    }, timeout);

    try {
        console.log(`Fetching ${url} with timeout ${timeout}ms`);
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);
        console.log(`Received response from ${url}: status ${response.status}`);
        return response;
    } catch (error) {
        clearTimeout(id);
        console.error(`Fetch error for ${url}:`, error);
        throw error;
    }
};

export const fetchSuggestions = async (
    request: SuggestionRequest,
    retries = 3,
    delay = 2000
): Promise<SuggestionResponse> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Attempt ${attempt}: Sending request to ${API_BASE_URL}/suggest`, request);

            const response = await fetchWithTimeout(`${API_BASE_URL}/suggest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    item_type_id: request.item_type_id,
                    product_name: request.product_name, // Bỏ encodeURIComponent
                }),
            }, 30000); // Timeout 30s

            console.log(`Attempt ${attempt}: Response status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data: SuggestionResponse = await response.json();
            console.log(`Attempt ${attempt}: Response data:`, data);

            // Kiểm tra response hợp lệ
            if (!data.success) {
                throw new Error(data.metadata?.message || 'API returned error status');
            }
            if (!Array.isArray(data.attributes)) {
                throw new Error('Invalid response data structure: attributes must be an array');
            }
            if (!Array.isArray(data.suggested_variants)) {
                throw new Error('Invalid response data structure: suggested_variants must be an array');
            }

            return data;
        } catch (error) {
            console.error(`Attempt ${attempt}: Fetch suggestions failed:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            const errorCode = errorMessage.includes('timed out') ? 'TIMEOUT_ERROR' :
                errorMessage.includes('HTTP') ? 'HTTP_ERROR' : 'FETCH_ERROR';

            if (attempt === retries) {
                return {
                    success: false,
                    attributes: [],
                    suggested_variants: [],
                    metadata: {
                        data_quality_score: 0,
                        data_sources: [],
                        external_search_reasons: [],
                        external_search_used: false,
                        item_type_id: request.item_type_id,
                        item_type_name: '',
                        overall_confidence: 0,
                        processing_time_seconds: 0,
                        product_name: request.product_name,
                        message: errorMessage,
                        errorCode: errorCode,
                    },
                };
            }

            // Đợi trước khi retry
            console.log(`Waiting ${delay}ms before retry ${attempt + 1}`);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    // Fallback nếu tất cả retries thất bại
    return {
        success: false,
        attributes: [],
        suggested_variants: [],
        metadata: {
            data_quality_score: 0,
            data_sources: [],
            external_search_reasons: [],
            external_search_used: false,
            item_type_id: request.item_type_id,
            item_type_name: '',
            overall_confidence: 0,
            processing_time_seconds: 0,
            product_name: request.product_name,
            message: 'All retry attempts failed',
            errorCode: 'FETCH_ERROR',
        },
    };
};