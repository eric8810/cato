import { ChatMessage } from '../models/Document';
declare class RAGService {
    private index;
    private chatHistory;
    private documents;
    initialize(): Promise<void>;
    addDocument(filePath: string): Promise<void>;
    query(message: string): Promise<ChatMessage>;
    getChatHistory(): ChatMessage[];
    clearChatHistory(): void;
}
export declare const ragService: RAGService;
export {};
//# sourceMappingURL=ragService.d.ts.map