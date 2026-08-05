import React, { useMemo, useRef, useState } from "react";
import api from "../../services/api";

/* ─────────────────────────────────────────────────────────────
   FILE SIZE FORMATTER
───────────────────────────────────────────────────────────── */

const formatBytes = (bytes) => {
  const value = Number(bytes || 0);

  if (!value) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];

  const index = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1
  );

  const size = value / Math.pow(1024, index);

  return `${size.toFixed(
    index === 0 || size >= 10 ? 0 : 1
  )} ${units[index]}`;
};

/* ─────────────────────────────────────────────────────────────
   BACKEND URL
───────────────────────────────────────────────────────────── */

const getApiOrigin = () => {
  const configuredUrls = [
    process.env.REACT_APP_BACKEND_URL,
    process.env.REACT_APP_API_URL,
    process.env.REACT_APP_API_BASE_URL,
    api?.defaults?.baseURL,
  ].filter(Boolean);

  for (const value of configuredUrls) {
    try {
      const url = new URL(
        value,
        window.location.origin
      );

      /*
        When API baseURL is something such as:

        http://192.168.0.50:5001/api

        url.origin returns:

        http://192.168.0.50:5001
      */
      if (
        url.hostname !== window.location.hostname ||
        url.port === "5001"
      ) {
        return url.origin;
      }
    } catch (error) {
      console.warn(
        "Invalid API URL configuration:",
        value,
        error
      );
    }
  }

  /*
    Development/network fallback.

    Frontend:
    http://192.168.0.50:88
    or
    http://localhost:3001

    Backend:
    Same host, port 5001
  */
  return `${window.location.protocol}//${window.location.hostname}:5001`;
};

/* ─────────────────────────────────────────────────────────────
   ATTACHMENT HELPERS
───────────────────────────────────────────────────────────── */

const getStoredFileName = (attachment) => {
  if (!attachment) {
    return "";
  }

  return (
    attachment.stored_file_name ||
    attachment.storedFileName ||
    attachment.filename ||
    ""
  );
};

const getFileName = (attachment) => {
  if (!attachment) {
    return "attachment";
  }

  return (
    attachment.original_file_name ||
    attachment.originalFileName ||
    attachment.file_name ||
    attachment.filename ||
    attachment.stored_file_name ||
    "attachment"
  );
};

const publicUrlFor = (attachment) => {
  if (!attachment) {
    return null;
  }

  /*
    Prefer a proper public URL returned by the backend.

    storage_path is intentionally excluded because it contains
    a physical Windows path such as:

    C:\Users\...\backend\uploads\branch-issues\file.pdf
  */
  const suppliedPublicUrl =
    attachment.file_url ||
    attachment.public_url ||
    attachment.url;

  if (suppliedPublicUrl) {
    const value = String(suppliedPublicUrl).trim();

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    if (value.startsWith("/uploads/")) {
      return `${getApiOrigin()}${value}`;
    }

    if (value.startsWith("uploads/")) {
      return `${getApiOrigin()}/${value}`;
    }
  }

  const storedFileName =
    getStoredFileName(attachment);

  if (!storedFileName) {
    console.error(
      "Attachment does not contain stored_file_name:",
      attachment
    );

    return null;
  }

  return `${getApiOrigin()}/uploads/branch-issues/${encodeURIComponent(
    storedFileName
  )}`;
};

const getContentType = (attachment) =>
  String(
    attachment?.content_type ||
      attachment?.mime_type ||
      attachment?.contentType ||
      ""
  ).toLowerCase();

const isImageAttachment = (attachment) => {
  const type = getContentType(attachment);
  const name = getFileName(attachment).toLowerCase();

  return (
    type.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name)
  );
};

const isPdfAttachment = (attachment) => {
  const type = getContentType(attachment);
  const name = getFileName(attachment).toLowerCase();

  return (
    type.includes("application/pdf") ||
    type.includes("pdf") ||
    name.endsWith(".pdf")
  );
};

const fileIconFor = (attachment) => {
  if (isImageAttachment(attachment)) {
    return "🖼️";
  }

  if (isPdfAttachment(attachment)) {
    return "📄";
  }

  const name = getFileName(attachment).toLowerCase();

  if (/\.(doc|docx)$/i.test(name)) {
    return "📝";
  }

  if (/\.(xls|xlsx|csv)$/i.test(name)) {
    return "📊";
  }

  if (/\.(ppt|pptx)$/i.test(name)) {
    return "📽️";
  }

  if (/\.(zip|rar|7z)$/i.test(name)) {
    return "🗜️";
  }

  return "📎";
};

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */

export default function IssueAttachmentUpload({
  attachments = [],
  onUpload,
  loading = false,
  issueStatus,
}) {
  const fileRef = useRef(null);

  const [preview, setPreview] =
    useState(null);

  const [previewError, setPreviewError] =
    useState("");

  const closed =
    String(issueStatus || "").toLowerCase() ===
    "closed";

  const previewUrl = useMemo(() => {
    if (!preview) {
      return null;
    }

    return publicUrlFor(preview);
  }, [preview]);

  const handleFile = (file) => {
    if (!file) {
      return;
    }

    const maxFileSize =
      10 * 1024 * 1024;

    if (file.size > maxFileSize) {
      alert("Maximum file size is 10 MB");
      return;
    }

    const allowedExtensions =
      /\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|xls|xlsx)$/i;

    if (!allowedExtensions.test(file.name)) {
      alert(
        "Unsupported file type. Please upload an image, PDF, Word or Excel file."
      );

      return;
    }

    if (typeof onUpload === "function") {
      onUpload(file);
    }

    /*
      Allow selecting the same file again after upload.
    */
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const openPreview = (attachment) => {
    const url = publicUrlFor(attachment);

    if (!url) {
      alert(
        "Attachment URL could not be generated."
      );

      return;
    }

    setPreviewError("");

    if (
      isImageAttachment(attachment) ||
      isPdfAttachment(attachment)
    ) {
      setPreview(attachment);
      return;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const closePreview = () => {
    setPreview(null);
    setPreviewError("");
  };

  const handleDownload = async (
    event,
    attachment
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const url = publicUrlFor(attachment);

    if (!url) {
      alert(
        "Attachment download URL could not be generated."
      );

      return;
    }

    try {
      /*
        Fetching the file as a Blob provides a reliable download
        even when the frontend and backend use different ports.
      */
      const response = await fetch(url, {
        method: "GET",
        credentials: "omit",
      });

      if (!response.ok) {
        throw new Error(
          `Download failed with status ${response.status}`
        );
      }

      const blob = await response.blob();
      const objectUrl =
        window.URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = objectUrl;
      anchor.download =
        getFileName(attachment);

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(
        objectUrl
      );
    } catch (error) {
      console.error(
        "Attachment download failed:",
        error
      );

      /*
        Fall back to opening the public file URL.
      */
      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  const normalizedAttachments =
    Array.isArray(attachments)
      ? attachments
      : [];

  return (
    <div className="it-attachments">
      {!closed && (
        <div
          className="it-attach-drop"
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!loading) {
              fileRef.current?.click();
            }
          }}
          onKeyDown={(event) => {
            if (
              !loading &&
              (event.key === "Enter" ||
                event.key === " ")
            ) {
              event.preventDefault();
              fileRef.current?.click();
            }
          }}
          style={{
            opacity: loading ? 0.65 : 1,
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          <input
            ref={fileRef}
            hidden
            type="file"
            disabled={loading}
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={(event) =>
              handleFile(
                event.target.files?.[0]
              )
            }
          />

          <span className="it-attach-drop-icon" aria-hidden="true" />

          <strong>
            {loading
              ? "Uploading..."
              : "Upload attachment"}
          </strong>

          <small>
            Images and PDFs open inside the
            preview viewer &middot; Max 10&nbsp;MB
          </small>
        </div>
      )}

      {!normalizedAttachments.length ? (
        <div className="it-muted-empty">
          No attachments uploaded.
        </div>
      ) : (
        <div className="it-attach-grid">
          {normalizedAttachments.map(
            (attachment, index) => {
              const url =
                publicUrlFor(attachment);

              const image =
                isImageAttachment(
                  attachment
                );

              const pdf =
                isPdfAttachment(
                  attachment
                );

              const attachmentKey =
                attachment.id ||
                attachment.stored_file_name ||
                `${getFileName(
                  attachment
                )}-${index}`;

              return (
                <div
                  className="it-attach-card"
                  key={attachmentKey}
                >
                  <div className="it-attach-thumb">
                    {image && url ? (
                      <img
                        src={url}
                        alt={getFileName(
                          attachment
                        )}
                        loading="lazy"
                        onError={(event) => {
                          console.error(
                            "Attachment thumbnail failed:",
                            url
                          );

                          event.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <span>
                        {fileIconFor(
                          attachment
                        )}
                      </span>
                    )}
                  </div>

                  <div className="it-attach-info">
                    <strong
                      title={getFileName(
                        attachment
                      )}
                    >
                      {getFileName(
                        attachment
                      )}
                    </strong>

                    <small>
                      {formatBytes(
                        attachment.file_size_bytes ||
                          attachment.fileSize ||
                          attachment.size
                      )}

                      {" · "}

                      {attachment.created_at
                        ? new Date(
                            attachment.created_at
                          ).toLocaleDateString(
                            "en-NP"
                          )
                        : ""}
                    </small>

                    <div className="it-attach-actions">
                      {url && (
                        <button
                          type="button"
                          className="it-attach-action"
                          onClick={() =>
                            openPreview(
                              attachment
                            )
                          }
                        >
                          {image || pdf
                            ? "Preview"
                            : "Open"}
                        </button>
                      )}

                      {url && (
                        <button
                          type="button"
                          className="it-attach-action secondary"
                          onClick={(event) =>
                            handleDownload(
                              event,
                              attachment
                            )
                          }
                        >
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {preview && previewUrl && (
        <div
          className="it-preview-backdrop"
          role="presentation"
          onClick={closePreview}
        >
          <div
            className="it-preview-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Attachment preview"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="it-preview-head">
              <div className="it-preview-title">
                <strong>
                  {getFileName(preview)}
                </strong>

                <small>
                  {formatBytes(
                    preview.file_size_bytes ||
                      preview.fileSize ||
                      preview.size
                  )}
                </small>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  className="it-preview-close"
                  title="Open in new tab"
                  onClick={() =>
                    window.open(
                      previewUrl,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  style={{
                    fontSize: 14,
                  }}
                >
                  ↗
                </button>

                <button
                  type="button"
                  className="it-preview-close"
                  title="Close preview"
                  onClick={closePreview}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="it-preview-body">
              {previewError ? (
                <div className="it-preview-fallback">
                  <p>{previewError}</p>

                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open file in a new tab
                  </a>
                </div>
              ) : isImageAttachment(
                  preview
                ) ? (
                <img
                  src={previewUrl}
                  alt={getFileName(preview)}
                  onError={() =>
                    setPreviewError(
                      "The image could not be loaded. Open it in a new tab to verify the file."
                    )
                  }
                />
              ) : isPdfAttachment(
                  preview
                ) ? (
                <iframe
                  src={previewUrl}
                  title={getFileName(preview)}
                  onError={() =>
                    setPreviewError(
                      "The PDF preview could not be loaded. Open it in a new tab."
                    )
                  }
                />
              ) : (
                <div className="it-preview-fallback">
                  <p>
                    Preview is not available for
                    this file type.
                  </p>

                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
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