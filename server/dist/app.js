"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const router_1 = __importDefault(require("@koa/router"));
const cors_1 = __importDefault(require("@koa/cors"));
const koa_body_1 = require("koa-body");
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const documentController_1 = require("./controllers/documentController");
const chatController_1 = require("./controllers/chatController");
const configController_1 = require("./controllers/configController");
const ragService_1 = require("./services/ragService");
const app = new koa_1.default();
const router = new router_1.default();
// Middleware
app.use((0, cors_1.default)({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization']
}));
app.use((0, koa_body_1.koaBody)({
    multipart: true,
    formidable: {
        uploadDir: path_1.default.resolve(config_1.config.server.uploadDir),
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024 // 10MB
    }
}));
// Routes
router.prefix('/api');
// Document routes
router.post('/documents/upload', documentController_1.documentController.upload);
router.get('/documents', documentController_1.documentController.list);
router.delete('/documents/:id', documentController_1.documentController.delete);
// Chat routes
router.post('/chat/message', chatController_1.chatController.sendMessage);
router.get('/chat/history', chatController_1.chatController.getHistory);
router.delete('/chat/clear', chatController_1.chatController.clearHistory);
// Config routes
router.get('/config/model', configController_1.configController.getModel);
router.put('/config/model', configController_1.configController.updateModel);
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
        await ragService_1.ragService.initialize();
        console.log('RAG service initialized');
        const port = config_1.config.server.port;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
exports.default = app;
//# sourceMappingURL=app.js.map