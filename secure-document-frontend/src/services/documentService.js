import api from "./api";

const documentService = {

    // Upload document
    uploadDocument: async (file, title, description) => {

        const formData = new FormData();

        formData.append("file", file);
        formData.append("title", title);
        formData.append("description", description);

        const response = await api.post(
            "/documents/upload",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    },


    // Get logged-in user's documents
    getMyDocuments: async (
        page = 0,
        size = 10,
        sortBy = "uploadedAt"
    ) => {

        const response = await api.get(
            "/documents",
            {
                params: {
                    page,
                    size,
                    sortBy,
                },
            }
        );

        return response.data;
    },


    // Search documents
    searchDocuments: async (
        keyword,
        page = 0,
        size = 10,
        sortBy = "uploadedAt"
    ) => {

        const response = await api.get(
            "/documents/search",
            {
                params: {
                    keyword,
                    page,
                    size,
                    sortBy,
                },
            }
        );

        return response.data;
    },


    // Documents shared with logged-in user
    getSharedWithMe: async (
        page = 0,
        size = 10,
        sortBy = "sharedAt"
    ) => {

        const response = await api.get(
            "/documents/shared-with-me",
            {
                params: {
                    page,
                    size,
                    sortBy,
                },
            }
        );

        return response.data;
    },


    // Documents shared by current user
    getSharedDocuments: async (
        page = 0,
        size = 10,
        sortBy = "sharedAt"
    ) => {

        const response = await api.get(
            "/documents/shared",
            {
                params: {
                    page,
                    size,
                    sortBy,
                },
            }
        );

        return response.data;
    },


    // Get single document
    getDocument: async (id) => {

        const response = await api.get(
            `/documents/${id}`
        );

        return response.data;
    },


    // Download own document
    downloadDocument: async (id) => {

        const response = await api.get(
            `/documents/download/${id}`,
            {
                responseType: "blob",
            }
        );

        return response;
    },


    // Download shared document
    downloadSharedDocument: async (id) => {

        const response = await api.get(
            `/documents/shared/download/${id}`,
            {
                responseType: "blob",
            }
        );

        return response;
    },


    // Update document
    updateDocument: async (id, documentData) => {

        const response = await api.put(
            `/documents/${id}`,
            documentData
        );

        return response.data;
    },


    // Share document
    shareDocument: async (documentId, email) => {

        const response = await api.post(
            "/documents/share",
            {
                documentId,
                email,
            }
        );

        return response.data;
    },


    // Delete document
    deleteDocument: async (id) => {

        const response = await api.delete(
            `/documents/${id}`
        );

        return response.data;
    },


    // Convert uploaded file on-the-fly
    convertUploadedFile: async (file, targetFormat) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("targetFormat", targetFormat);

        const response = await api.post(
            "/documents/convert",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                responseType: "blob",
            }
        );

        return response;
    },


    // Convert stored encrypted document by ID
    convertStoredDocument: async (id, targetFormat, saveToVault = false) => {
        const response = await api.post(
            `/documents/${id}/convert`,
            null,
            {
                params: {
                    targetFormat,
                    saveToVault,
                },
                responseType: "blob",
            }
        );

        return response;
    },
};


export default documentService;