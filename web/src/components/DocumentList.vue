<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useDocumentsStore } from '@/stores'
import { Trash2, FileText, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { ref } from 'vue'

const documentsStore = useDocumentsStore()
const deleteDialog = ref(false)
const documentToDelete = ref<string | null>(null)

const statusConfig = {
  ready: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: '可用',
  },
  processing: {
    icon: Loader2,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: '处理中',
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: '错误',
  },
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

const handleDeleteClick = (docId: string) => {
  documentToDelete.value = docId
  deleteDialog.value = true
}

const confirmDelete = async () => {
  if (!documentToDelete.value) return

  try {
    await documentsStore.deleteDocument(documentToDelete.value)
    toast.success('文档删除成功')
    deleteDialog.value = false
    documentToDelete.value = null
  } catch (error) {
    toast.error('删除失败', {
      description: error instanceof Error ? error.message : '未知错误'
    })
  }
}

const cancelDelete = () => {
  deleteDialog.value = false
  documentToDelete.value = null
}

const documentToDeleteInfo = computed(() => {
  if (!documentToDelete.value) return null
  return documentsStore.documents.find(doc => doc.id === documentToDelete.value)
})
</script>

<template>
  <div class="p-4 space-y-3">
    <!-- Empty State -->
    <div v-if="documentsStore.documents.length === 0 && !documentsStore.loading"
         class="text-center py-8 text-muted-foreground">
      <FileText class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p class="text-sm">暂无文档</p>
      <p class="text-xs mt-1">点击上传按钮添加文档</p>
    </div>

    <!-- Loading State -->
    <div v-if="documentsStore.loading && documentsStore.documents.length === 0"
         class="text-center py-8">
      <Loader2 class="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
      <p class="text-sm text-muted-foreground">加载中...</p>
    </div>

    <!-- Document Items -->
    <div
      v-for="document in documentsStore.documents"
      :key="document.id"
      class="group relative border border-border rounded-lg p-3 hover:bg-muted/30 transition-colors"
    >
      <!-- Document Info -->
      <div class="space-y-2">
        <!-- Header -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-sm truncate" :title="document.name">
              {{ document.name }}
            </h4>
            <p class="text-xs text-muted-foreground">
              {{ formatFileSize(document.size) }} • {{ document.type.toUpperCase() }}
            </p>
          </div>

          <!-- Status Badge -->
          <div
            :class="[
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              statusConfig[document.status].bgColor,
              statusConfig[document.status].color
            ]"
          >
            <component
              :is="statusConfig[document.status].icon"
              class="w-3 h-3"
              :class="{ 'animate-spin': document.status === 'processing' }"
            />
            {{ statusConfig[document.status].label }}
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between">
          <div class="text-xs text-muted-foreground">
            {{ formatDate(document.uploadTime) }}
          </div>

          <!-- Actions -->
          <Button
            variant="ghost"
            size="sm"
            class="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
            @click="handleDeleteClick(document.id)"
            :disabled="documentsStore.loading"
          >
            <Trash2 class="w-3 h-3 text-destructive" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="deleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除文档</DialogTitle>
          <DialogDescription>
            您确定要删除这个文档吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>

        <div v-if="documentToDeleteInfo" class="space-y-3">
          <div class="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <FileText class="w-8 h-8 text-muted-foreground" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm truncate">{{ documentToDeleteInfo.name }}</div>
              <div class="text-xs text-muted-foreground">
                {{ formatFileSize(documentToDeleteInfo.size) }} •
                {{ formatDate(documentToDeleteInfo.uploadTime) }}
              </div>
            </div>
          </div>

          <div class="text-sm text-muted-foreground">
            <p>删除文档将会：</p>
            <ul class="list-disc list-inside space-y-1 mt-2">
              <li>移除文档的所有索引数据</li>
              <li>影响基于此文档的对话内容</li>
              <li>无法恢复已删除的文档</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="cancelDelete">
            取消
          </Button>
          <Button
            variant="destructive"
            @click="confirmDelete"
            :disabled="documentsStore.loading"
          >
            {{ documentsStore.loading ? '删除中...' : '确认删除' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>