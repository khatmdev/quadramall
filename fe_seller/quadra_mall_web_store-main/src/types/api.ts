export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  message: string;
  timestamp: string;
  data: T;
  errorCode?: string;
}

export interface SuggestionRequest {
  item_type_id: number;
  product_name: string;
}

export interface Attribute {
  name: string;
  values: string[];
  typesValue: 'STRING' | 'NUMBER' | 'ALL' | undefined;
  confidence?: number;
  reasoning?: string;
  source?: string;
}

export interface Metadata {
  data_quality_score: number;
  data_sources: string[];
  external_search_reasons: string[];
  external_search_used: boolean;
  item_type_id: number;
  item_type_name: string;
  overall_confidence: number;
  processing_time_seconds: number;
  product_name: string;
  message?: string; // Thêm trường message để khắc phục lỗi TS2339
  errorCode?: string; // Thêm trường errorCode để đồng bộ với suggestionService.ts
}

export interface SuggestionResponse {
  success: boolean;
  attributes: Attribute[];
  suggested_variants: string[];
  metadata: Metadata;
}

export interface ItemType {
  id: number;
  name: string;
  parent_id: number | null;
}

export interface AttributeValue {
  attributeName: string;
  value: string;
}

export interface ProductAttribute {
  id: number;
  name: string;
  typesValue: 'STRING' | 'NUMBER' | 'ALL';
  values: AttributeValue[];
}

export interface ProductVariant {
  id: number;
  combination: AttributeValue[];
  price: number;
  stock: number;
  sku: string;
  image: { file: File | null; url: string } | null;
  altText: string;
  isActive: boolean;
  isSelected: boolean;
}

export interface DefaultValues {
  price: number;
  stock: number;
}