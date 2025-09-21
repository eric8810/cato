"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configController = void 0;
const config_1 = require("../config");
class ConfigController {
    async getModel(ctx) {
        try {
            ctx.body = {
                config: {
                    embedding: config_1.config.models.embedding,
                    generation: config_1.config.models.generation,
                    rag: config_1.config.rag
                },
                success: true
            };
        }
        catch (error) {
            console.error('Get model config error:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to get model configuration' };
        }
    }
    async updateModel(ctx) {
        try {
            const { embedding, generation, rag } = ctx.request.body;
            if (embedding) {
                config_1.config.models.embedding = embedding;
            }
            if (generation) {
                config_1.config.models.generation = generation;
            }
            if (rag) {
                Object.assign(config_1.config.rag, rag);
            }
            ctx.body = {
                message: 'Model configuration updated successfully',
                config: {
                    embedding: config_1.config.models.embedding,
                    generation: config_1.config.models.generation,
                    rag: config_1.config.rag
                },
                success: true
            };
        }
        catch (error) {
            console.error('Update model config error:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to update model configuration' };
        }
    }
}
exports.configController = new ConfigController();
//# sourceMappingURL=configController.js.map