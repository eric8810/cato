"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = void 0;
const ragService_1 = require("../services/ragService");
class ChatController {
    async sendMessage(ctx) {
        try {
            const { message } = ctx.request.body;
            if (!message || typeof message !== 'string') {
                ctx.status = 400;
                ctx.body = { error: 'Message is required' };
                return;
            }
            const response = await ragService_1.ragService.query(message);
            ctx.body = {
                message: response,
                success: true
            };
        }
        catch (error) {
            console.error('Chat message error:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to process message' };
        }
    }
    async getHistory(ctx) {
        try {
            const history = ragService_1.ragService.getChatHistory();
            ctx.body = {
                history,
                success: true
            };
        }
        catch (error) {
            console.error('Get chat history error:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to get chat history' };
        }
    }
    async clearHistory(ctx) {
        try {
            ragService_1.ragService.clearChatHistory();
            ctx.body = {
                message: 'Chat history cleared successfully',
                success: true
            };
        }
        catch (error) {
            console.error('Clear chat history error:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to clear chat history' };
        }
    }
}
exports.chatController = new ChatController();
//# sourceMappingURL=chatController.js.map