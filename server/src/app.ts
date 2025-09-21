import Koa from 'koa';
import Router from '@koa/router';
import cors from '@koa/cors';
import { koaBody } from 'koa-body';
import path from 'path';
import { config } from './config';
import { documentController } from './controllers/documentController';
import { chatController } from './controllers/chatController';
import { configController } from './controllers/configController';
import { ragService } from './services/ragService';

const app = new Koa();
const router = new Router();

// Middleware
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.resolve(config.server.uploadDir),
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024 // 10MB
  }
}));

// Routes
router.prefix('/api');

// Document routes
router.post('/documents/upload', documentController.upload);
router.get('/documents', documentController.list);
router.delete('/documents/:id', documentController.delete);

// Chat routes
router.post('/chat/message', chatController.sendMessage);
router.get('/chat/history', chatController.getHistory);
router.delete('/chat/clear', chatController.clearHistory);

// Config routes
router.get('/config/model', configController.getModel);
router.put('/config/model', configController.updateModel);

app.use(router.routes());
app.use(router.allowedMethods());

// Error handling
app.on('error', (err, ctx) => {
  console.error('Server error:', err);
});

// Initialize services
async function startServer() {
  try {
    // Initialize RAG service
    await ragService.initialize();
    console.log('RAG service initialized');

    const port = config.server.port;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;