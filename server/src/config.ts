export const config = {
  server: {
    port: 3000,
    uploadDir: './uploads'
  },
  qdrant: {
    url: 'http://localhost:6333',
    collectionName: 'documents'
  },
  models: {
    embedding: 'http://localhost:8080/v1',
    generation: 'http://localhost:8081/v1'
  },
  rag: {
    chunkSize: 512,
    chunkOverlap: 50,
    topK: 5,
    hybridSearch: true,
    rerankingEnabled: true
  }
};