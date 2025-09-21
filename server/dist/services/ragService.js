"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ragService = void 0;
const llamaindex_1 = require("llamaindex");
const uuid_1 = require("uuid");
const promises_1 = __importDefault(require("fs/promises"));
class RAGService {
    index = null;
    chatHistory = [];
    documents = new Map(); // filePath -> content
    async initialize() {
        try {
            // For now, create a simple in-memory document store
            // We'll enhance this later with proper vector storage
            this.index = await llamaindex_1.VectorStoreIndex.fromDocuments([]);
            console.log('RAG service initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize RAG service:', error);
            throw error;
        }
    }
    async addDocument(filePath) {
        try {
            // Read file content
            const content = await promises_1.default.readFile(filePath, 'utf-8');
            // Store document content
            this.documents.set(filePath, content);
            console.log(`Document ${filePath} added to RAG service`);
        }
        catch (error) {
            console.error(`Failed to add document ${filePath}:`, error);
            throw error;
        }
    }
    async query(message) {
        try {
            // Create user message
            const userMessage = {
                id: (0, uuid_1.v4)(),
                role: 'user',
                content: message,
                timestamp: new Date()
            };
            this.chatHistory.push(userMessage);
            // For now, implement simple text search
            // TODO: Implement proper RAG with vector search and LLM generation
            let relevantContent = '';
            const searchTerms = message.toLowerCase().split(' ');
            for (const [filePath, content] of this.documents) {
                const lowerContent = content.toLowerCase();
                if (searchTerms.some(term => lowerContent.includes(term))) {
                    relevantContent += `\n\nFrom ${filePath}:\n${content.substring(0, 500)}...`;
                }
            }
            let responseText = '';
            if (relevantContent) {
                responseText = `Based on the documents, here's what I found:${relevantContent}`;
            }
            else if (this.documents.size === 0) {
                responseText = 'No documents have been uploaded yet. Please upload some documents first.';
            }
            else {
                responseText = 'I couldn\'t find relevant information in the uploaded documents for your query.';
            }
            // Create assistant message
            const assistantMessage = {
                id: (0, uuid_1.v4)(),
                role: 'assistant',
                content: responseText,
                timestamp: new Date(),
                sources: Array.from(this.documents.keys())
            };
            this.chatHistory.push(assistantMessage);
            return assistantMessage;
        }
        catch (error) {
            console.error('Query error:', error);
            // Return error message
            const errorMessage = {
                id: (0, uuid_1.v4)(),
                role: 'assistant',
                content: 'Sorry, I encountered an error while processing your question.',
                timestamp: new Date()
            };
            this.chatHistory.push(errorMessage);
            return errorMessage;
        }
    }
    getChatHistory() {
        return this.chatHistory;
    }
    clearChatHistory() {
        this.chatHistory = [];
    }
}
exports.ragService = new RAGService();
//# sourceMappingURL=ragService.js.map