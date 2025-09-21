import { Context } from 'koa';
import { ragService } from '../services/ragService';

class ChatController {
  async sendMessage(ctx: Context) {
    try {
      console.log(`[CHAT] === Incoming Chat Request ===`);
      console.log(`[CHAT] Method: ${ctx.method}`);
      console.log(`[CHAT] URL: ${ctx.url}`);
      console.log(`[CHAT] Request body:`, ctx.request.body);

      const { message, stream = false } = ctx.request.body;

      console.log(`[CHAT] Message: "${message}"`);
      console.log(`[CHAT] Stream mode: ${stream}`);

      if (!message || typeof message !== 'string') {
        console.log(`[CHAT] ERROR: Invalid message - message is required`);
        ctx.status = 400;
        ctx.body = { error: 'Message is required' };
        return;
      }

      if (stream) {
        console.log(`[CHAT] Processing streaming request...`);
        // Set up SSE headers
        ctx.set({
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control'
        });

        const response = await ragService.queryStream(message);
        console.log(`[CHAT] Streaming response created`);

        ctx.body = response; // response should be a readable stream
      } else {
        console.log(`[CHAT] Processing non-streaming request...`);
        const response = await ragService.query(message);
        console.log(`[CHAT] RAG response received:`, {
          id: response.id,
          role: response.role,
          contentLength: response.content.length,
          sources: response.sources?.length || 0
        });

        ctx.body = {
          message: response,
          success: true
        };
        console.log(`[CHAT] Response sent successfully`);
      }
    } catch (error) {
      console.error('[CHAT] Chat message error:', error);
      console.error('[CHAT] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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