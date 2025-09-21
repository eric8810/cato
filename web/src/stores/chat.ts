import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ChatMessage } from '@/types';
import { chatApi } from '@/services/api';

export const useChatStore = defineStore('chat', () => {
  // State
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isStreaming = ref(false);
  const currentStreamingMessage = ref('');

  // Actions
  const fetchHistory = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await chatApi.getHistory();
      if (response.success) {
        messages.value = response.history.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch chat history';
      console.error('Error fetching chat history:', err);
    } finally {
      loading.value = false;
    }
  };

  const sendMessage = async (content: string, useStreaming = true) => {
    if (!content.trim()) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    messages.value.push(userMessage);

    error.value = null;

    if (useStreaming) {
      await sendStreamingMessage(content);
    } else {
      await sendRegularMessage(content);
    }
  };

  const sendStreamingMessage = async (content: string) => {
    isStreaming.value = true;
    currentStreamingMessage.value = '';

    // Add placeholder for assistant message
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    messages.value.push(assistantMessage);

    try {
      await chatApi.sendStreamingMessage(
        content,
        // onToken
        (token: string) => {
          currentStreamingMessage.value += token;
          // Update the last message
          const lastMessage = messages.value[messages.value.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = currentStreamingMessage.value;
          }
        },
        // onComplete
        (completeMessage: ChatMessage) => {
          const lastMessage = messages.value[messages.value.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.id = completeMessage.id;
            lastMessage.content = completeMessage.content;
            lastMessage.timestamp = new Date(completeMessage.timestamp);
            lastMessage.sources = completeMessage.sources;
          }
          isStreaming.value = false;
          currentStreamingMessage.value = '';
        },
        // onError
        (errorMsg: string) => {
          error.value = errorMsg;
          isStreaming.value = false;
          currentStreamingMessage.value = '';
          // Remove the placeholder message on error
          messages.value.pop();
        }
      );
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send message';
      isStreaming.value = false;
      currentStreamingMessage.value = '';
      // Remove the placeholder message on error
      messages.value.pop();
    }
  };

  const sendRegularMessage = async (content: string) => {
    loading.value = true;

    try {
      const response = await chatApi.sendMessage(content);
      if (response.success) {
        const assistantMessage = {
          ...response.message,
          timestamp: new Date(response.message.timestamp),
        };
        messages.value.push(assistantMessage);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send message';
      console.error('Error sending message:', err);
    } finally {
      loading.value = false;
    }
  };

  const clearHistory = async () => {
    loading.value = true;
    error.value = null;

    try {
      await chatApi.clearHistory();
      messages.value = [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to clear history';
      console.error('Error clearing history:', err);
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  // Getters
  const totalMessages = computed(() => messages.value.length);
  const userMessages = computed(() =>
    messages.value.filter(msg => msg.role === 'user')
  );
  const assistantMessages = computed(() =>
    messages.value.filter(msg => msg.role === 'assistant')
  );
  const lastMessage = computed(() =>
    messages.value.length > 0 ? messages.value[messages.value.length - 1] : null
  );

  return {
    // State
    messages,
    loading,
    error,
    isStreaming,
    currentStreamingMessage,

    // Actions
    fetchHistory,
    sendMessage,
    clearHistory,
    clearError,

    // Getters
    totalMessages,
    userMessages,
    assistantMessages,
    lastMessage,
  };
});