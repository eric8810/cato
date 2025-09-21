import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Document } from '@/types';
import { documentApi } from '@/services/api';

export const useDocumentsStore = defineStore('documents', () => {
  // State
  const documents = ref<Document[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pollingIntervals = ref<Map<string, number>>(new Map());

  // Actions
  const fetchDocuments = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await documentApi.list();
      documents.value = response.documents;

      // Start polling for any documents that are still processing
      documents.value.forEach(doc => {
        if (doc.status === 'processing') {
          startPolling(doc.id);
        }
      });
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch documents';
      console.error('Error fetching documents:', err);
    } finally {
      loading.value = false;
    }
  };

  const uploadDocument = async (file: File) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await documentApi.upload(file);
      documents.value.push(response.document);

      // Start polling if the document is in processing state
      if (response.document.status === 'processing') {
        startPolling(response.document.id);
      }

      return response;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to upload document';
      console.error('Error uploading document:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteDocument = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      // Stop polling if it exists
      stopPolling(id);

      await documentApi.delete(id);
      documents.value = documents.value.filter(doc => doc.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete document';
      console.error('Error deleting document:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const pollDocumentStatus = async (documentId: string) => {
    try {
      const statusResponse = await documentApi.getStatus(documentId);

      // Update document status in the local store
      const docIndex = documents.value.findIndex(doc => doc.id === documentId);
      if (docIndex !== -1) {
        documents.value[docIndex].status = statusResponse.status;
      }

      // If processing is complete, stop polling
      if (statusResponse.status === 'ready' || statusResponse.status === 'error') {
        stopPolling(documentId);
        return true; // Polling complete
      }

      return false; // Continue polling
    } catch (err) {
      console.error('Error polling document status:', err);
      stopPolling(documentId);
      return true; // Stop polling on error
    }
  };

  const startPolling = (documentId: string, intervalMs: number = 2000) => {
    // Don't start if already polling
    if (pollingIntervals.value.has(documentId)) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      const shouldStop = await pollDocumentStatus(documentId);
      if (shouldStop) {
        stopPolling(documentId);
      }
    }, intervalMs);

    pollingIntervals.value.set(documentId, intervalId);
  };

  const stopPolling = (documentId: string) => {
    const intervalId = pollingIntervals.value.get(documentId);
    if (intervalId) {
      clearInterval(intervalId);
      pollingIntervals.value.delete(documentId);
    }
  };

  const stopAllPolling = () => {
    pollingIntervals.value.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    pollingIntervals.value.clear();
  };

  // Getters
  const totalDocuments = computed(() => documents.value.length);
  const readyDocuments = computed(() =>
    documents.value.filter(doc => doc.status === 'ready')
  );
  const processingDocuments = computed(() =>
    documents.value.filter(doc => doc.status === 'processing')
  );

  return {
    // State
    documents,
    loading,
    error,

    // Actions
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    startPolling,
    stopPolling,
    stopAllPolling,

    // Getters
    totalDocuments,
    readyDocuments,
    processingDocuments,
  };
});