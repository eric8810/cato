import { Context } from 'koa';
import { ragService } from '../services/ragService';

class ChatController {
  async sendMessage(ctx: Context) {
    try {
      const { message, stream = false } = ctx.request.body;

      if (!message || typeof message !== 'string') {
        ctx.status = 400;
        ctx.body = { error: 'Message is required' };
        return;
      }

      if (stream) {
        // Set up SSE headers
        ctx.set({
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control'
        });

        const response = await ragService.queryStream(message);

        ctx.body = response; // response should be a readable stream
      } else {
        const response = await ragService.query(message);

        ctx.body = {
          message: response,
          success: true
        };
      }
    } catch (error) {
      console.error('Chat message error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to process message' };
    }
  }

  async getHistory(ctx: Context) {
    try {
      const history = ragService.getChatHistory();

      ctx.body = {
        history,
        success: true
      };
    } catch (error) {
      console.error('Get chat history error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to get chat history' };
    }
  }

  async clearHistory(ctx: Context) {
    try {
      ragService.clearChatHistory();

      ctx.body = {
        message: 'Chat history cleared successfully',
        success: true
      };
    } catch (error) {
      console.error('Clear chat history error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to clear chat history' };
    }
  }
}

export const chatController = new ChatController();