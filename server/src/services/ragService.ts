import {
  VectorStoreIndex,
  Settings,
  Document,
  SentenceSplitter,
  storageContextFromDefaults,
  MetadataMode
} from 'llamaindex';
import { QdrantVectorStore } from '@llamaindex/qdrant';
import { OpenAIEmbedding } from '@llamaindex/openai';
import { config } from '../config';
import { ChatMessage } from '../models/Document';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { Readable } from 'stream';

class RAGService {
  private index: VectorStoreIndex | null = null;
  private vectorStore: QdrantVectorStore | null = null;
  private chatHistory: ChatMessage[] = [];
  private textSplitter: SentenceSplitter;
  private isInitialized: boolean = false;

  constructor() {
    // Initialize text splitter with configuration from PROJECT_DESIGN.md
    this.textSplitter = new SentenceSplitter({
      chunkSize: config.rag.chunkSize,
      chunkOverlap: config.rag.chunkOverlap
    });
  }

  async initialize() {
    try {
      console.log('[RAG] Initializing RAG service...');

      // Configure embedding model to use local Qwen embedding server
      Settings.embedModel = new OpenAIEmbedding({
        apiKey: 'sk-fake', // llama.cpp doesn't need a real API key
        baseURL: config.models.embedding,
        model: 'text-embedding-3-small' // This can be any name for llama.cpp
      });

      // Initialize Qdrant vector store
      this.vectorStore = new QdrantVectorStore({
        url: config.qdrant.url,
        collectionName: config.qdrant.collectionName
      });

      console.log(`[RAG] Connected to Qdrant at ${config.qdrant.url}`);
      console.log(`[RAG] Using collection: ${config.qdrant.collectionName}`);

      // Create storage context with Qdrant vector store
      const storageContext = await storageContextFromDefaults({
        vectorStore: this.vectorStore
      });

      // Create vector store index
      this.index = await VectorStoreIndex.fromDocuments([], {
        storageContext
      });

      this.isInitialized = true;
      console.log('[RAG] RAG service initialized successfully with Qdrant vector store');
    } catch (error) {
      console.error('[RAG] Failed to initialize RAG service:', error);
      throw error;
    }
  }

  async addDocument(filePath: string): Promise<void> {
    try {
      if (!this.isInitialized || !this.index) {
        throw new Error('RAG service not initialized. Call initialize() first.');
      }

      console.log(`[RAG] === Adding Document to Vector Store ===`);
      console.log(`[RAG] File path: ${filePath}`);

      // Read file content
      const content = await fs.readFile(filePath, 'utf-8');
      const fileName = path.basename(filePath);
      console.log(`[RAG] File: ${fileName}, Content length: ${content.length} characters`);

      // Create document with metadata
      const document = new Document({
        text: content,
        metadata: {
          filePath: filePath,
          fileName: fileName,
          uploadTime: new Date().toISOString(),
          fileSize: content.length
        }
      });

      // Split document into chunks
      const nodes = this.textSplitter.getNodesFromDocuments([document]);
      console.log(`[RAG] Document split into ${nodes.length} chunks`);
      console.log(`[RAG] Chunk size config: ${config.rag.chunkSize}, overlap: ${config.rag.chunkOverlap}`);

      // Add nodes to vector store
      await this.index.insertNodes(nodes);
      console.log(`[RAG] Successfully added ${nodes.length} document chunks to vector store`);

      // Log first chunk preview for debugging
      if (nodes.length > 0) {
        console.log(`[RAG] First chunk preview: ${nodes[0].getContent().substring(0, 200)}...`);
      }

    } catch (error) {
      console.error(`[RAG] Failed to add document ${filePath}:`, error);
      throw error;
    }
  }

  async query(message: string): Promise<ChatMessage> {
    try {
      if (!this.isInitialized || !this.index) {
        throw new Error('RAG service not initialized. Call initialize() first.');
      }

      console.log(`[RAG] === Processing Vector-based Query ===`);
      console.log(`[RAG] User message: "${message}"`);

      // Create user message
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: message,
        timestamp: new Date()
      };

      this.chatHistory.push(userMessage);

      // Create query engine with similarity search
      const retriever = this.index.asRetriever({
        similarityTopK: config.rag.topK
      });
      console.log(`[RAG] Using top-K retrieval: ${config.rag.topK}`);

      // Retrieve relevant nodes
      const retrievedNodes = await retriever.retrieve(message);
      console.log(`[RAG] Retrieved ${retrievedNodes.length} relevant chunks`);

      let responseText = '';
      let sources: string[] = [];

      if (retrievedNodes.length > 0) {
        // Extract content and sources from retrieved nodes
        const relevantContent = retrievedNodes.map((node, index) => {
          const content = node.node.getContent(MetadataMode.NONE);
          const metadata = node.node.metadata;
          const fileName = metadata.fileName || metadata.filePath || `Document ${index + 1}`;
          const score = node.score?.toFixed(3) || 'N/A';

          if (fileName && !sources.includes(fileName)) {
            sources.push(fileName);
          }

          console.log(`[RAG] Chunk ${index + 1}: Score=${score}, Source=${fileName}`);
          console.log(`[RAG] Content preview: ${content.substring(0, 150)}...`);

          return `\n\n**From ${fileName} (Relevance: ${score}):**\n${content}`;
        }).join('');

        responseText = `Based on the retrieved documents, here's what I found:${relevantContent}`;
        console.log(`[RAG] Response generated from ${retrievedNodes.length} chunks`);
      } else {
        responseText = 'I couldn\'t find relevant information in the uploaded documents for your query. Please try rephrasing your question or upload more documents.';
        console.log(`[RAG] No relevant chunks found for query`);
      }

      console.log(`[RAG] Final response length: ${responseText.length} characters`);
      console.log(`[RAG] Sources: [${sources.join(', ')}]`);

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        sources: sources
      };

      this.chatHistory.push(assistantMessage);
      console.log(`[RAG] === Vector Query Processing Complete ===`);

      return assistantMessage;
    } catch (error) {
      console.error('[RAG] Vector query error:', error);
      console.error('[RAG] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

      // Return error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please make sure Qdrant is running and documents are properly indexed.',
        timestamp: new Date()
      };

      this.chatHistory.push(errorMessage);
      return errorMessage;
    }
  }

  async queryStream(message: string): Promise<Readable> {
    console.log(`[RAG STREAM] === Processing Vector-based Streaming Query ===`);
    console.log(`[RAG STREAM] User message: "${message}"`);

    if (!this.isInitialized || !this.index) {
      throw new Error('RAG service not initialized. Call initialize() first.');
    }

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

    // Process streaming response
    const processStream = async () => {
      try {
        // Create query engine with similarity search
        const retriever = this.index!.asRetriever({
          similarityTopK: config.rag.topK
        });
        console.log(`[RAG STREAM] Using top-K retrieval: ${config.rag.topK}`);

        // Retrieve relevant nodes
        const retrievedNodes = await retriever.retrieve(message);
        console.log(`[RAG STREAM] Retrieved ${retrievedNodes.length} relevant chunks`);

        let responseText = '';
        let sources: string[] = [];

        if (retrievedNodes.length > 0) {
          // Extract content and sources from retrieved nodes
          const relevantContent = retrievedNodes.map((node, index) => {
            const content = node.node.getContent(MetadataMode.NONE);
            const metadata = node.node.metadata;
            const fileName = metadata.fileName || metadata.filePath || `Document ${index + 1}`;
            const score = node.score?.toFixed(3) || 'N/A';

            if (fileName && !sources.includes(fileName)) {
              sources.push(fileName);
            }

            console.log(`[RAG STREAM] Chunk ${index + 1}: Score=${score}, Source=${fileName}`);

            return `\n\n**From ${fileName} (Relevance: ${score}):**\n${content}`;
          }).join('');

          responseText = `Based on the retrieved documents, here's what I found:${relevantContent}`;
          console.log(`[RAG STREAM] Response generated from ${retrievedNodes.length} chunks`);
        } else {
          responseText = 'I couldn\'t find relevant information in the uploaded documents for your query. Please try rephrasing your question or upload more documents.';
          console.log(`[RAG STREAM] No relevant chunks found for query`);
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
          sources: sources
        };

        this.chatHistory.push(assistantMessage);

        stream.push(`data: ${JSON.stringify({
          type: 'end',
          message: assistantMessage
        })}\n\n`);

        stream.push(null); // End stream
      } catch (error) {
        console.error('[RAG STREAM] Vector stream error:', error);
        stream.push(`data: ${JSON.stringify({
          type: 'error',
          error: 'Failed to process message with vector search'
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