import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import documentService from "../services/documentService";
import { useToast } from "../context/ToastContext";
import ShareModal from "../components/ShareModal";
import DeleteModal from "../components/DeleteModal";
import ConvertModal from "../components/ConvertModal";

const DocumentDetails = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [downloading, setDownloading] = useState(false);

    // =========================================================
    // EDIT STATE
    // =========================================================
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [editError, setEditError] = useState("");

    // =========================================================
    // MODAL STATES
    // =========================================================
    const [showShareModal, setShowShareModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState(false);


    useEffect(() => {
        loadDocument();
    }, [id]);


    const loadDocument = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await documentService.getDocument(id);

            setDocument(data);

        } catch (err) {

            console.error(
                "Failed to load document:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load document details."
            );

        } finally {

            setLoading(false);

        }
    };


    const handleDownload = async () => {

        try {

            setDownloading(true);

            const response =
                await documentService.downloadDocument(id);

            const blob =
                new Blob([response.data]);

            const url =
                window.URL.createObjectURL(blob);

            const link =
                window.document.createElement("a");

            link.href = url;

            link.download =
                document.originalFileName ||
                document.fileName ||
                document.title ||
                "document";

            window.document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

            showToast(
                `Decrypted and downloaded "${link.download}"`,
                "success",
                "Download Ready"
            );

        } catch (err) {

            console.error(
                "Download failed:",
                err
            );

            showToast(
                err.response?.data?.message || "Failed to download document.",
                "error",
                "Download Failed"
            );

        } finally {

            setDownloading(false);

        }
    };


    // =========================================================
    // EDIT HANDLERS
    // =========================================================

    const handleStartEdit = () => {
        if (!document) return;
        setEditTitle(document.title || "");
        setEditDescription(document.description || "");
        setEditError("");
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditError("");
        if (document) {
            setEditTitle(document.title || "");
            setEditDescription(document.description || "");
        }
    };

    const handleSaveEdit = async (e) => {
        if (e) e.preventDefault();

        const trimmedTitle = editTitle.trim();
        if (!trimmedTitle) {
            setEditError("Title is required.");
            return;
        }

        if (trimmedTitle.length > 100) {
            setEditError("Title cannot exceed 100 characters.");
            return;
        }

        if (editDescription.length > 1000) {
            setEditError("Description cannot exceed 1000 characters.");
            return;
        }

        try {
            setSaving(true);
            setEditError("");

            const updatedDoc = await documentService.updateDocument(id, {
                title: trimmedTitle,
                description: editDescription.trim(),
            });

            // Update local state immediately
            setDocument(prev => ({
                ...prev,
                title: updatedDoc?.title || trimmedTitle,
                description: updatedDoc?.description !== undefined
                    ? updatedDoc.description
                    : editDescription.trim(),
            }));

            showToast(
                "Document title and metadata updated successfully!",
                "success",
                "Changes Saved"
            );

            setIsEditing(false);

        } catch (err) {
            console.error("Failed to update document:", err);
            setEditError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Failed to update document. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };


    if (loading) {

        return (

            <div className="document-details-page">

                <div className="details-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading document details...
                    </p>

                </div>

            </div>
        );
    }


    if (error) {

        return (

            <div className="document-details-page">

                <div className="details-error">

                    <div className="error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to load document
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate("/documents")
                        }
                    >
                        ← Back to My Documents
                    </button>

                </div>

            </div>
        );
    }


    if (!document) {

        return (

            <div className="document-details-page">

                <div className="details-error">

                    <div className="error-icon">
                        📄
                    </div>

                    <h2>
                        Document not found
                    </h2>

                    <p>
                        The document you are looking for
                        does not exist or is no longer available.
                    </p>

                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate("/documents")
                        }
                    >
                        ← Back to My Documents
                    </button>

                </div>

            </div>
        );
    }


    const fileName =
        document.originalFileName ||
        document.fileName ||
        "Document";

    const title =
        document.title ||
        fileName;

    const description =
        document.description ||
        "No description provided.";

    const uploadedAt =
        document.uploadedAt
            ? new Date(
                document.uploadedAt
            ).toLocaleString()
            : "Not available";


    return (

        <main className="document-details-page">

            {/* =====================================================
                TOP NAVIGATION
            ===================================================== */}

            <div className="details-topbar">

                <button
                    className="back-button"
                    onClick={() =>
                        navigate("/documents")
                    }
                >
                    <span>
                        ←
                    </span>

                    Back to My Documents

                </button>

                <div className="topbar-actions">
                    <button
                        type="button"
                        className="secondary-button topbar-convert-btn"
                        onClick={() => setShowConvertModal(true)}
                    >
                        <span>🔄</span> Convert
                    </button>

                    <button
                        type="button"
                        className="secondary-button topbar-share-btn"
                        onClick={() => setShowShareModal(true)}
                    >
                        <span>↗</span> Share
                    </button>

                    {!isEditing && (
                        <button
                            type="button"
                            className="secondary-button topbar-edit-btn"
                            onClick={handleStartEdit}
                        >
                            <span>✏️</span> Edit Details
                        </button>
                    )}
                </div>

            </div>


            {/* =====================================================
                DOCUMENT HERO
            ===================================================== */}

            <section className="document-hero">

                <div className="document-hero-left">

                    <div className="document-large-icon">
                        📄
                    </div>


                    <div className="document-hero-info">

                        <span className="details-eyebrow">
                            DOCUMENT DETAILS
                        </span>

                        <h1>
                            {title}
                        </h1>

                        <p>
                            {fileName}
                        </p>

                    </div>

                </div>


                <div className="document-security-badge animated-shield">

                    <span>
                        🔒
                    </span>

                    <div>

                        <strong>
                            AES Encrypted
                        </strong>

                        <small>
                            Securely protected
                        </small>

                    </div>

                </div>

            </section>


            {/* =====================================================
                MAIN CONTENT
            ===================================================== */}

            <div className="details-grid">


                {/* =================================================
                    DOCUMENT INFORMATION / EDIT FORM
                ================================================= */}

                <section className="details-card">

                    <div className="details-card-header">

                        <div className="details-card-header-main">
                            <div className="details-card-icon">
                                📋
                            </div>

                            <div>

                                <h2>
                                    Document Information
                                </h2>

                                <p>
                                    {isEditing
                                        ? "Modify title and description metadata"
                                        : "Basic information about this document"}
                                </p>

                            </div>
                        </div>

                        {!isEditing && (
                            <button
                                type="button"
                                className="edit-toggle-button"
                                onClick={handleStartEdit}
                                title="Edit Document Details"
                            >
                                <span>✏️</span> Edit
                            </button>
                        )}

                    </div>


                    {isEditing ? (

                        /* =========================================
                           EDIT MODE FORM
                        ========================================= */

                        <form
                            className="edit-document-form"
                            onSubmit={handleSaveEdit}
                        >

                            {editError && (
                                <div className="edit-form-alert error">
                                    <span>⚠️</span> {editError}
                                </div>
                            )}

                            <div className="edit-form-group">

                                <div className="edit-label-row">
                                    <label htmlFor="edit-title">
                                        <span>📌</span> Document Title <span className="required-star">*</span>
                                    </label>
                                    <span className="edit-char-counter">
                                        {editTitle.length}/100
                                    </span>
                                </div>

                                <input
                                    id="edit-title"
                                    type="text"
                                    className="edit-input"
                                    value={editTitle}
                                    onChange={(e) =>
                                        setEditTitle(e.target.value)
                                    }
                                    placeholder="Enter document title"
                                    maxLength={100}
                                    required
                                    autoFocus
                                />

                            </div>


                            <div className="edit-form-group">

                                <div className="edit-label-row">
                                    <label>
                                        <span>📄</span> Original File
                                    </label>
                                    <span className="readonly-pill">
                                        Read-only
                                    </span>
                                </div>

                                <div className="readonly-file-display">
                                    {fileName}
                                </div>

                            </div>


                            <div className="edit-form-group">

                                <div className="edit-label-row">
                                    <label htmlFor="edit-description">
                                        <span>📝</span> Description
                                    </label>
                                    <span className="edit-char-counter">
                                        {editDescription.length}/1000
                                    </span>
                                </div>

                                <textarea
                                    id="edit-description"
                                    className="edit-textarea"
                                    value={editDescription}
                                    onChange={(e) =>
                                        setEditDescription(e.target.value)
                                    }
                                    placeholder="Add notes, summaries, or metadata for this document..."
                                    maxLength={1000}
                                    rows={4}
                                />

                            </div>


                            <div className="edit-form-actions">

                                <button
                                    type="button"
                                    className="secondary-button cancel-edit-btn"
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button save-edit-btn"
                                    disabled={saving || !editTitle.trim()}
                                >
                                    {saving ? (
                                        <>
                                            <span className="saving-spinner"></span>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>💾</span>
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>

                            </div>

                        </form>

                    ) : (

                        /* =========================================
                           VIEW MODE LIST
                        ========================================= */

                        <div className="details-info-list">


                            <div className="details-info-item">

                                <div className="info-label">
                                    <span>
                                        📌
                                    </span>

                                    Title
                                </div>

                                <div className="info-value">
                                    {title}
                                </div>

                            </div>


                            <div className="details-info-item">

                                <div className="info-label">
                                    <span>
                                        📄
                                    </span>

                                    File Name
                                </div>

                                <div className="info-value file-name">
                                    {fileName}
                                </div>

                            </div>


                            <div className="details-info-item">

                                <div className="info-label">
                                    <span>
                                        📝
                                    </span>

                                    Description
                                </div>

                                <div className="info-value description-value">
                                    {description}
                                </div>

                            </div>


                            <div className="details-info-item">

                                <div className="info-label">
                                    <span>
                                        🕒
                                    </span>

                                    Uploaded
                                </div>

                                <div className="info-value">
                                    {uploadedAt}
                                </div>

                            </div>

                        </div>

                    )}

                </section>


                {/* =================================================
                    SECURITY CARD
                ================================================= */}

                <section className="details-card security-card">

                    <div className="details-card-header">

                        <div className="details-card-header-main">
                            <div className="security-card-icon">
                                🛡️
                            </div>

                            <div>

                                <h2>
                                    Security & Protection
                                </h2>

                                <p>
                                    Enterprise-grade security controls
                                </p>

                            </div>
                        </div>

                    </div>


                    <div className="security-list">


                        <div className="security-item">

                            <div className="security-item-icon">
                                🔐
                            </div>

                            <div>

                                <strong>
                                    AES-256 Encryption
                                </strong>

                                <span>
                                    Payload encrypted before disk write.
                                </span>

                            </div>

                            <div className="security-check">
                                ✓
                            </div>

                        </div>


                        <div className="security-item">

                            <div className="security-item-icon">
                                🔑
                            </div>

                            <div>

                                <strong>
                                    JWT Authentication
                                </strong>

                                <span>
                                    Session secured with signed tokens.
                                </span>

                            </div>

                            <div className="security-check">
                                ✓
                            </div>

                        </div>


                        <div className="security-item">

                            <div className="security-item-icon">
                                🛡️
                            </div>

                            <div>

                                <strong>
                                    Role-Based Access
                                </strong>

                                <span>
                                    Restricted to owner and shared peers.
                                </span>

                            </div>

                            <div className="security-check">
                                ✓
                            </div>

                        </div>

                    </div>

                </section>

            </div>


            {/* =====================================================
                ACTION BAR
            ===================================================== */}

            <section className="document-action-card">

                <div>

                    <div className="action-title">
                        Document Actions & Tools
                    </div>

                    <div className="action-description">
                        Convert formats, download decrypted copy, share, or edit metadata.
                    </div>

                </div>


                <div className="action-card-buttons">

                    {/* Convert Button */}
                    <button
                        type="button"
                        className="secondary-action-button convert-btn"
                        onClick={() => setShowConvertModal(true)}
                    >
                        <span className="action-btn-icon">
                            🔄
                        </span>
                        <span>
                            Convert Format
                        </span>
                    </button>

                    {/* Share Button */}
                    <button
                        type="button"
                        className="secondary-action-button"
                        onClick={() => setShowShareModal(true)}
                    >
                        <span className="action-btn-icon">
                            ↗
                        </span>
                        <span>
                            Share
                        </span>
                    </button>

                    {/* Edit Details */}
                    {!isEditing && (
                        <button
                            type="button"
                            className="secondary-action-button"
                            onClick={handleStartEdit}
                        >
                            <span className="action-btn-icon">
                                ✏️
                            </span>
                            <span>
                                Edit
                            </span>
                        </button>
                    )}

                    {/* Delete Button */}
                    <button
                        type="button"
                        className="secondary-action-button delete-action-btn"
                        onClick={() => setShowDeleteModal(true)}
                    >
                        <span className="action-btn-icon">
                            🗑️
                        </span>
                        <span>
                            Delete
                        </span>
                    </button>

                    {/* Download Securely */}
                    <button
                        type="button"
                        className="download-document-button"
                        onClick={handleDownload}
                        disabled={downloading}
                    >

                        <span className="download-icon">
                            {downloading
                                ? "⏳"
                                : "↓"}
                        </span>

                        <span>
                            {downloading
                                ? "Preparing..."
                                : "Download Decrypted"}
                        </span>

                    </button>

                </div>

            </section>


            {/* =====================================================
                SECURITY FOOTER
            ===================================================== */}

            <div className="details-security-footer">

                <span>
                    🛡️
                </span>

                <p>
                    Your document is protected by
                    <strong> AES encryption</strong>,
                    JWT authentication and
                    role-based access control.
                </p>

            </div>


            {/* =====================================================
                MODALS
            ===================================================== */}

            {showShareModal && (
                <ShareModal
                    document={document}
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                />
            )}

            {showDeleteModal && (
                <DeleteModal
                    document={document}
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onSuccess={() => navigate("/documents")}
                />
            )}

            {showConvertModal && (
                <ConvertModal
                    document={document}
                    isOpen={showConvertModal}
                    onClose={() => setShowConvertModal(false)}
                />
            )}

        </main>
    );
};

export default DocumentDetails;