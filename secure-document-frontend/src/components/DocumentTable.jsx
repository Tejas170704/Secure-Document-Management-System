import React from "react";
import { useNavigate } from "react-router-dom";

const DocumentTable = ({
  documents = [],
  onDownload,
  onDelete,
  onShare,
  onConvert,
  showActions = true,
  loading = false,
}) => {

  const navigate = useNavigate();


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="document-table-message">
        <div className="table-loading-spinner"></div>
        <p>Loading documents securely...</p>
      </div>
    );
  }


  // =========================================================
  // EMPTY
  // =========================================================

  if (!documents || documents.length === 0) {
    return (
      <div className="document-table-message">
        <div className="empty-document-icon">📄</div>
        <h3>No Documents Found</h3>
        <p>Your document list is currently empty.</p>
      </div>
    );
  }


  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleString();
    } catch {
      return date;
    }
  };


  // =========================================================
  // VIEW DOCUMENT
  // =========================================================

  const handleView = (doc) => {
    if (!doc?.id) {
      console.error("Document ID is missing:", doc);
      return;
    }
    navigate(`/documents/${doc.id}`);
  };


  return (
    <div className="document-table-container">
      <table className="document-table">
        <thead>
          <tr>
            <th>Document</th>
            <th>Description</th>
            <th>File Name</th>
            <th>Uploaded By</th>
            <th>Uploaded At</th>
            {showActions && <th className="actions-column">Actions</th>}
          </tr>
        </thead>

        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id} className="document-table-row">
              {/* DOCUMENT TITLE & ID */}
              <td>
                <div className="document-title-cell">
                  <div className="document-file-icon">📄</div>
                  <div>
                    <strong>{doc.title || "Untitled Document"}</strong>
                    <small>
                      ID: {doc.id} • {doc.encrypted ? "🔒 AES Encrypted" : ""}
                    </small>
                  </div>
                </div>
              </td>

              {/* DESCRIPTION */}
              <td>
                <span className="document-description">
                  {doc.description ? doc.description : "No description"}
                </span>
              </td>

              {/* FILE NAME */}
              <td>
                <span className="file-name">
                  {doc.fileName || doc.originalFileName || "N/A"}
                </span>
              </td>

              {/* UPLOADED BY */}
              <td>
                <span className="owner-chip">
                  {doc.ownerEmail || doc.uploadedBy || doc.owner || "You"}
                </span>
              </td>

              {/* UPLOADED AT */}
              <td>
                <span className="document-date">
                  {formatDate(doc.uploadedAt || doc.sharedAt)}
                </span>
              </td>

              {/* ACTIONS */}
              {showActions && (
                <td>
                  <div className="document-actions">
                    {/* VIEW */}
                    <button
                      type="button"
                      className="document-action-btn view-btn"
                      onClick={() => handleView(doc)}
                      title="View document details & edit"
                    >
                      👁 View
                    </button>

                    {/* CONVERT */}
                    {onConvert && (
                      <button
                        type="button"
                        className="document-action-btn convert-btn"
                        onClick={() => onConvert(doc)}
                        title="Convert document format"
                      >
                        🔄 Convert
                      </button>
                    )}

                    {/* DOWNLOAD */}
                    {onDownload && (
                      <button
                        type="button"
                        className="document-action-btn download-btn"
                        onClick={() => onDownload(doc)}
                        title="Download decrypted file"
                      >
                        ↓ Download
                      </button>
                    )}

                    {/* SHARE */}
                    {onShare && (
                      <button
                        type="button"
                        className="document-action-btn share-btn"
                        onClick={() => onShare(doc)}
                        title="Share document"
                      >
                        ↗ Share
                      </button>
                    )}

                    {/* DELETE */}
                    {onDelete && (
                      <button
                        type="button"
                        className="document-action-btn delete-btn"
                        onClick={() => onDelete(doc)}
                        title="Delete document"
                      >
                        🗑 Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentTable;