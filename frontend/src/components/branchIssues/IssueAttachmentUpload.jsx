import React, { useMemo, useRef, useState } from "react";
import api from "../../services/api";

const formatBytes = (bytes) => {
  const value = Number(bytes || 0);
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const size = value / Math.pow(1024, index);
  return `${size.toFixed(index === 0 || size >= 10 ? 0 : 1)} ${units[index]}`;
};

const getApiOrigin = () => {
  const candidates = [
    process.env.REACT_APP_API_URL,
    process.env.REACT_APP_API_BASE_URL,
    process.env.REACT_APP_BACKEND_URL,
    api?.defaults?.baseURL,
  ].filter(Boolean);

  for (const value of candidates) {
    try {
      const url = new URL(value, window.location.origin);

      // If baseURL is just "/api", this resolves to frontend origin.
      // That is OK in production proxy mode, but not enough for separate dev servers.
      return url.origin;
    } catch {
      // Ignore invalid values
    }
  }

  return window.location.origin;
};

const cleanPath = (value = "") => {
  const path = String(value).replace(/\\/g, "/");

  if (/^https?:\/\//i.test(path)) return path;

  // backend normally stores either "uploads/branch-issues/file.jpg"
  // or "/uploads/branch-issues/file.jpg"
  return path.startsWith("/") ? path : `/${path}`;
};

const publicUrlFor = (attachment) => {
  const raw =
    attachment.url ||
    attachment.file_url ||
    attachment.public_url ||
    attachment.storage_path ||
    attachment.path;

  if (!raw) return null;

  const cleaned = cleanPath(raw);

  if (/^https?:\/\//i.test(cleaned)) return cleaned;

  return `${getApiOrigin()}${cleaned}`;
};

const getFileName = (attachment) =>
  attachment.original_file_name ||
  attachment.originalFileName ||
  attachment.filename ||
  attachment.stored_file_name ||
  "attachment";

const isImageAttachment = (attachment) => {
  const type = String(attachment.content_type || attachment.mime_type || "").toLowerCase();
  const name = getFileName(attachment).toLowerCase();

  return (
    type.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name)
  );
};

const isPdfAttachment = (attachment) => {
  const type = String(attachment.content_type || attachment.mime_type || "").toLowerCase();
  const name = getFileName(attachment).toLowerCase();
  return type.includes("pdf") || name.endsWith(".pdf");
};

const fileIconFor = (attachment) => {
  if (isImageAttachment(attachment)) return "🖼️";
  if (isPdfAttachment(attachment)) return "📄";
  const name = getFileName(attachment).toLowerCase();
  if (/\.(doc|docx)$/i.test(name)) return "📝";
  if (/\.(xls|xlsx|csv)$/i.test(name)) return "📊";
  return "📎";
};

export default function IssueAttachmentUpload({
  attachments = [],
  onUpload,
  loading = false,
  issueStatus,
}) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const closed = issueStatus === "Closed";

  const previewUrl = useMemo(() => (preview ? publicUrlFor(preview) : null), [preview]);

  const handleFile = (file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Maximum file size is 10 MB");
      return;
    }

    if (onUpload) onUpload(file);
  };

  const openPreview = (attachment) => {
    const url = publicUrlFor(attachment);
    if (!url) return;

    if (isImageAttachment(attachment) || isPdfAttachment(attachment)) {
      setPreview(attachment);
      return;
    }

    // Only non-previewable office files open externally.
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="it-attachments">
      {!closed && (
        <div className="it-attach-drop" onClick={() => fileRef.current?.click()}>
          <input
            ref={fileRef}
            hidden
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <strong>{loading ? "Uploading..." : "Upload Attachment"}</strong>
          <small>Images open inside preview. PDF opens inside viewer. Max 10 MB.</small>
        </div>
      )}

      {!attachments.length ? (
        <div className="it-muted-empty">No attachments uploaded.</div>
      ) : (
        <div className="it-attach-grid">
          {attachments.map((attachment) => {
            const url = publicUrlFor(attachment);
            const image = isImageAttachment(attachment);
            const pdf = isPdfAttachment(attachment);

            return (
              <div className="it-attach-card" key={attachment.id}>
                <div className="it-attach-thumb">
                  {image && url ? (
                    <img src={url} alt={getFileName(attachment)} />
                  ) : (
                    <span>{fileIconFor(attachment)}</span>
                  )}
                </div>

                <div className="it-attach-info">
                  <strong title={getFileName(attachment)}>
                    {getFileName(attachment)}
                  </strong>
                  <small>
                    {formatBytes(attachment.file_size_bytes)} ·{" "}
                    {attachment.created_at ? new Date(attachment.created_at).toLocaleDateString("en-NP") : ""}
                  </small>

                  <div className="it-attach-actions">
                    {url && (
                      <button
                        type="button"
                        className="it-attach-action"
                        onClick={() => openPreview(attachment)}
                      >
                        {image || pdf ? "Preview" : "Open"}
                      </button>
                    )}

                    {url && (
                      <a
                        className="it-attach-action secondary"
                        href={url}
                        download={getFileName(attachment)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Download
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {preview && previewUrl && (
        <div className="it-preview-backdrop" onClick={() => setPreview(null)}>
          <div className="it-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="it-preview-head">
              <div className="it-preview-title">
                <strong>{getFileName(preview)}</strong>
                <small>{formatBytes(preview.file_size_bytes)}</small>
              </div>

              <button className="it-preview-close" type="button" onClick={() => setPreview(null)}>
                ×
              </button>
            </div>

            <div className="it-preview-body">
              {isImageAttachment(preview) ? (
                <img src={previewUrl} alt={getFileName(preview)} />
              ) : isPdfAttachment(preview) ? (
                <iframe src={previewUrl} title={getFileName(preview)} />
              ) : (
                <div className="it-preview-fallback">
                  <p>Preview is not available for this file type.</p>
                  <a href={previewUrl} target="_blank" rel="noreferrer">
                    Open file
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
