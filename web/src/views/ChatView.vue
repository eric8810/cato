<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useChatStore } from '@/stores'
import ChatMessage from '@/components/ChatMessage.vue'
import { Send, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const chatStore = useChatStore()
const messageInput = ref('')
const messagesContainer = ref<HTMLElement>()

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Watch for new messages and scroll to bottom
watch(
  () => chatStore.messages.length,
  () => {
    scrollToBottom()
  }
)

// Watch for streaming updates and scroll to bottom
watch(
  () => chatStore.currentStreamingMessage,
  () => {
    scrollToBottom()
  }
)

const handleSendMessage = async () => {
  if (!messageInput.value.trim() || chatStore.loading || chatStore.isStreaming) {
    return
  }

  const message = messageInput.value.trim()
  messageInput.value = ''

  try {
    await chatStore.sendMessage(message)
  } catch (error) {
    toast.error('发送消息失败', {
      description: error instanceof Error ? error.message : '未知错误'
    })
  }
}

const handleClearHistory = async () => {
  try {
    await chatStore.clearHistory()
    toast.success('对话历史已清空')
  } catch (error) {
    toast.error('清空历史失败', {
      description: error instanceof Error ? error.message : '未知错误'
    })
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSendMessage()
  }
}
</script>

<template>
  <Card class="flex flex-col h-full">
    <CardHeader class="flex-shrink-0">
      <div class="flex items-center justify-between">
        <CardTitle>智能对话</CardTitle>
        <Button
          variant="outline"
          size="sm"
          @click="handleClearHistory"
          :disabled="chatStore.loading || chatStore.messages.length === 0"
        >
          <Trash2 class="w-4 h-4 mr-2" />
          清空历史
        </Button>
      </div>
    </CardHeader>

    <CardContent class="flex flex-col flex-1 p-0">
      <!-- Messages Area -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-300px)]"
      >
        <div v-if="chatStore.messages.length === 0" class="text-center text-muted-foreground py-8">
          <p class="text-lg mb-2">欢迎使用 RAG 对话系统</p>
          <p class="text-sm">请上传文档后开始对话，系统会基于文档内容进行智能回答</p>
        </div>

        <ChatMessage
          v-for="message in chatStore.messages"
          :key="message.id"
          :message="message"
        />

        <!-- Error Display -->
        <div v-if="chatStore.error" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p class="text-destructive text-sm">{{ chatStore.error }}</p>
          <Button
            variant="outline"
            size="sm"
            class="mt-2"
            @click="chatStore.clearError"
          >
            清除错误
          </Button>
        </div>
      </div>

      <!-- Input Area -->
      <div class="border-t border-border p-4 bg-muted/10">
        <div class="flex gap-2">
          <Textarea
            v-model="messageInput"
            placeholder="请输入您的问题..."
            class="flex-1 min-h-[60px] max-h-32 resize-none"
            :disabled="chatStore.loading || chatStore.isStreaming"
            @keydown="handleKeyDown"
          />
          <Button
            @click="handleSendMessage"
            :disabled="!messageInput.trim() || chatStore.loading || chatStore.isStreaming"
            class="self-end"
          >
            <Send class="w-4 h-4" />
          </Button>
        </div>

        <div class="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>按 Enter 发送，Shift+Enter 换行</span>
          <span v-if="chatStore.isStreaming" class="text-primary">正在生成回答...</span>
          <span v-else-if="chatStore.loading" class="text-primary">正在处理...</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>