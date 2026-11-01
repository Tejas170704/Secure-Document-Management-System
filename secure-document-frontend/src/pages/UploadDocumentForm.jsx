import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import documentService from "../services/documentService";
import { useToast } from "../context/ToastContext";

function UploadDocumentForm() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const fileInputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState("");

    const handleFileSelect = (selectedFile) => {
        if (!selectedFile) return;
        setFile(selectedFile);
        setError("");

        if (!title) {
            const fileName = selectedFile.name;
            const lastDot = fileName.lastIndexOf(".");
            const fileTitle = lastDot > 0 ? fileName.substring(0, lastDot) : fileName;
            setTitle(fileTitle);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        setError("");

        if (!file) {
            setError("Please select a document to upload.");
            return;
        }

        if (!title.trim()) {
            setError("Please enter a document title.");
            return;
        }

        try {
            setUploading(true);

            const response = await documentService.uploadDocument(
                file,
                title.trim(),
                description.trim()
            );

            showToast(
                response.message || `Encrypted & uploaded "${title}" successfully!`,
                "success",
                "Upload Complete"
            );

            setFile(null);
            setTitle("");
            setDescription("");
            if (fileInputRef.current) fileInputRef.current.value = "";

            // Navigate to documents list
            navigate("/documents");

        } catch (err) {
            console.error("Upload error:", err);
            const errMsg = err.response?.data?.message || "Unable to upload document.";
            setError(errMsg);
            showToast(errMsg, "error", "Upload Failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <main className="dashboard-container">
            <div className="documents-header">
                <div>
                    <p className="page-eyebrow">
                        ⚡ SECURE VAULT
                    </p>
                    <h1>
                        Upload Document
                    </h1>
                    <p className="page-description">
                        Encrypt and protect your files with zero-knowledge AES encryption.
                    </p>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    <span>⚠️</span> {error}
                </div>
            )}

            <section className="dashboard-section-modern upload-section-card">
                <form onSubmit={handleUpload} className="modern-upload-form">
                    {/* Drag & Drop Area */}
                    <div
                        className={`converter-dropzone ${dragActive ? "drag-active" : ""} ${file ? "has-file" : ""}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            id="document-file"
                            type="file"
                            className="hidden-file-input"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    handleFileSelect(e.target.files[0]);
                                }
                            }}
                        />

                        {file ? (
                            <div className="selected-file-display">
                                <div className="selected-file-icon">📄</div>
                                <div className="selected-file-details">
                                    <h3>{file.name}</h3>
                                    <p>{(file.size / 1024).toFixed(1)} KB • Ready for AES encryption</p>
                                </div>
                                <button
                                    type="button"
                                    className="change-file-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                >
                                    Change File
                                </button>
                            </div>
                        ) : (
                            <div className="dropzone-empty-content">
                                <div className="dropzone-animated-icon animated-bounce">⬆️</div>
                                <h3>Choose a file or drag it here</h3>
                                <p>PDF, DOCX, TXT, Images & more — automatically encrypted</p>
                                <span className="browse-files-button">
                                    Browse Files
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Metadata Fields */}
                    <div className="form-fields-grid">
                        <div className="form-group">
                            <label htmlFor="document-title">
                                <span>📌</span> Document Title <span className="required-star">*</span>
                            </label>
                            <input
                                id="document-title"
                                type="text"
                                className="edit-input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Financial Report Q3 2026"
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="document-description">
                                <span>📝</span> Description (Optional)
                            </label>
                            <textarea
                                id="document-description"
                                className="edit-textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add notes, tags, or metadata for this encrypted document..."
                                maxLength={1000}
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="upload-form-footer">
                        <div className="encryption-guarantee">
                            <span>🔒</span>
                            <small>AES-256 in-memory encryption before saving to disk</small>
                        </div>

                        <div className="upload-btn-group">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => navigate("/documents")}
                                disabled={uploading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="primary-button upload-submit-btn"
                                disabled={uploading || !file}
                            >
                                {uploading ? (
                                    <>
                                        <span className="saving-spinner"></span>
                                        <span>Encrypting & Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🔒</span>
                                        <span>Encrypt & Save to Vault</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </main>
    );
}

export default UploadDocumentForm;