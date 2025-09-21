import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Document } from '@/types';
import { documentApi } from '@/services/api';

export const useDocumentsStore = defineStore('documents', () => {
  // State
  const documents = ref<Document[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  const fetchDocuments = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await documentApi.list();
      documents.value = response.documents;
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

    // Getters
    totalDocuments,
    readyDocuments,
    processingDocuments,
  };
});