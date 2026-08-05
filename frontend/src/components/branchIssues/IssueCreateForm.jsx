import React, { useEffect, useMemo, useRef, useState } from "react";
import RichTextEditor from "../common/RichTextEditor";
import {
  createBranchIssue,
  uploadBranchIssueAttachment,
} from "../../services/branchIssueApi";
import { getBranchByCode } from "../../services/branchService";

export const CUSTOMER_ISSUE_CATEGORIES = [
  "Issue",
  "Service Request",
  "Complaint",
  "Grievance",
];

const CUSTOMER_OTHER_VALUE = "__OTHER_CUSTOMER_CATEGORY__";

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

const stripHtml = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || div.innerText || "";
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

export default function IssueCreateForm({
  user,
  categories = [],
  corpUsers = [],
  customerCategories = CUSTOMER_ISSUE_CATEGORIES,
  onSuccess,
  onCancel,
}) {
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    expected_outcome: "",
    issue_type: "Employee",
    category_id: "",
    customer_category_name: "",
    custom_category_name: "",
    priority: "Medium",
    assigned_to_user_id: "",
  });

  const [corpUserSearch, setCorpUserSearch] = useState("");
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

  const selectedCorpUser = useMemo(
    () =>
      corpUsers.find(
        (corpUser) => String(corpUser.id) === String(form.assigned_to_user_id)
      ) || null,
    [corpUsers, form.assigned_to_user_id]
  );

  const filteredCorpUsers = useMemo(() => {
    const query = normalizeText(corpUserSearch);

    if (!query) return corpUsers.slice(0, 8);

    return corpUsers
      .filter((corpUser) => {
        const haystack = [
          corpUser.name,
          corpUser.email,
          corpUser.departmentName,
          corpUser.department_name,
          corpUser.role,
          corpUser.br_code,
          corpUser.emp_code,
          corpUser.service_station_id,
        ]
          .map(normalizeText)
          .join(" ");

        return haystack.includes(query);
      })
      .slice(0, 12);
  }, [corpUsers, corpUserSearch]);

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateIssueType = (issueType) => {
    setForm((prev) => ({
      ...prev,
      issue_type: issueType,
      category_id: "",
      customer_category_name: "",
      custom_category_name: "",
    }));
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
      issue_type: "Employee",
      category_id: "",
      customer_category_name: "",
      custom_category_name: "",
      priority: "Medium",
      assigned_to_user_id: "",
    });

    setCorpUserSearch("");
    setFiles([]);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const getResolvedCustomerCategory = () => {
    if (form.customer_category_name === CUSTOMER_OTHER_VALUE) {
      return form.custom_category_name.trim();
    }

    return form.customer_category_name.trim();
  };

  const submit = async (e) => {
    e.preventDefault();

    const title = form.title.trim();
    const description = form.description || "";
    const plainDescription = stripHtml(description).trim();
    const issueType = form.issue_type || "Employee";
    const customerCategoryName = getResolvedCustomerCategory();

    if (!title) {
      alert("Issue title is required");
      return;
    }

    if (issueType === "Employee" && !form.category_id) {
      alert("Please select employee issue category");
      return;
    }

    if (issueType === "Customer" && !customerCategoryName) {
      alert("Please select or enter customer issue category");
      return;
    }

    if (!plainDescription) {
      alert("Description is mandatory.");
      return;
    }

    if (!form.assigned_to_user_id) {
      alert("Please select a User");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title,
        description,
        expected_outcome: form.expected_outcome?.trim() || null,
        issue_type: issueType,

        // Existing employee issue flow.
        category_id:
          issueType === "Employee" && form.category_id
            ? Number(form.category_id)
            : null,

        // New customer issue flow. Backend must store these fields.
        customer_category_name:
          issueType === "Customer" ? customerCategoryName : null,
        custom_category_name:
          issueType === "Customer" &&
          form.customer_category_name === CUSTOMER_OTHER_VALUE
            ? customerCategoryName
            : null,
        issue_category_name:
          issueType === "Customer" ? customerCategoryName : null,

        priority: form.priority || "Medium",
        assigned_to_user_id: form.assigned_to_user_id
          ? Number(form.assigned_to_user_id)
          : null,

        reporter_branch_id:
          branchInfo?.id ??
          user?.branch_id ??
          user?.branchId ??
          user?.service_station_id ??
          null,

        reporter_name: user?.name || user?.email || null,
        reporter_email: user?.email || null,
      };

      console.log("CREATE ISSUE PAYLOAD:", payload);

      const res = await createBranchIssue(payload);

      const issue = res?.data?.issue;

      if (issue?.id && files.length) {
        for (const file of files) {
          await uploadBranchIssueAttachment(issue.id, file);
        }
      }

      resetForm();

      if (onSuccess) onSuccess(issue);
    } catch (error) {
      console.log("CREATE ISSUE ERROR:", error?.response?.data);
      console.log(
        "CREATE ISSUE ERROR FULL:",
        JSON.stringify(error?.response?.data, null, 2)
      );
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

      <div className="it-type-radio-panel">
        <label className="it-type-radio-label">Issue Type</label>

        <div className="it-type-radio-row" role="radiogroup" aria-label="Issue Type">
          <button
            type="button"
            className={`it-type-radio-card ${
              form.issue_type === "Employee" ? "active" : ""
            }`}
            onClick={() => updateIssueType("Employee")}
            disabled={loading}
          >
            <span className="it-type-radio-icon">👥</span>
            <span>
              <strong>Employee Issue</strong>
              <small>Internal branch, staff, system, asset, or operational issue.</small>
            </span>
          </button>

          <button
            type="button"
            className={`it-type-radio-card ${
              form.issue_type === "Customer" ? "active" : ""
            }`}
            onClick={() => updateIssueType("Customer")}
            disabled={loading}
          >
            <span className="it-type-radio-icon customer">👤</span>
            <span>
              <strong>Customer Issue</strong>
              <small>Customer issue, service request, complaint, or grievance.</small>
            </span>
          </button>
        </div>
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

        {form.issue_type === "Employee" ? (
          <div className="it-form-field">
            <label>
              Employee Category <span>*</span>
            </label>
            <select
              value={form.category_id}
              onChange={(e) => update("category_id", e.target.value)}
              disabled={loading}
            >
              <option value="">Select employee issue category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <small>Uses your existing issue categories.</small>
          </div>
        ) : (
          <div className="it-form-field">
            <label>
              Customer Category <span>*</span>
            </label>
            <select
              value={form.customer_category_name}
              onChange={(e) => update("customer_category_name", e.target.value)}
              disabled={loading}
            >
              <option value="">Select customer category</option>
              {customerCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <small>Select Issue, Service Request, Complaint, or Grievance.</small>
          </div>
        )}

        {form.issue_type === "Customer" &&
          form.customer_category_name === CUSTOMER_OTHER_VALUE && (
            <div className="it-form-field it-form-wide">
              <label>
                Required Category Not in List <span>*</span>
              </label>
              <input
                value={form.custom_category_name}
                onChange={(e) => update("custom_category_name", e.target.value)}
                placeholder="Example: Customer mobile number update issue"
                disabled={loading}
              />
              <small>This will be saved as the customer issue category.</small>
            </div>
          )}

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

        <div className="it-form-field it-form-wide">
          <label>
            Assign To User <span>*</span>
          </label>

          <div className="it-user-picker">
            <div className="it-user-picker-search">
              <span>⌕</span>
              <input
                value={corpUserSearch}
                onChange={(e) => setCorpUserSearch(e.target.value)}
                placeholder="Search user by name, email, role, branch, or employee code"
                disabled={loading}
              />
            </div>

            <div className="it-user-picker-table">
              <div className="it-user-picker-head">
                <span>User</span>
                <span>Email</span>
                <span>Select</span>
              </div>

              {filteredCorpUsers.length === 0 ? (
                <div className="it-user-picker-empty">
                  No user found.
                </div>
              ) : (
                filteredCorpUsers.map((corpUser) => {
                  const active =
                    String(corpUser.id) === String(form.assigned_to_user_id);

                  return (
                    <button
                      type="button"
                      className={`it-user-picker-row ${active ? "active" : ""}`}
                      key={corpUser.id}
                      onClick={() => update("assigned_to_user_id", corpUser.id)}
                      disabled={loading}
                    >
                      <span>
                        <strong>{corpUser.name || corpUser.email}</strong>
                        <small>
                          {corpUser.departmentName ||
                            corpUser.department_name ||
                            corpUser.role ||
                            "User"}
                        </small>
                      </span>

                      <span className="it-user-picker-email">
                        {corpUser.email || "—"}
                      </span>

                      <span className="it-user-picker-select">
                        {active ? "Selected" : "Select"}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {selectedCorpUser && (
              <div className="it-user-selected">
                <span>✓</span>
                <div>
                  <strong>{selectedCorpUser.name || selectedCorpUser.email}</strong>
                  <small>{selectedCorpUser.email || "Selected user"}</small>
                </div>
              </div>
            )}
          </div>

          <small>All users from the user table are shown here.</small>
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
            value={form.description}
            disabled={loading}
            placeholder={
              form.issue_type === "Customer"
                ? "Describe the customer issue. Include policy number, customer concern, service impact, and action needed where applicable."
                : "Describe the issue in detail. Include relevant information, steps to reproduce, and screenshots if applicable."
            }
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

            if (!loading) {
              addFiles(e.dataTransfer.files);
            }
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
            disabled={loading || branchLoading}
          >
            {loading
              ? "Submitting..."
              : branchLoading
              ? "Loading Branch..."
              : "Submit Issue"}
          </button>
        </div>
      </div>
    </form>
  );
}
