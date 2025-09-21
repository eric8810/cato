import { Context } from 'koa';
import { documentService } from '../services/documentService';

class DocumentController {
  async upload(ctx: Context) {
    try {
      const files = ctx.request.files;

      if (!files || (!files.file && !files.files)) {
        ctx.status = 400;
        ctx.body = { error: 'No file uploaded' };
        return;
      }

      const file = files.file || (Array.isArray(files.files) ? files.files[0] : files.files);

      if (!file || Array.isArray(file)) {
        ctx.status = 400;
        ctx.body = { error: 'Invalid file' };
        return;
      }

      // Check file type
      const allowedTypes = ['.txt', '.md'];
      const fileExt = (file as any).originalname ?
        (file as any).originalname.substring((file as any).originalname.lastIndexOf('.')) :
        (file as any).name ? (file as any).name.substring((file as any).name.lastIndexOf('.')) : '';

      if (!allowedTypes.includes(fileExt.toLowerCase())) {
        ctx.status = 400;
        ctx.body = { error: 'Only .txt and .md files are supported' };
        return;
      }

      const document = await documentService.uploadDocument(file);

      ctx.status = 201;
      ctx.body = {
        message: 'File uploaded successfully',
        document: {
          id: document.id,
          name: document.name,
          type: document.type,
          size: document.size,
          uploadTime: document.uploadTime,
          status: document.status
        }
      };
    } catch (error) {
      console.error('Upload error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to upload file' };
    }
  }

  async list(ctx: Context) {
    try {
      const documents = documentService.getDocuments().map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        uploadTime: doc.uploadTime,
        status: doc.status
      }));

      ctx.body = { documents };
    } catch (error) {
      console.error('List documents error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to get documents' };
    }
  }

  async delete(ctx: Context) {
    try {
      const { id } = ctx.params;

      const success = await documentService.deleteDocument(id);

      if (!success) {
        ctx.status = 404;
        ctx.body = { error: 'Document not found' };
        return;
      }

      ctx.body = { message: 'Document deleted successfully' };
    } catch (error) {
      console.error('Delete document error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to delete document' };
    }
  }
}

export const documentController = new DocumentController();