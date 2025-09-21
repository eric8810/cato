<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import DocumentList from './DocumentList.vue'
import { Upload, FileText, AlertCircle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const documentsStore = useDocumentsStore()
const fileInput = ref<HTMLInputElement>()
const uploadDialog = ref(false)
const selectedFile = ref<File | null>(null)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]

    // Validate file type
    const allowedTypes = ['.txt', '.md']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!allowedTypes.includes(fileExtension)) {
      toast.error('文件格式不支持', {
        description: '只支持 .txt 和 .md 格式的文件'
      })
      return
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error('文件过大', {
        description: '文件大小不能超过 10MB'
      })
      return
    }

    selectedFile.value = file
    uploadDialog.value = true
  }
}

const handleUpload = async () => {
  if (!selectedFile.value) return

  try {
    await documentsStore.uploadDocument(selectedFile.value)
    toast.success('文档上传成功', {
      description: `${selectedFile.value.name} 已成功上传`
    })
    uploadDialog.value = false
    selectedFile.value = null

    // Clear file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error) {
    toast.error('上传失败', {
      description: error instanceof Error ? error.message : '未知错误'
    })
  }
}

const handleCancelUpload = () => {
  uploadDialog.value = false
  selectedFile.value = null

  // Clear file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<template>
  <Card class="h-full flex flex-col">
    <CardHeader class="flex-shrink-0">
      <div class="flex items-center justify-between">
        <CardTitle class="flex items-center gap-2">
          <FileText class="w-5 h-5" />
          文档管理
        </CardTitle>
        <Button size="sm" @click="() => fileInput?.click()">
          <Upload class="w-4 h-4 mr-2" />
          上传
        </Button>
      </div>
    </CardHeader>

    <CardContent class="flex-1 overflow-hidden p-0">
      <!-- Statistics -->
      <div class="px-4 py-2 bg-muted/30 border-b">
        <div class="grid grid-cols-3 gap-2 text-center">
          <div>
            <div class="text-lg font-semibold text-foreground">
              {{ documentsStore.totalDocuments }}
            </div>
            <div class="text-xs text-muted-foreground">总计</div>
          </div>
          <div>
            <div class="text-lg font-semibold text-green-600">
              {{ documentsStore.readyDocuments.length }}
            </div>
            <div class="text-xs text-muted-foreground">可用</div>
          </div>
          <div>
            <div class="text-lg font-semibold text-orange-600">
              {{ documentsStore.processingDocuments.length }}
            </div>
            <div class="text-xs text-muted-foreground">处理中</div>
          </div>
        </div>
      </div>

      <!-- Document List -->
      <div class="flex-1 overflow-y-auto">
        <DocumentList />
      </div>

      <!-- Error Display -->
      <div v-if="documentsStore.error" class="p-4 bg-destructive/10 border-t border-destructive/20">
        <div class="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle class="w-4 h-4" />
          {{ documentsStore.error }}
        </div>
      </div>
    </CardContent>

    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      accept=".txt,.md"
      @change="handleFileSelect"
    />

    <!-- Upload Confirmation Dialog -->
    <Dialog v-model:open="uploadDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认上传文档</DialogTitle>
          <DialogDescription>
            即将上传以下文档，系统会自动处理并建立索引。
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedFile" class="space-y-3">
          <div class="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <FileText class="w-8 h-8 text-muted-foreground" />
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm truncate">{{ selectedFile.name }}</div>
              <div class="text-xs text-muted-foreground">
                {{ formatFileSize(selectedFile.size) }}
              </div>
            </div>
          </div>

          <div class="text-sm text-muted-foreground space-y-1">
            <p>• 文档将被自动分块并向量化</p>
            <p>• 处理完成后即可在对话中引用</p>
            <p>• 支持 .txt 和 .md 格式</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="handleCancelUpload">
            取消
          </Button>
          <Button
            @click="handleUpload"
            :disabled="documentsStore.loading"
          >
            {{ documentsStore.loading ? '上传中...' : '确认上传' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Card>
</template>