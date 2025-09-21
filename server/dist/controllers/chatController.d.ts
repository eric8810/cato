import { Context } from 'koa';
declare class ChatController {
    sendMessage(ctx: Context): Promise<void>;
    getHistory(ctx: Context): Promise<void>;
    clearHistory(ctx: Context): Promise<void>;
}
export declare const chatController: ChatController;
export {};
//# sourceMappingURL=chatController.d.ts.map