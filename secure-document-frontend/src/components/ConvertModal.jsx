import React, { useState, useEffect } from "react";
import documentService from "../services/documentService";
import { useToast } from "../context/ToastContext";

const ConvertModal = ({ document, isOpen, onClose, onSuccess }) => {
    const [targetFormat, setTargetFormat] = useState("docx");
    const [saveToVault, setSaveToVault] = useState(false);
    const [converting, setConverting] = useState(false);
    const [error, setError] = useState("");
    const { showToast } = useToast();

    const fileName = document?.originalFileName || document?.fileName || "";
    const sourceExt = fileName.includes(".")
        ? fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase()
        : "";

    // Determine available conversion targets based on source extension
    const getAvailableFormats = () => {
        if (sourceExt === "pdf") {
            return [
                { id: "docx", label: "Word Document", ext: ".docx", icon: "📝", desc: "Convert to editable Microsoft Word document" },
                { id: "html", label: "HTML & CSS", ext: ".html", icon: "🌐", desc: "Convert to styled webpage format" },
                { id: "txt", label: "Plain Text", ext: ".txt", icon: "📄", desc: "Extract clean plain text content" },
            ];
        } else if (sourceExt === "docx" || sourceExt === "doc") {
            return [
                { id: "pdf", label: "PDF Document", ext: ".pdf", icon: "📕", desc: "Convert to secure portable PDF document" },
                { id: "html", label: "HTML & CSS", ext: ".html", icon: "🌐", desc: "Convert Word styling into styled HTML" },
                { id: "txt", label: "Plain Text", ext: ".txt", icon: "📄", desc: "Extract text paragraphs and headings" },
            ];
        } else if (["png", "jpg", "jpeg", "webp"].includes(sourceExt)) {
            return [
                { id: "pdf", label: "PDF Document", ext: ".pdf", icon: "📕", desc: "Embed and fit image onto standard A4 PDF" },
            ];
        } else {
            // Default text/generic options
            return [
                { id: "pdf", label: "PDF Document", ext: ".pdf", icon: "📕", desc: "Format text into clean paginated PDF" },
                { id: "docx", label: "Word Document", ext: ".docx", icon: "📝", desc: "Convert text into editable Word doc" },
                { id: "html", label: "HTML & CSS", ext: ".html", icon: "🌐", desc: "Wrap text in styled modern HTML" },
            ];
        }
    };

    const availableFormats = getAvailableFormats();

    useEffect(() => {
        if (isOpen && availableFormats.length > 0) {
            setTargetFormat(availableFormats[0].id);
            setSaveToVault(false);
            setError("");
        }
    }, [isOpen, sourceExt]);

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

    const handleConvert = async (e) => {
        e.preventDefault();

        try {
            setConverting(true);
            setError("");

            const response = await documentService.convertStoredDocument(
                document.id,
                targetFormat,
                saveToVault
            );

            // Trigger browser download of converted file
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = window.document.createElement("a");
            link.href = url;

            const baseName = fileName.lastIndexOf(".") > 0
                ? fileName.substring(0, fileName.lastIndexOf("."))
                : fileName;
            link.download = `${baseName}_converted.${targetFormat}`;

            window.document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showToast(
                `Converted to ${targetFormat.toUpperCase()}${saveToVault ? " & saved to vault" : ""}!`,
                "success",
                "Conversion Complete"
            );

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error("Conversion failed:", err);
            setError(
                err.response?.data?.message ||
                "Conversion failed. Please try a different target format."
            );
        } finally {
            setConverting(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-container convert-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="modal-header convert-header">
                    <div className="modal-header-info">
                        <div className="modal-icon-badge convert-badge">
                            🔄
                        </div>
                        <div>
                            <h2>Convert Document</h2>
                            <p>Transform file format with instant conversion</p>
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

                <form onSubmit={handleConvert} className="modal-body">
                    {/* Document Source Preview */}
                    <div className="modal-doc-preview">
                        <div className="doc-preview-icon">📄</div>
                        <div className="doc-preview-info">
                            <strong>{document.title || fileName}</strong>
                            <small>Source Format: <span className="format-tag">{sourceExt.toUpperCase() || "FILE"}</span> • AES Encrypted</small>
                        </div>
                    </div>

                    {error && (
                        <div className="modal-alert error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* Target Format Options */}
                    <div className="modal-form-group">
                        <label>Select Target Format</label>
                        <div className="format-options-grid">
                            {availableFormats.map((fmt) => (
                                <label
                                    key={fmt.id}
                                    className={`format-card ${targetFormat === fmt.id ? "active" : ""}`}
                                >
                                    <input
                                        type="radio"
                                        name="targetFormat"
                                        value={fmt.id}
                                        checked={targetFormat === fmt.id}
                                        onChange={(e) => setTargetFormat(e.target.value)}
                                    />
                                    <span className="fmt-card-icon">{fmt.icon}</span>
                                    <div className="fmt-card-text">
                                        <strong>{fmt.label}</strong>
                                        <small>{fmt.desc}</small>
                                    </div>
                                    <span className="fmt-ext-badge">{fmt.ext}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Save to Vault Option */}
                    <div className="vault-save-option">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={saveToVault}
                                onChange={(e) => setSaveToVault(e.target.checked)}
                            />
                            <span>
                                <strong>Save converted copy to My Documents</strong>
                                <small>Also encrypt and add as a new file in your personal vault</small>
                            </span>
                        </label>
                    </div>

                    {/* Conversion Progress Bar (when active) */}
                    {converting && (
                        <div className="converting-indicator">
                            <div className="converting-bar-track">
                                <div className="converting-bar-fill"></div>
                            </div>
                            <span>Processing document conversion securely...</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="secondary-button modal-cancel-btn"
                            onClick={onClose}
                            disabled={converting}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button modal-submit-btn convert-action-btn"
                            disabled={converting}
                        >
                            {converting ? (
                                <>
                                    <span className="saving-spinner"></span>
                                    <span>Converting...</span>
                                </>
                            ) : (
                                <>
                                    <span>⚡</span>
                                    <span>Convert & Download</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConvertModal;
