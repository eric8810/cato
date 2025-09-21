import { createPinia } from 'pinia';

export const pinia = createPinia();

// Export all stores
export { useDocumentsStore } from './documents';
export { useChatStore } from './chat';