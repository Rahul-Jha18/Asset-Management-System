import React, { useRef, useState } from "react";
import {
  createBranchIssue,
  uploadBranchIssueAttachment,
} from "../../services/branchIssueApi";

const formatBytes = (bytes) => {
  const value = Number(bytes || 0);
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const size = value / Math.pow(1024, index);
  return `${size.toFixed(index === 0 || size >= 10 ? 0 : 1)} ${units[index]}`;
};

export default function IssueCreateForm({ user, categories = [], onSuccess, onCancel }) {
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    expected_outcome: "",
    category_id: "",
    priority: "Medium",
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addFiles = (incoming) => {
    const accepted = Array.from(incoming || []).filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is larger than 10 MB and was skipped.`);
        return false;
      }
      return true;
    });

    setFiles((prev) => [...prev, ...accepted]);
  };

  const submit = async (e) => {
    e.preventDefault();

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      alert("Issue title is required");
      return;
    }

    if (!description) {
      alert("Description is required");
      return;
    }

    try {
      setLoading(true);

      const res = await createBranchIssue({
        title,
        description,
        expected_outcome: form.expected_outcome?.trim() || null,
        category_id: form.category_id || null,
        priority: form.priority || "Medium",
        reporter_branch_id: user?.branch_id || null,
        reporter_name: user?.name || user?.email || null,
        reporter_email: user?.email || null,
      });

      const issue = res?.data?.issue;

      if (issue?.id && files.length) {
        for (const file of files) {
          await uploadBranchIssueAttachment(issue.id, file);
        }
      }

      setForm({
        title: "",
        description: "",
        expected_outcome: "",
        category_id: "",
        priority: "Medium",
      });
      setFiles([]);

      if (onSuccess) onSuccess(issue);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to submit issue");
    } finally {
      setLoading(false);
    }
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <form className="it-create-form" onSubmit={submit}>
      <div className="it-form-section-title">
        <span className="it-section-icon">▦</span>
        Issue Details
      </div>

      <div className="it-form-grid">
        <div className="it-form-field">
          <label>
            Issue Title <span>*</span>
          </label>
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Enter a short, clear title for the issue"
          />
          <small>Summarize the issue in a few words.</small>
        </div>

        <div className="it-form-field">
          <label>
            Category <span>*</span>
          </label>
          <select value={form.category_id} onChange={(e) => update("category_id", e.target.value)}>
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="it-form-field">
          <label>
            Priority <span>*</span>
          </label>
          <select value={form.priority} onChange={(e) => update("priority", e.target.value)}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div className="it-form-field">
          <label>Branch</label>
          <input
            disabled
            value={user?.branch_name || user?.branchName || user?.branch?.name || "Your branch"}
          />
          <small>Automatically set from your login account.</small>
        </div>

        <div className="it-form-field it-form-wide">
          <label>
            Description <span>*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe the issue in detail. Include steps to reproduce, error messages, and relevant context."
            rows={5}
          />
          <small>Minimum 10 characters recommended.</small>
        </div>

        <div className="it-form-field it-form-wide">
          <label>Expected Outcome</label>
          <textarea
            value={form.expected_outcome}
            onChange={(e) => update("expected_outcome", e.target.value)}
            placeholder="What result do you expect after this issue is solved?"
            rows={4}
          />
        </div>
      </div>

      <div className="it-form-field it-form-wide">
        <label>Attachments</label>
        <div
          className="it-dropzone"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            hidden
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={(e) => addFiles(e.target.files)}
          />
          <div className="it-drop-icon">⇧</div>
          <strong>Drag & drop files here or click to browse</strong>
          <small>Images, PDF, DOCX, XLSX. Max 10 MB per file.</small>
        </div>

        {files.length > 0 && (
          <div className="it-selected-files">
            <div className="it-selected-files-head">
              <span>Attached Files ({files.length})</span>
              <span>Total size: {formatBytes(totalSize)}</span>
            </div>

            {files.map((file, index) => (
              <div className="it-selected-file" key={`${file.name}-${index}`}>
                <span className="it-file-icon">📎</span>
                <div>
                  <strong>{file.name}</strong>
                  <small>{formatBytes(file.size)}</small>
                </div>
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="it-form-footer">
        <div className="it-private-note">🔒 Visible only to authorized issue handlers.</div>

        <div className="it-form-actions">
          <button type="button" className="it-btn it-btn-soft" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="it-btn it-btn-primary" disabled={loading}>
            {loading ? "Submitting..." : "Submit Issue"}
          </button>
        </div>
      </div>
    </form>
  );
}
