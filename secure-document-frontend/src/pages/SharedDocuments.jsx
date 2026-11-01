import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import DocumentTable from "../components/DocumentTable";
import ConvertModal from "../components/ConvertModal";
import documentService from "../services/documentService";
import { useToast } from "../context/ToastContext";

const SharedDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDocForConvert, setSelectedDocForConvert] = useState(null);
  const { showToast } = useToast();

  const loadSharedDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await documentService.getSharedWithMe();
      setDocuments(data?.content || data || []);
    } catch (err) {
      console.error("Failed to load shared documents:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load shared documents."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSharedDocuments();
  }, []);

  const handleDownload = async (doc) => {
    try {
      const response =
        await documentService.downloadSharedDocument(doc.id);

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = doc.fileName || doc.originalFileName || doc.title || "document";

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast(`Decrypted and downloaded "${link.download}"`, "success", "Download Complete");
    } catch (err) {
      console.error("Download failed:", err);
      showToast(
        err.response?.data?.message || "Failed to download shared document.",
        "error",
        "Download Failed"
      );
    }
  };

  return (
    <div className="app-shell">
      <Navbar />

      <div className="documents-page">
        <div className="documents-header">
          <div>
            <span className="page-eyebrow">COLLABORATION</span>
            <h1>Shared With Me</h1>
            <p>Documents shared with you by other users with secure AES decryption.</p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={loadSharedDocuments}
          >
            ↻ Refresh
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <DocumentTable
          documents={documents}
          loading={loading}
          onDownload={handleDownload}
          onConvert={(doc) => setSelectedDocForConvert(doc)}
          showActions={true}
        />

        {selectedDocForConvert && (
          <ConvertModal
            document={selectedDocForConvert}
            isOpen={!!selectedDocForConvert}
            onClose={() => setSelectedDocForConvert(null)}
          />
        )}
      </div>
    </div>
  );
};

export default SharedDocuments;