import { VectorStoreIndex } from 'llamaindex';
import { config } from '../config';
import { ChatMessage } from '../models/Document';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import { Readable } from 'stream';

class RAGService {
  private index: VectorStoreIndex | null = null;
  private chatHistory: ChatMessage[] = [];
  private documents: Map<string, string> = new Map(); // filePath -> content

  async initialize() {
    try {
      // For now, create a simple in-memory document store
      // We'll enhance this later with proper vector storage
      this.index = await VectorStoreIndex.fromDocuments([]);
      console.log('RAG service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RAG service:', error);
      throw error;
    }
  }

  async addDocument(filePath: string): Promise<void> {
    try {
      // Read file content
      const content = await fs.readFile(filePath, 'utf-8');

      // Store document content
      this.documents.set(filePath, content);

      console.log(`Document ${filePath} added to RAG service`);
    } catch (error) {
      console.error(`Failed to add document ${filePath}:`, error);
      throw error;
    }
  }

  async query(message: string): Promise<ChatMessage> {
    try {
      // Create user message
      const userMessage: ChatMessage = {
        id: uuidv4(),
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
      } else if (this.documents.size === 0) {
        responseText = 'No documents have been uploaded yet. Please upload some documents first.';
      } else {
        responseText = 'I couldn\'t find relevant information in the uploaded documents for your query.';
      }

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        sources: Array.from(this.documents.keys())
      };

      this.chatHistory.push(assistantMessage);

      return assistantMessage;
    } catch (error) {
      console.error('Query error:', error);

      // Return error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your question.',
        timestamp: new Date()
      };

      this.chatHistory.push(errorMessage);
      return errorMessage;
    }
  }

  async queryStream(message: string): Promise<Readable> {
    // Create user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    this.chatHistory.push(userMessage);

    // Create a readable stream for SSE
    const stream = new Readable({
      read() {}
    });

    // Simulate streaming response
    const processStream = async () => {
      try {
        // Get search results (same logic as non-streaming)
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
        } else if (this.documents.size === 0) {
          responseText = 'No documents have been uploaded yet. Please upload some documents first.';
        } else {
          responseText = 'I couldn\'t find relevant information in the uploaded documents for your query.';
        }

        // Stream the response word by word
        const words = responseText.split(' ');
        const assistantId = uuidv4();

        // Send start event
        stream.push(`data: ${JSON.stringify({
          type: 'start',
          id: assistantId,
          role: 'assistant',
          timestamp: new Date()
        })}\n\n`);

        // Stream words with delay
        for (let i = 0; i < words.length; i++) {
          const word = words[i] + (i < words.length - 1 ? ' ' : '');

          stream.push(`data: ${JSON.stringify({
            type: 'token',
            id: assistantId,
            content: word
          })}\n\n`);

          // Small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Send end event
        const assistantMessage: ChatMessage = {
          id: assistantId,
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
          sources: Array.from(this.documents.keys())
        };

        this.chatHistory.push(assistantMessage);

        stream.push(`data: ${JSON.stringify({
          type: 'end',
          message: assistantMessage
        })}\n\n`);

        stream.push(null); // End stream
      } catch (error) {
        console.error('Stream error:', error);
        stream.push(`data: ${JSON.stringify({
          type: 'error',
          error: 'Failed to process message'
        })}\n\n`);
        stream.push(null);
      }
    };

    // Start processing asynchronously
    processStream();

    return stream;
  }

  getChatHistory(): ChatMessage[] {
    return this.chatHistory;
  }

  clearChatHistory(): void {
    this.chatHistory = [];
  }
}

export const ragService = new RAGService();