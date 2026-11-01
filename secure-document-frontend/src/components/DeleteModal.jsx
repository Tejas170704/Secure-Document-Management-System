import React, { useEffect, useState } from "react";
import documentService from "../services/documentService";
import { useToast } from "../context/ToastContext";

const DeleteModal = ({ document, isOpen, onClose, onSuccess }) => {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setError("");
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !document) return null;

    const handleDelete = async () => {
        try {
            setDeleting(true);
            setError("");

            await documentService.deleteDocument(document.id);

            showToast(
                `"${document.title || document.originalFileName}" was permanently deleted.`,
                "success",
                "Document Deleted"
            );

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error("Delete failed:", err);
            setError(
                err.response?.data?.message ||
                "Failed to delete document. Please try again."
            );
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-container delete-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="modal-header delete-header">
                    <div className="modal-header-info">
                        <div className="modal-icon-badge danger-badge">
                            🗑️
                        </div>
                        <div>
                            <h2>Delete Document</h2>
                            <p>This action cannot be undone</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="modal-close-button"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    <p className="delete-warning-text">
                        Are you sure you want to permanently delete this document and all associated encrypted storage?
                    </p>

                    {/* Document Preview Card */}
                    <div className="modal-doc-preview delete-preview">
                        <div className="doc-preview-icon">📄</div>
                        <div className="doc-preview-info">
                            <strong>{document.title || document.originalFileName}</strong>
                            <small>{document.originalFileName} • {document.fileSize ? `${(document.fileSize / 1024).toFixed(1)} KB` : ""}</small>
                        </div>
                    </div>

                    {error && (
                        <div className="modal-alert error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="secondary-button modal-cancel-btn"
                            onClick={onClose}
                            disabled={deleting}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="danger-button modal-delete-btn"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? (
                                <>
                                    <span className="saving-spinner"></span>
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                <>
                                    <span>🗑️</span>
                                    <span>Yes, Delete Permanently</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
