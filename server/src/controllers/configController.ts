import { Context } from 'koa';
import { config } from '../config';

class ConfigController {
  async getModel(ctx: Context) {
    try {
      ctx.body = {
        config: {
          embedding: config.models.embedding,
          generation: config.models.generation,
          rag: config.rag
        },
        success: true
      };
    } catch (error) {
      console.error('Get model config error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to get model configuration' };
    }
  }

  async updateModel(ctx: Context) {
    try {
      const { embedding, generation, rag } = ctx.request.body;

      if (embedding) {
        config.models.embedding = embedding;
      }

      if (generation) {
        config.models.generation = generation;
      }

      if (rag) {
        Object.assign(config.rag, rag);
      }

      ctx.body = {
        message: 'Model configuration updated successfully',
        config: {
          embedding: config.models.embedding,
          generation: config.models.generation,
          rag: config.rag
        },
        success: true
      };
    } catch (error) {
      console.error('Update model config error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to update model configuration' };
    }
  }
}

export const configController = new ConfigController();