import React, { useEffect, useRef, useState } from "react";
import RichTextEditor from "../common/RichTextEditor";
import {
  createBranchIssue,
  uploadBranchIssueAttachment,
} from "../../services/branchIssueApi";
import { getBranchByCode } from "../../services/branchService";

const formatBytes = (bytes) => {
  const value = Number(bytes || 0);
  if (!value) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1
  );

  const size = value / Math.pow(1024, index);
  return `${size.toFixed(index === 0 || size >= 10 ? 0 : 1)} ${units[index]}`;
};
const stripHtnl = (html) => {
  const div = document.createElement("div");
  div.innerHtml = html || "";
  return div.textConetnt || div.innerText || "";
}

export default function IssueCreateForm({
  user,
  categories = [],
  corpUsers = [],
  onSuccess,
  onCancel,
}) {
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    expected_outcome: "",
    category_id: "",
    priority: "Medium",
    assigned_to_user_id: "",
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [branchInfo, setBranchInfo] = useState(null);
const [branchLoading, setBranchLoading] = useState(false);

useEffect(() => {
  const loadBranchName = async () => {
    if (!user?.br_code) {
      setBranchInfo(null);
      return;
    }

    try {
      setBranchLoading(true);
      const branch = await getBranchByCode(user.br_code);
      setBranchInfo(branch || null);
    } catch (error) {
      console.error("Failed to load branch name:", error);
      setBranchInfo(null);
    } finally {
      setBranchLoading(false);
    }
  };

  loadBranchName();
}, [user?.br_code]);

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addFiles = (incoming) => {
    const accepted = Array.from(incoming || []).filter(
      (file) => file.size <= 10 * 1024 * 1024
    );
    setFiles((prev) => [...prev, ...accepted]);
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      expected_outcome: "",
      category_id: "",
      priority: "Medium",
      assigned_to_user_id: "",
    });

    setFiles([]);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    const title = form.title.trim();
    const description = form.description;
    const plainDescription = stripHtnl(description).trim();

    if (!title) {
      alert("Issue title is required");
      return;
    }

    if (!form.category_id) {
      alert("Please select issue category");
      return;
    }

    if (!plainDescription){
      alert("Description is Manditory.");
      return;
    }

    if (!form.assigned_to_user_id) {
      alert("Please select a Corporate User");
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
        assigned_to_user_id: form.assigned_to_user_id || null,
        reporter_branch_id:
          user?.branch_id ||
          user?.branchId ||
          user?.service_station_id ||
          null,
        reporter_name: user?.name || user?.email || null,
        reporter_email: user?.email || null,
      });

      const issue = res?.data?.issue;

      if (issue?.id && files.length) {
        for (const file of files) {
          await uploadBranchIssueAttachment(issue.id, file);
        }
      }

      resetForm();

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
            disabled={loading}
          />
          <small>Summarize the issue in a few words.</small>
        </div>

        <div className="it-form-field">
          <label>
            Category <span>*</span>
          </label>
          <select
            value={form.category_id}
            onChange={(e) => update("category_id", e.target.value)}
            disabled={loading}
          >
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
          <select
            value={form.priority}
            onChange={(e) => update("priority", e.target.value)}
            disabled={loading}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div className="it-form-field">
          <label>
            Send To Corporate User <span>*</span>
          </label>
          <select
            value={form.assigned_to_user_id}
            onChange={(e) => update("assigned_to_user_id", e.target.value)}
            disabled={loading}
          >
            <option value="">Select corporate user</option>
            {corpUsers.map((corpUser) => (
              <option key={corpUser.id} value={corpUser.id}>
                {corpUser.name || corpUser.email}
                {corpUser.email ? ` (${corpUser.email})` : ""}
              </option>
            ))}
          </select>
          <small>Only users with role Corporate User are shown here.</small>
        </div>

        <div className="it-form-field it-form-wide">
          <label>Branch</label>
          <input
            disabled
            value={
              branchLoading
                ? "Loading branch..."
                : branchInfo?.name
                ? `${branchInfo.name} (${branchInfo.branch_code})`
                : user?.br_code
                ? `Branch code: ${user.br_code}`
                : "Branch not found"
            }
          />
          <small>Automatically loaded using your login branch code.</small>
        </div>

        <div className="it-form-field it-form-wide">
          <label>
            Description <span>*</span>
          </label>
          <RichTextEditor
          value ={form.description}
          disabled={loading}
          placeholder="Describe the issue in detail. Include any relevant information, steps to reproduce, and screenshots if applicable."
          onChange={(content) => update("description", content)}
          />
          <small>
            You can use bold, underline, bullets, numbering, table and links.
          </small>
        </div>

        <div className="it-form-field it-form-wide">
          <label>Expected Outcome</label>
          <textarea
            value={form.expected_outcome}
            onChange={(e) => update("expected_outcome", e.target.value)}
            placeholder="What result do you expect after this issue is solved?"
            rows={4}
            disabled={loading}
          />
        </div>
      </div>

      <div className="it-form-field it-form-wide" style={{ marginTop: 16 }}>
        <label>Attachments</label>
        <div
          className="it-dropzone"
          onClick={() => {
            if (!loading) fileRef.current?.click();
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!loading) addFiles(e.dataTransfer.files);
          }}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            hidden
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xlsx"
            onChange={(e) => addFiles(e.target.files)}
            disabled={loading}
          />
          <div className="it-drop-icon">⇧</div>
          <strong>Drag & drop files here or click to browse</strong>
          <small>PNG, JPG, PDF, DOC, DOCX, XLSX. Max 10 MB per file.</small>
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
                  disabled={loading}
                  onClick={() =>
                    setFiles((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="it-form-footer">
        <div className="it-private-note">
          🔒 Visible only to authorized issue handlers.
        </div>

        <div className="it-form-actions">
          <button
            type="button"
            className="it-btn it-btn-soft"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="it-btn it-btn-primary"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Issue"}
          </button>
        </div>
      </div>
    </form>
  );
}
