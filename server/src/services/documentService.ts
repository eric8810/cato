import { Document } from '../models/Document';
import { config } from '../config';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ragService } from './ragService';

class DocumentService {
  private documents: Map<string, Document> = new Map();

  async uploadDocument(file: any): Promise<Document> {
    const id = uuidv4();

    // Get filename using the correct property
    const fileName = file.originalFilename || file.originalname || file.name || 'unknown';

    const document: Document = {
      id,
      name: fileName,
      type: path.extname(fileName),
      size: file.size,
      uploadTime: new Date(),
      status: 'processing',
      filePath: file.filepath || file.path
    };

    console.log('Creating document:', {
      id,
      fileName,
      type: document.type,
      size: file.size,
      filePath: document.filePath
    });

    this.documents.set(id, document);

    // Process document in background
    this.processDocument(document).catch(error => {
      console.error(`Failed to process document ${id}:`, error);
      document.status = 'error';
    });

    return document;
  }

  async processDocument(document: Document): Promise<void> {
    try {
      if (!document.filePath) {
        throw new Error('File path not available');
      }

      // Add document to RAG service
      await ragService.addDocument(document.filePath);

      document.status = 'ready';
      console.log(`Document ${document.id} processed successfully`);
    } catch (error) {
      console.error(`Error processing document ${document.id}:`, error);
      document.status = 'error';
      throw error;
    }
  }

  getDocuments(): Document[] {
    return Array.from(this.documents.values());
  }

  async deleteDocument(id: string): Promise<boolean> {
    const document = this.documents.get(id);
    if (!document) {
      return false;
    }

    // Delete file if exists
    if (document.filePath) {
      try {
        await fs.unlink(document.filePath);
      } catch (error) {
        console.error(`Failed to delete file ${document.filePath}:`, error);
      }
    }

    this.documents.delete(id);
    return true;
  }

  getDocument(id: string): Document | undefined {
    return this.documents.get(id);
  }
}

export const documentService = new DocumentService();