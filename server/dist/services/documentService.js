"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const ragService_1 = require("./ragService");
class DocumentService {
    documents = new Map();
    async uploadDocument(file) {
        const id = (0, uuid_1.v4)();
        const document = {
            id,
            name: file.originalname || file.name,
            type: path_1.default.extname(file.originalname || file.name),
            size: file.size,
            uploadTime: new Date(),
            status: 'processing',
            filePath: file.filepath || file.path
        };
        this.documents.set(id, document);
        // Process document in background
        this.processDocument(document).catch(error => {
            console.error(`Failed to process document ${id}:`, error);
            document.status = 'error';
        });
        return document;
    }
    async processDocument(document) {
        try {
            if (!document.filePath) {
                throw new Error('File path not available');
            }
            // Add document to RAG service
            await ragService_1.ragService.addDocument(document.filePath);
            document.status = 'ready';
            console.log(`Document ${document.id} processed successfully`);
        }
        catch (error) {
            console.error(`Error processing document ${document.id}:`, error);
            document.status = 'error';
            throw error;
        }
    }
    getDocuments() {
        return Array.from(this.documents.values());
    }
    async deleteDocument(id) {
        const document = this.documents.get(id);
        if (!document) {
            return false;
        }
        // Delete file if exists
        if (document.filePath) {
            try {
                await promises_1.default.unlink(document.filePath);
            }
            catch (error) {
                console.error(`Failed to delete file ${document.filePath}:`, error);
            }
        }
        this.documents.delete(id);
        return true;
    }
    getDocument(id) {
        return this.documents.get(id);
    }
}
exports.documentService = new DocumentService();
//# sourceMappingURL=documentService.js.map