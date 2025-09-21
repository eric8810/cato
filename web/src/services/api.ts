import axios from 'axios';
import type {
  Document,
  ChatMessage,
  UploadDocumentResponse,
  ChatResponse,
  ChatHistoryResponse,
  DocumentListResponse,
  ModelConfig,
  ConfigResponse,
  ApiResponse
} from '@/types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://100.99.106.127:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Document API endpoints
export const documentApi = {
  // Upload document
  async upload(file: File): Promise<UploadDocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadDocumentResponse>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all documents
  async list(): Promise<DocumentListResponse> {
    const response = await api.get<DocumentListResponse>('/documents');
    return response.data;
  },

  // Get document status
  async getStatus(id: string): Promise<{ id: string; name: string; status: 'processing' | 'ready' | 'error' }> {
    const response = await api.get<{ id: string; name: string; status: 'processing' | 'ready' | 'error' }>(`/documents/${id}/status`);
    return response.data;
  },

  // Delete document
  async delete(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/documents/${id}`);
    return response.data;
  },
};

// Chat API endpoints
export const chatApi = {
  // Send message
  async sendMessage(message: string, stream = false): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>('/chat/message', {
      message,
      stream,
    });
    return response.data;
  },

  // Send streaming message
  async sendStreamingMessage(
    message: string,
    onToken: (token: string) => void,
    onComplete: (message: ChatMessage) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const response = await fetch('http://100.99.106.127:3000/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (data.type) {
                case 'token':
                  onToken(data.content);
                  break;
                case 'end':
                  onComplete(data.message);
                  break;
                case 'error':
                  onError(data.error);
                  break;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unknown error');
    }
  },

  // Get chat history
  async getHistory(): Promise<ChatHistoryResponse> {
    const response = await api.get<ChatHistoryResponse>('/chat/history');
    return response.data;
  },

  // Clear chat history
  async clearHistory(): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>('/chat/clear');
    return response.data;
  },
};

// Configuration API endpoints
export const configApi = {
  // Get model configuration
  async getModelConfig(): Promise<ConfigResponse> {
    const response = await api.get<ConfigResponse>('/config/model');
    return response.data;
  },

  // Update model configuration
  async updateModelConfig(config: Partial<ModelConfig>): Promise<ConfigResponse> {
    const response = await api.put<ConfigResponse>('/config/model', config);
    return response.data;
  },
};

export default api;