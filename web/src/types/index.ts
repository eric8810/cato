// Document entity
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadTime: Date;
  status: 'processing' | 'ready' | 'error';
}

// Chat message entity
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface UploadDocumentResponse {
  message: string;
  document: Document;
}

export interface ChatResponse {
  message: ChatMessage;
  success: boolean;
}

export interface ChatHistoryResponse {
  history: ChatMessage[];
  success: boolean;
}

export interface DocumentListResponse {
  documents: Document[];
}

// Model configuration types
export interface ModelConfig {
  embedding?: {
    url: string;
    model: string;
  };
  generation?: {
    url: string;
    model: string;
    temperature?: number;
    topK?: number;
    topP?: number;
  };
  rag?: {
    chunkSize: number;
    chunkOverlap: number;
    topK: number;
    hybridSearch: boolean;
    rerankingEnabled: boolean;
  };
}

export interface ConfigResponse {
  config: ModelConfig;
  success: boolean;
}