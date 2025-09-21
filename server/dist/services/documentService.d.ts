import { Document } from '../models/Document';
declare class DocumentService {
    private documents;
    uploadDocument(file: any): Promise<Document>;
    processDocument(document: Document): Promise<void>;
    getDocuments(): Document[];
    deleteDocument(id: string): Promise<boolean>;
    getDocument(id: string): Document | undefined;
}
export declare const documentService: DocumentService;
export {};
//# sourceMappingURL=documentService.d.ts.map