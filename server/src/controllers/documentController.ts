import { Context } from 'koa';
import { documentService } from '../services/documentService';

class DocumentController {
  async upload(ctx: Context) {
    try {
      console.log('=== Document Upload Request ===');
      console.log('Method:', ctx.method);
      console.log('URL:', ctx.url);
      console.log('Headers:', JSON.stringify(ctx.headers, null, 2));
      console.log('Content-Type:', ctx.headers['content-type']);

      const files = ctx.request.files;
      console.log('Files received:', files);

      if (!files || (!files.file && !files.files)) {
        console.log('ERROR: No file uploaded');
        ctx.status = 400;
        ctx.body = { error: 'No file uploaded' };
        return;
      }

      const file = files.file || (Array.isArray(files.files) ? files.files[0] : files.files);
      console.log('Selected file object:', file);
      console.log('File properties:', {
        originalFilename: (file as any).originalFilename,
        originalname: (file as any).originalname,
        name: (file as any).name,
        mimetype: (file as any).mimetype,
        size: (file as any).size,
        filename: (file as any).filename,
        newFilename: (file as any).newFilename
      });

      if (!file || Array.isArray(file)) {
        console.log('ERROR: Invalid file - file is null or array');
        ctx.status = 400;
        ctx.body = { error: 'Invalid file' };
        return;
      }

      // Check file type
      const allowedTypes = ['.txt', '.md'];

      // 尝试多种方式获取文件名和扩展名
      let fileName = '';
      let fileExt = '';

      if ((file as any).originalFilename) {
        fileName = (file as any).originalFilename;
        fileExt = fileName.substring(fileName.lastIndexOf('.'));
      } else if ((file as any).originalname) {
        fileName = (file as any).originalname;
        fileExt = fileName.substring(fileName.lastIndexOf('.'));
      } else if ((file as any).name) {
        fileName = (file as any).name;
        fileExt = fileName.substring(fileName.lastIndexOf('.'));
      } else if ((file as any).filename) {
        fileName = (file as any).filename;
        fileExt = fileName.substring(fileName.lastIndexOf('.'));
      }

      console.log('File name detection:', {
        fileName,
        fileExt,
        fileExtLowerCase: fileExt.toLowerCase(),
        allowedTypes,
        isAllowed: allowedTypes.includes(fileExt.toLowerCase())
      });

      if (!allowedTypes.includes(fileExt.toLowerCase())) {
        console.log('ERROR: File type not supported');
        console.log('File extension:', fileExt);
        console.log('Allowed types:', allowedTypes);
        ctx.status = 400;
        ctx.body = { error: 'Only .txt and .md files are supported' };
        return;
      }

      console.log('File validation passed, proceeding with upload...');
      const document = await documentService.uploadDocument(file);
      console.log('Document uploaded successfully:', document);

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
      console.log('=== Upload Response Sent ===');
    } catch (error) {
      console.error('=== Upload Error ===');
      console.error('Error details:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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

  async getStatus(ctx: Context) {
    try {
      const { id } = ctx.params;

      const document = documentService.getDocument(id);

      if (!document) {
        ctx.status = 404;
        ctx.body = { error: 'Document not found' };
        return;
      }

      ctx.body = {
        id: document.id,
        name: document.name,
        status: document.status
      };
    } catch (error) {
      console.error('Get document status error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to get document status' };
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