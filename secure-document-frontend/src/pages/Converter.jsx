import React, { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import documentService from "../services/documentService";
import { useToast } from "../context/ToastContext";

const Converter = () => {
    const [file, setFile] = useState(null);
    const [targetFormat, setTargetFormat] = useState("docx");
    const [converting, setConverting] = useState(false);
    const [convertedResult, setConvertedResult] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);
    const { showToast } = useToast();

    const presets = [
        { title: "PDF to Word", from: "pdf", to: "docx", icon: "📝", desc: "Extract text and tables into editable .docx" },
        { title: "Word to PDF", from: "docx", to: "pdf", icon: "📕", desc: "Compile Word documents into secure PDF" },
        { title: "Word to HTML/CSS", from: "docx", to: "html", icon: "🌐", desc: "Convert styled DOCX into modern HTML & CSS" },
        { title: "PDF to HTML/CSS", from: "pdf", to: "html", icon: "🌐", desc: "Extract formatted layout to HTML webpage" },
        { title: "Text to PDF", from: "txt", to: "pdf", icon: "📄", desc: "Turn raw text or markdown into paginated PDF" },
        { title: "Image to PDF", from: "png", to: "pdf", icon: "🖼️", desc: "Fit PNG, JPG, WEBP images into clean PDF" },
    ];

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

    const handleFileSelect = (selectedFile) => {
        setFile(selectedFile);
        setError("");
        setConvertedResult(null);

        // Auto-select sensible target format
        const name = selectedFile.name.toLowerCase();
        if (name.endsWith(".pdf")) {
            setTargetFormat("docx");
        } else if (name.endsWith(".docx") || name.endsWith(".doc")) {
            setTargetFormat("pdf");
        } else if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".webp")) {
            setTargetFormat("pdf");
        } else if (name.endsWith(".txt") || name.endsWith(".md")) {
            setTargetFormat("pdf");
        }
    };

    const getAvailableFormats = () => {
        if (!file) {
            return [
                { id: "docx", label: "Word (.docx)", icon: "📝" },
                { id: "pdf", label: "PDF Document (.pdf)", icon: "📕" },
                { id: "html", label: "HTML & CSS (.html)", icon: "🌐" },
                { id: "txt", label: "Plain Text (.txt)", icon: "📄" },
            ];
        }

        const name = file.name.toLowerCase();
        if (name.endsWith(".pdf")) {
            return [
                { id: "docx", label: "Word Document (.docx)", icon: "📝" },
                { id: "html", label: "HTML & CSS (.html)", icon: "🌐" },
                { id: "txt", label: "Plain Text (.txt)", icon: "📄" },
            ];
        } else if (name.endsWith(".docx") || name.endsWith(".doc")) {
            return [
                { id: "pdf", label: "PDF Document (.pdf)", icon: "📕" },
                { id: "html", label: "HTML & CSS (.html)", icon: "🌐" },
                { id: "txt", label: "Plain Text (.txt)", icon: "📄" },
            ];
        } else if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".webp")) {
            return [
                { id: "pdf", label: "PDF Document (.pdf)", icon: "📕" },
            ];
        } else {
            return [
                { id: "pdf", label: "PDF Document (.pdf)", icon: "📕" },
                { id: "docx", label: "Word Document (.docx)", icon: "📝" },
                { id: "html", label: "HTML & CSS (.html)", icon: "🌐" },
            ];
        }
    };

    const handleConvert = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please choose a file to convert.");
            return;
        }

        try {
            setConverting(true);
            setError("");

            const response = await documentService.convertUploadedFile(file, targetFormat);

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);

            const originalName = file.name;
            const baseName = originalName.lastIndexOf(".") > 0
                ? originalName.substring(0, originalName.lastIndexOf("."))
                : originalName;
            const outputFilename = `${baseName}_converted.${targetFormat}`;

            setConvertedResult({
                url,
                fileName: outputFilename,
                format: targetFormat.toUpperCase(),
                size: blob.size,
            });

            showToast(
                `Converted "${originalName}" to ${targetFormat.toUpperCase()} successfully!`,
                "success",
                "Conversion Complete"
            );

            // Auto-trigger download
            const link = window.document.createElement("a");
            link.href = url;
            link.download = outputFilename;
            window.document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (err) {
            console.error("Conversion error:", err);
            setError(
                err.response?.data?.message ||
                "Failed to convert file. Please verify the file format and try again."
            );
        } finally {
            setConverting(false);
        }
    };

    const handleReset = () => {
        if (convertedResult?.url) {
            window.URL.revokeObjectURL(convertedResult.url);
        }
        setFile(null);
        setConvertedResult(null);
        setError("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="app-shell">
            <Navbar />

            <main className="converter-page-container">
                {/* Hero Header */}
                <section className="converter-hero">
                    <div className="converter-hero-content">
                        <span className="converter-eyebrow">
                            ⚡ POWERFUL DOCUMENT STUDIO
                        </span>
                        <h1>Secure Document Converter</h1>
                        <p>
                            Convert files seamlessly between PDF, Word (.docx), HTML/CSS, Text, and Images
                            with in-memory processing and enterprise-grade security.
                        </p>
                    </div>

                    <div className="converter-hero-badge">
                        <span className="badge-glow-icon">🪄</span>
                        <div>
                            <strong>Instant Conversion</strong>
                            <small>No Cloud Leak • Encrypted Safe</small>
                        </div>
                    </div>
                </section>

                {/* Conversion Presets Bar */}
                <section className="converter-presets-section">
                    <h3 className="presets-heading">Popular Conversion Formats</h3>
                    <div className="presets-grid">
                        {presets.map((p, idx) => (
                            <div
                                key={idx}
                                className="preset-card"
                                onClick={() => {
                                    setTargetFormat(p.to);
                                    if (fileInputRef.current) fileInputRef.current.click();
                                }}
                            >
                                <div className="preset-icon">{p.icon}</div>
                                <div className="preset-info">
                                    <strong>{p.title}</strong>
                                    <small>{p.desc}</small>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Converter Core Card */}
                <div className="converter-studio-card">
                    {error && (
                        <div className="converter-alert error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {!convertedResult ? (
                        <form onSubmit={handleConvert} className="converter-form">
                            {/* Upload Drag & Drop Area */}
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
                                    type="file"
                                    className="hidden-file-input"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleFileSelect(e.target.files[0]);
                                        }
                                    }}
                                    accept=".pdf,.docx,.doc,.txt,.md,.png,.jpg,.jpeg,.webp"
                                />

                                {file ? (
                                    <div className="selected-file-display">
                                        <div className="selected-file-icon">📄</div>
                                        <div className="selected-file-details">
                                            <h3>{file.name}</h3>
                                            <p>{(file.size / 1024).toFixed(1)} KB • Ready for conversion</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="change-file-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleReset();
                                            }}
                                        >
                                            Change File
                                        </button>
                                    </div>
                                ) : (
                                    <div className="dropzone-empty-content">
                                        <div className="dropzone-animated-icon">📂</div>
                                        <h3>Drag & drop your document here</h3>
                                        <p>or click to browse files (PDF, DOCX, TXT, PNG, JPG)</p>
                                        <span className="browse-files-button">
                                            Choose File
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Target Format Selector */}
                            <div className="converter-options-row">
                                <label className="converter-label">
                                    <span>🎯</span> Convert To Format:
                                </label>
                                <div className="target-formats-selector">
                                    {getAvailableFormats().map((fmt) => (
                                        <button
                                            key={fmt.id}
                                            type="button"
                                            className={`target-format-btn ${targetFormat === fmt.id ? "active" : ""}`}
                                            onClick={() => setTargetFormat(fmt.id)}
                                        >
                                            <span className="format-btn-icon">{fmt.icon}</span>
                                            <span>{fmt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Live Converting Progress Bar */}
                            {converting && (
                                <div className="conversion-progress-box">
                                    <div className="conversion-track">
                                        <div className="conversion-fill"></div>
                                    </div>
                                    <p>Converting file to <strong>{targetFormat.toUpperCase()}</strong>... Please wait.</p>
                                </div>
                            )}

                            {/* Convert Button */}
                            <div className="converter-submit-row">
                                <button
                                    type="submit"
                                    className="primary-button execute-convert-btn"
                                    disabled={!file || converting}
                                >
                                    {converting ? (
                                        <>
                                            <span className="saving-spinner"></span>
                                            <span>Converting Document...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>⚡</span>
                                            <span>Convert & Download Now</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* Result Card */
                        <div className="conversion-success-result">
                            <div className="result-checkmark-badge">✓</div>
                            <h2>Conversion Successful!</h2>
                            <p>Your document has been transformed and downloaded to your computer.</p>

                            <div className="result-file-card">
                                <div className="result-file-icon">🎉</div>
                                <div className="result-file-info">
                                    <strong>{convertedResult.fileName}</strong>
                                    <small>{convertedResult.format} Format • {(convertedResult.size / 1024).toFixed(1)} KB</small>
                                </div>
                                <a
                                    href={convertedResult.url}
                                    download={convertedResult.fileName}
                                    className="primary-button re-download-btn"
                                >
                                    ↓ Download Again
                                </a>
                            </div>

                            <button
                                type="button"
                                className="secondary-button convert-another-btn"
                                onClick={handleReset}
                            >
                                🔄 Convert Another File
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Converter;
