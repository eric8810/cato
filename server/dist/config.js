"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    server: {
        port: 3000,
        uploadDir: './uploads'
    },
    qdrant: {
        url: 'http://localhost:6333',
        collectionName: 'documents'
    },
    models: {
        embedding: 'http://localhost:8080',
        generation: 'http://localhost:8081'
    },
    rag: {
        chunkSize: 512,
        chunkOverlap: 50,
        topK: 5,
        hybridSearch: true,
        rerankingEnabled: true
    }
};
//# sourceMappingURL=config.js.map