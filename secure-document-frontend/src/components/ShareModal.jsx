import React, { useState, useEffect } from "react";
import documentService from "../services/documentService";
import { useToast } from "../context/ToastContext";

const ShareModal = ({ document, isOpen, onClose, onSuccess }) => {
    const [email, setEmail] = useState("");
    const [permission, setPermission] = useState("DOWNLOAD");
    const [sharing, setSharing] = useState(false);
    const [error, setError] = useState("");
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setEmail("");
            setPermission("DOWNLOAD");
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

    const handleShare = async (e) => {
        e.preventDefault();
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError("Please enter a recipient email address.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            setSharing(true);
            setError("");

            await documentService.shareDocument(document.id, trimmedEmail);

            showToast(
                `"${document.title || document.originalFileName}" shared with ${trimmedEmail}`,
                "success",
                "Document Shared"
            );

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error("Share failed:", err);
            setError(
                err.response?.data?.message ||
                "Failed to share document. Please check the email address."
            );
        } finally {
            setSharing(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-container share-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="modal-header">
                    <div className="modal-header-info">
                        <div className="modal-icon-badge share-badge">
                            ↗
                        </div>
                        <div>
                            <h2>Share Document</h2>
                            <p>Grant secure access to another user</p>
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

                <form onSubmit={handleShare} className="modal-body">
                    {/* Document Preview Card */}
                    <div className="modal-doc-preview">
                        <div className="doc-preview-icon">📄</div>
                        <div className="doc-preview-info">
                            <strong>{document.title || document.originalFileName}</strong>
                            <small>{document.originalFileName} • AES Encrypted</small>
                        </div>
                    </div>

                    {error && (
                        <div className="modal-alert error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="modal-form-group">
                        <label htmlFor="share-email">
                            Recipient Email Address <span className="required-star">*</span>
                        </label>
                        <input
                            id="share-email"
                            type="email"
                            className="modal-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="colleague@example.com"
                            autoFocus
                            required
                        />
                    </div>

                    {/* Permission Selector */}
                    <div className="modal-form-group">
                        <label>Access Permission</label>
                        <div className="permission-selector">
                            <label className={`permission-card ${permission === "DOWNLOAD" ? "active" : ""}`}>
                                <input
                                    type="radio"
                                    name="permission"
                                    value="DOWNLOAD"
                                    checked={permission === "DOWNLOAD"}
                                    onChange={(e) => setPermission(e.target.value)}
                                />
                                <div className="perm-icon">↓</div>
                                <div className="perm-info">
                                    <strong>Download & View</strong>
                                    <small>Can view metadata and download decrypted file</small>
                                </div>
                            </label>

                            <label className={`permission-card ${permission === "VIEW" ? "active" : ""}`}>
                                <input
                                    type="radio"
                                    name="permission"
                                    value="VIEW"
                                    checked={permission === "VIEW"}
                                    onChange={(e) => setPermission(e.target.value)}
                                />
                                <div className="perm-icon">👁</div>
                                <div className="perm-info">
                                    <strong>View Only</strong>
                                    <small>Can view document details in shared list</small>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="modal-security-note">
                        <span>🔒</span>
                        <p>Recipient must have an account on this system to access the shared file.</p>
                    </div>

                    {/* Actions */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="secondary-button modal-cancel-btn"
                            onClick={onClose}
                            disabled={sharing}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button modal-submit-btn"
                            disabled={sharing || !email.trim()}
                        >
                            {sharing ? (
                                <>
                                    <span className="saving-spinner"></span>
                                    <span>Sharing...</span>
                                </>
                            ) : (
                                <>
                                    <span>↗</span>
                                    <span>Share Document</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShareModal;
