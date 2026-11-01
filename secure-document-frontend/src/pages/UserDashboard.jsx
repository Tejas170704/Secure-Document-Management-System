import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import documentService from "../services/documentService";

function UserDashboard() {

    const navigate = useNavigate();

    const [documents, setDocuments] = useState([]);
    const [sharedDocuments, setSharedDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDocuments();
    }, []);


    const loadDocuments = async () => {

        try {

            setLoading(true);
            setError("");

            const myDocuments =
                await documentService.getMyDocuments(
                    0,
                    5,
                    "uploadedAt"
                );

            setDocuments(
                myDocuments?.content || []
            );


            try {

                const shared =
                    await documentService.getSharedWithMe(
                        0,
                        5,
                        "sharedAt"
                    );

                setSharedDocuments(
                    shared?.content || []
                );

            } catch (sharedError) {

                console.error(
                    "Shared documents error:",
                    sharedError
                );

                setSharedDocuments([]);
            }

        } catch (error) {

            console.error(
                "Documents error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load documents."
            );

        } finally {

            setLoading(false);
        }
    };
    
    const totalDocuments = documents.length;
    const totalShared = sharedDocuments.length;
    const encryptedDocuments =
        documents.filter(
            (document) =>
                document.encrypted === true
        ).length;


    return (

        <div className="app-shell">

            <Navbar />


            <main className="dashboard-container">

                {/* Header */}

                <section className="dashboard-header">

                    <div>

                        <p className="dashboard-eyebrow">
                            ⚡ SECURE DOCUMENT MANAGEMENT
                        </p>

                        <h1>
                            Welcome back 👋
                        </h1>

                        <p className="dashboard-description">
                            Manage your encrypted documents, convert between PDF, Word & HTML formats,
                            and securely collaborate with peers.
                        </p>

                    </div>

                    <div className="header-actions-row">
                        <button
                            className="secondary-button converter-action-btn"
                            onClick={() =>
                                navigate("/converter")
                            }
                        >
                            <span>🪄</span> Convert Files
                        </button>

                        <button
                            className="primary-button"
                            onClick={() =>
                                navigate("/documents")
                            }
                        >
                            View Vault
                        </button>
                    </div>

                </section>


                {/* Error */}

                {error && (

                    <div className="error-message">
                        {error}
                    </div>

                )}


                {/* Statistics */}

                <section className="stats-grid dashboard-stats">

                    <div className="stat-card-modern stat-card-hover" onClick={() => navigate("/documents")}>

                        <div className="stat-icon">
                            📄
                        </div>

                        <div>

                            <p>
                                My Documents
                            </p>

                            <strong>
                                {loading
                                    ? "—"
                                    : totalDocuments}
                            </strong>

                        </div>

                    </div>


                    <div className="stat-card-modern stat-card-hover" onClick={() => navigate("/shared-documents")}>

                        <div className="stat-icon">
                            👥
                        </div>

                        <div>

                            <p>
                                Shared With Me
                            </p>

                            <strong>
                                {loading
                                    ? "—"
                                    : totalShared}
                            </strong>

                        </div>

                    </div>


                    <div className="stat-card-modern stat-card-hover" onClick={() => navigate("/documents")}>

                        <div className="stat-icon">
                            🔒
                        </div>

                        <div>

                            <p>
                                Encrypted Files
                            </p>

                            <strong>
                                {loading
                                    ? "—"
                                    : encryptedDocuments}
                            </strong>

                        </div>

                    </div>


                    <div className="stat-card-modern stat-card-hover" onClick={() => navigate("/converter")}>

                        <div className="stat-icon">
                            🪄
                        </div>

                        <div>

                            <p>
                                Conversion Studio
                            </p>

                            <strong>
                                6 Formats
                            </strong>

                        </div>

                    </div>

                </section>


                {/* Quick Actions */}

                <section className="dashboard-section-modern">

                    <div className="section-title">

                        <div>

                            <h2>
                                Quick Actions
                            </h2>

                            <p>
                                Common document management & conversion tasks
                            </p>

                        </div>

                    </div>


                    <div className="quick-actions">

                        <button
                            className="quick-action quick-action-highlight"
                            onClick={() =>
                                navigate("/converter")
                            }
                        >

                            <span className="quick-action-icon animated-bounce">
                                🪄
                            </span>

                            <span>

                                <strong>
                                    Document Converter
                                </strong>

                                <small>
                                    Convert PDF &harr; Word, HTML, Images
                                </small>

                            </span>

                        </button>


                        <button
                            className="quick-action"
                            onClick={() =>
                                navigate("/documents")
                            }
                        >

                            <span className="quick-action-icon">
                                📄
                            </span>

                            <span>

                                <strong>
                                    My Documents
                                </strong>

                                <small>
                                    View, edit & manage your files
                                </small>

                            </span>

                        </button>


                        <button
                            className="quick-action"
                            onClick={() =>
                                navigate("/shared-documents")
                            }
                        >

                            <span className="quick-action-icon">
                                👥
                            </span>

                            <span>

                                <strong>
                                    Shared With Me
                                </strong>

                                <small>
                                    Access peer-shared documents
                                </small>

                            </span>

                        </button>


                        <button
                            className="quick-action"
                            onClick={() =>
                                navigate("/upload")
                            }
                        >

                            <span className="quick-action-icon">
                                ⬆️
                            </span>

                            <span>

                                <strong>
                                    Upload Document
                                </strong>

                                <small>
                                    AES-encrypted file storage
                                </small>

                            </span>

                        </button>

                    </div>

                </section>


                {/* Recent Documents */}

                <section className="dashboard-section-modern">

                    <div className="section-header-modern">

                        <div>

                            <h2>
                                Recent Documents
                            </h2>

                            <p>
                                Your latest encrypted uploads
                            </p>

                        </div>


                        <button
                            className="view-all-button"
                            onClick={() =>
                                navigate("/documents")
                            }
                        >
                            View all →
                        </button>

                    </div>


                    {loading ? (

                        <div className="empty-state">

                            <div className="loading-spinner">
                            </div>

                            <p>
                                Loading documents...
                            </p>

                        </div>

                    ) : documents.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                📂
                            </div>

                            <h3>
                                No documents yet
                            </h3>

                            <p>
                                Upload your first document or convert a file to get started.
                            </p>

                            <div className="empty-state-buttons">
                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        navigate("/documents?upload=true")
                                    }
                                >
                                    Upload Document
                                </button>

                                <button
                                    className="secondary-button"
                                    onClick={() =>
                                        navigate("/converter")
                                    }
                                >
                                    🪄 Open Converter
                                </button>
                            </div>

                        </div>

                    ) : (

                        <div className="recent-documents">

                            {documents.map(
                                (document) => (

                                    <div
                                        className="recent-document"
                                        key={document.id}
                                    >

                                        <div className="file-icon">
                                            📄
                                        </div>


                                        <div className="file-info">

                                            <h3>
                                                {document.title ||
                                                    document.originalFileName}
                                            </h3>

                                            <p>
                                                {document.originalFileName}
                                            </p>

                                        </div>


                                        <div className="file-security">

                                            {document.encrypted && (
                                                <span className="encrypted-badge">
                                                    🔒 Encrypted
                                                </span>
                                            )}

                                        </div>


                                        <button
                                            className="view-button"
                                            onClick={() =>
                                                navigate(
                                                    `/documents/${document.id}`)}
                                        >
                                            View
                                        </button>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* Security Information */}

                <section className="security-banner">

                    <div className="security-banner-icon animated-shield">
                        🛡️
                    </div>

                    <div>

                        <h3>
                            Zero-Knowledge AES-256 Protection
                        </h3>

                        <p>
                            All files are encrypted in-memory before reaching persistent storage,
                            shielded by Spring Security JWT session verification and granular RBAC.
                        </p>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default UserDashboard;