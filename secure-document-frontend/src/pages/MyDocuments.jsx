import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import DocumentTable from "../components/DocumentTable";
import ShareModal from "../components/ShareModal";
import DeleteModal from "../components/DeleteModal";
import ConvertModal from "../components/ConvertModal";
import documentService from "../services/documentService";
import { useToast } from "../context/ToastContext";

const MyDocuments = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const uploadSectionRef = useRef(null);

    // =========================================================
    // DOCUMENT STATE
    // =========================================================

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================================================
    // MODAL STATE
    // =========================================================
    const [selectedDocForShare, setSelectedDocForShare] = useState(null);
    const [selectedDocForDelete, setSelectedDocForDelete] = useState(null);
    const [selectedDocForConvert, setSelectedDocForConvert] = useState(null);

    // =========================================================
    // UPLOAD STATE
    // =========================================================

    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [uploading, setUploading] = useState(false);

    // =========================================================
    // SEARCH / PAGINATION STATE
    // =========================================================

    const [searchKeyword, setSearchKeyword] = useState("");
    const [activeSearch, setActiveSearch] = useState("");
    const [sortBy, setSortBy] = useState("uploadedAt");
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);


    // =========================================================
    // LOAD DOCUMENTS
    // =========================================================

    const loadDocuments = async (
        requestedPage = page,
        requestedSort = sortBy,
        requestedSearch = activeSearch
    ) => {

        try {

            setLoading(true);
            setError("");

            let data;

            if (requestedSearch.trim()) {

                data =
                    await documentService.searchDocuments(
                        requestedSearch,
                        requestedPage,
                        size,
                        requestedSort
                    );

            } else {

                data =
                    await documentService.getMyDocuments(
                        requestedPage,
                        size,
                        requestedSort
                    );

            }

            setDocuments(
                data?.content || []
            );

            setTotalPages(
                data?.totalPages || 0
            );

            setTotalElements(
                data?.totalElements || 0
            );

            setPage(
                data?.number ?? requestedPage
            );

        } catch (err) {

            console.error(
                "Failed to load documents:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load your documents."
            );

            setDocuments([]);

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadDocuments(
            0,
            sortBy,
            activeSearch
        );
    }, []);


    useEffect(() => {
        const params =
            new URLSearchParams(
                location.search
            );

        const upload =
            params.get("upload");

        if (upload === "true") {
            setTimeout(() => {
                uploadSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 200);
        }
    }, [location.search]);


    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        if (!title.trim()) {
            const fileName = selectedFile.name;
            const lastDot = fileName.lastIndexOf(".");
            const fileTitle =
                lastDot > 0
                    ? fileName.substring(0, lastDot)
                    : fileName;

            setTitle(fileTitle);
        }
    };


    const handleUpload = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!file) {
            setError("Please select a document.");
            return;
        }

        if (!title.trim()) {
            setError("Please enter a document title.");
            return;
        }

        try {
            setUploading(true);

            const response =
                await documentService.uploadDocument(
                    file,
                    title,
                    description
                );

            const msg = response.message || "Document encrypted and uploaded successfully.";
            setSuccess(msg);
            showToast(msg, "success", "Upload Complete");

            setFile(null);
            setTitle("");
            setDescription("");

            const fileInput =
                document.getElementById(
                    "document-file"
                );

            if (fileInput) {
                fileInput.value = "";
            }

            setPage(0);
            setActiveSearch("");
            setSearchKeyword("");

            await loadDocuments(
                0,
                sortBy,
                ""
            );

        } catch (err) {
            console.error("Upload failed:", err);
            const errMsg = err.response?.data?.message || "Unable to upload document.";
            setError(errMsg);
            showToast(errMsg, "error", "Upload Failed");
        } finally {
            setUploading(false);
        }
    };


    const handleSearch = (event) => {
        event.preventDefault();
        const keyword = searchKeyword.trim();
        setActiveSearch(keyword);
        setPage(0);
        loadDocuments(0, sortBy, keyword);
    };

    const handleClearSearch = () => {
        setSearchKeyword("");
        setActiveSearch("");
        setPage(0);
        loadDocuments(0, sortBy, "");
    };

    const handleSortChange = (event) => {
        const newSort = event.target.value;
        setSortBy(newSort);
        setPage(0);
        loadDocuments(0, newSort, activeSearch);
    };

    const handlePreviousPage = () => {
        if (page <= 0) return;
        const newPage = page - 1;
        setPage(newPage);
        loadDocuments(newPage, sortBy, activeSearch);
    };

    const handleNextPage = () => {
        if (totalPages === 0 || page >= totalPages - 1) return;
        const newPage = page + 1;
        setPage(newPage);
        loadDocuments(newPage, sortBy, activeSearch);
    };


    const handleDownload = async (doc) => {
        try {
            const response = await documentService.downloadDocument(doc.id);
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = doc.originalFileName || doc.fileName || doc.title || "document";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showToast(`Decrypted and downloaded "${link.download}"`, "success", "Download Ready");
        } catch (err) {
            console.error("Download failed:", err);
            showToast(err.response?.data?.message || "Failed to download document.", "error", "Download Error");
        }
    };


    return (
        <div className="app-shell">
            <Navbar />

            <div className="documents-page">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="documents-header">
                    <div>
                        <span className="page-eyebrow">
                            DOCUMENT MANAGEMENT
                        </span>

                        <h1>
                            My Documents
                        </h1>

                        <p>
                            Upload, search, convert, download
                            and securely share your encrypted documents.
                        </p>
                    </div>

                    <div className="header-actions-row">
                        <button
                            type="button"
                            onClick={() => navigate("/converter")}
                            className="secondary-button converter-shortcut-btn"
                        >
                            <span>🪄</span> Document Converter
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                loadDocuments(
                                    page,
                                    sortBy,
                                    activeSearch
                                )
                            }
                            className="secondary-button"
                        >
                            ↻ Refresh
                        </button>
                    </div>
                </div>


                {/* =================================================
                    MESSAGES
                ================================================= */}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}


                {/* =================================================
                    UPLOAD SECTION
                ================================================= */}

                <section
                    className="upload-section"
                    ref={uploadSectionRef}
                >
                    <div className="section-title">
                        <div className="section-icon">
                            ↑
                        </div>

                        <div>
                            <h2>
                                Upload New Document
                            </h2>

                            <p>
                                Encrypted automatically with AES before saving.
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleUpload}
                        className="upload-form"
                    >
                        <div className="form-group">
                            <label htmlFor="document-file">
                                Select Document
                            </label>

                            <input
                                id="document-file"
                                type="file"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="document-title">
                                Document Title
                            </label>

                            <input
                                id="document-title"
                                type="text"
                                value={title}
                                onChange={(event) =>
                                    setTitle(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter document title"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="document-description">
                                Description
                            </label>

                            <textarea
                                id="document-description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter document description"
                                rows="3"
                            />
                        </div>

                        <div className="upload-actions">
                            <button
                                type="submit"
                                className="primary-button"
                                disabled={uploading}
                            >
                                {uploading
                                    ? "Encrypting & Uploading..."
                                    : "🔒 Upload Securely"}
                            </button>
                        </div>
                    </form>
                </section>


                {/* =================================================
                    DOCUMENT LIST SECTION
                ================================================= */}

                <section className="documents-list-section">
                    <div className="section-title">
                        <div className="section-icon">
                            📄
                        </div>

                        <div>
                            <h2>
                                Your Vault
                            </h2>

                            <p>
                                Search and manage your uploaded documents.
                            </p>
                        </div>
                    </div>


                    {/* SEARCH & SORT TOOLBAR */}
                    <div className="document-toolbar">
                        <form
                            className="document-search-form"
                            onSubmit={handleSearch}
                        >
                            <div className="search-input-wrapper">
                                <span className="search-icon">
                                    🔍
                                </span>

                                <input
                                    type="text"
                                    value={searchKeyword}
                                    onChange={(event) =>
                                        setSearchKeyword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search by title, description or file name..."
                                    className="document-search-input"
                                />

                                {searchKeyword && (
                                    <button
                                        type="button"
                                        className="clear-search-button"
                                        onClick={handleClearSearch}
                                        title="Clear search"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="primary-button search-button"
                            >
                                Search
                            </button>
                        </form>

                        <div className="document-sort">
                            <label htmlFor="document-sort">
                                Sort
                            </label>

                            <select
                                id="document-sort"
                                value={sortBy}
                                onChange={handleSortChange}
                            >
                                <option value="uploadedAt">
                                    Newest First
                                </option>
                                <option value="title">
                                    Title
                                </option>
                                <option value="description">
                                    Description
                                </option>
                            </select>
                        </div>
                    </div>


                    {/* SEARCH STATUS */}
                    <div className="document-results-info">
                        <div>
                            {activeSearch ? (
                                <span>
                                    Search results for{" "}
                                    <strong>
                                        "{activeSearch}"
                                    </strong>
                                </span>
                            ) : (
                                <span>
                                    All your documents
                                </span>
                            )}
                        </div>

                        <span>
                            {loading
                                ? "Loading..."
                                : `${totalElements} document${totalElements === 1 ? "" : "s"}`}
                        </span>
                    </div>


                    {/* TABLE */}
                    <DocumentTable
                        documents={documents}
                        loading={loading}
                        onDownload={handleDownload}
                        onDelete={(doc) => setSelectedDocForDelete(doc)}
                        onShare={(doc) => setSelectedDocForShare(doc)}
                        onConvert={(doc) => setSelectedDocForConvert(doc)}
                    />


                    {/* PAGINATION */}
                    {!loading && totalPages > 0 && (
                        <div className="document-pagination">
                            <button
                                type="button"
                                className="pagination-button"
                                onClick={handlePreviousPage}
                                disabled={page === 0}
                            >
                                ← Previous
                            </button>

                            <div className="pagination-info">
                                <span>Page</span>
                                <strong>{page + 1}</strong>
                                <span>of</span>
                                <strong>{totalPages}</strong>
                            </div>

                            <button
                                type="button"
                                className="pagination-button"
                                onClick={handleNextPage}
                                disabled={page >= totalPages - 1}
                            >
                                Next →
                            </button>
                        </div>
                    )}


                    {/* NO SEARCH RESULTS */}
                    {!loading && activeSearch && documents.length === 0 && (
                        <div className="search-empty-state">
                            <div>🔍</div>
                            <h3>No matching documents</h3>
                            <p>No documents were found for "{activeSearch}".</p>
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={handleClearSearch}
                            >
                                Clear Search
                            </button>
                        </div>
                    )}

                </section>

                {/* MODALS */}
                {selectedDocForShare && (
                    <ShareModal
                        document={selectedDocForShare}
                        isOpen={!!selectedDocForShare}
                        onClose={() => setSelectedDocForShare(null)}
                    />
                )}

                {selectedDocForDelete && (
                    <DeleteModal
                        document={selectedDocForDelete}
                        isOpen={!!selectedDocForDelete}
                        onClose={() => setSelectedDocForDelete(null)}
                        onSuccess={() => loadDocuments(page, sortBy, activeSearch)}
                    />
                )}

                {selectedDocForConvert && (
                    <ConvertModal
                        document={selectedDocForConvert}
                        isOpen={!!selectedDocForConvert}
                        onClose={() => setSelectedDocForConvert(null)}
                        onSuccess={() => loadDocuments(page, sortBy, activeSearch)}
                    />
                )}

            </div>
        </div>
    );
};

export default MyDocuments;