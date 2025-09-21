<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import ChatView from './views/ChatView.vue'
import DocumentManager from './components/DocumentManager.vue'
import { Toaster } from './components/ui/sonner'
import { useDocumentsStore, useChatStore } from './stores'

const documentsStore = useDocumentsStore()
const chatStore = useChatStore()

onMounted(() => {
  // Load initial data
  documentsStore.fetchDocuments()
  chatStore.fetchHistory()
})

onUnmounted(() => {
  // Clean up all polling intervals when app is unmounted
  documentsStore.stopAllPolling()
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b border-border bg-card">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-foreground">Cato</h1>
          <div class="text-sm text-muted-foreground">
            基于 TypeScript + Vue 3 + LlamaIndex
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
        <!-- Document Manager Sidebar -->
        <div class="lg:col-span-1">
          <DocumentManager />
        </div>

        <!-- Chat Area -->
        <div class="lg:col-span-3">
          <ChatView />
        </div>
      </div>
    </div>

    <!-- Global Toaster for notifications -->
    <Toaster />
  </div>
</template>
