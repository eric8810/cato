<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { User, Bot, FileText } from 'lucide-vue-next'
import type { ChatMessage } from '@/types'

interface Props {
  message: ChatMessage
}

const props = defineProps<Props>()

const isUser = computed(() => props.message.role === 'user')
const timestamp = computed(() => {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(props.message.timestamp))
})

const formattedContent = computed(() => {
  // Simple markdown-like formatting
  return props.message.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
    .replace(/\n/g, '<br>')
})
</script>

<template>
  <div class="flex gap-3" :class="{ 'flex-row-reverse': isUser }">
    <!-- Avatar -->
    <div
      class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
      :class="isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'"
    >
      <User v-if="isUser" class="w-4 h-4" />
      <Bot v-else class="w-4 h-4" />
    </div>

    <!-- Message Content -->
    <div class="flex-1 max-w-[80%]">
      <Card
        :class="[
          'shadow-sm',
          isUser
            ? 'bg-primary text-primary-foreground ml-auto'
            : 'bg-card text-card-foreground'
        ]"
      >
        <CardContent class="p-3">
          <!-- Message Text -->
          <div
            class="text-sm leading-relaxed"
            v-html="formattedContent"
          />

          <!-- Sources (only for assistant messages) -->
          <div v-if="!isUser && message.sources && message.sources.length > 0" class="mt-3 pt-3 border-t border-border/50">
            <div class="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <FileText class="w-3 h-3" />
              参考文档:
            </div>
            <div class="space-y-1">
              <div
                v-for="(source, index) in message.sources"
                :key="index"
                class="text-xs bg-muted/50 rounded px-2 py-1 truncate"
                :title="source"
              >
                {{ source }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Timestamp -->
      <div
        class="text-xs text-muted-foreground mt-1 px-1"
        :class="{ 'text-right': isUser }"
      >
        {{ timestamp }}
      </div>
    </div>
  </div>
</template>

