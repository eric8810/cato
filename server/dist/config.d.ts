export declare const config: {
    server: {
        port: number;
        uploadDir: string;
    };
    qdrant: {
        url: string;
        collectionName: string;
    };
    models: {
        embedding: string;
        generation: string;
    };
    rag: {
        chunkSize: number;
        chunkOverlap: number;
        topK: number;
        hybridSearch: boolean;
        rerankingEnabled: boolean;
    };
};
//# sourceMappingURL=config.d.ts.map