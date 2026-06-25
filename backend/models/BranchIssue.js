const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

/* ─────────────────────────────────────────────────────────────
   1. CATEGORY
───────────────────────────────────────────────────────────── */
const BranchIssueCategory = sequelize.define(
  "BranchIssueCategory",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    code: { type: DataTypes.STRING(60), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    default_sla_hours: { type: DataTypes.INTEGER, defaultValue: 48 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "branch_issue_categories",
    timestamps: false,
  }
);

/* ─────────────────────────────────────────────────────────────
   2. ISSUE
───────────────────────────────────────────────────────────── */
const BranchIssue = sequelize.define(
  "BranchIssue",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    ticket_no: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    expected_outcome: { type: DataTypes.TEXT, allowNull: true },
    category_id: { type: DataTypes.INTEGER, allowNull: true },
    priority: {
      type: DataTypes.ENUM("Low", "Medium", "High", "Critical"),
      defaultValue: "Medium",
    },
    status: {
      type: DataTypes.ENUM("Open", "UnderReview", "Closed"),
      defaultValue: "Open",
    },
    reporter_user_id: { type: DataTypes.INTEGER, allowNull: true },
    reporter_branch_id: { type: DataTypes.INTEGER, allowNull: true },
    reporter_name: { type: DataTypes.STRING, allowNull: true },
    reporter_email: { type: DataTypes.STRING, allowNull: true },
    assigned_to_user_id: { type: DataTypes.INTEGER, allowNull: true },
    due_at: { type: DataTypes.DATE, allowNull: true },
    closed_at: { type: DataTypes.DATE, allowNull: true },
    is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: "branch_issues",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

/* ─────────────────────────────────────────────────────────────
   3. ATTACHMENT
───────────────────────────────────────────────────────────── */
const BranchIssueAttachment = sequelize.define(
  "BranchIssueAttachment",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    issue_id: { type: DataTypes.INTEGER, allowNull: false },
    original_file_name: { type: DataTypes.STRING, allowNull: false },
    stored_file_name: { type: DataTypes.STRING, allowNull: false },
    content_type: { type: DataTypes.STRING, allowNull: true },
    file_size_bytes: { type: DataTypes.INTEGER, allowNull: true },
    storage_path: { type: DataTypes.STRING, allowNull: false },
    uploaded_by_user_id: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "branch_issue_attachments",
    timestamps: false,
  }
);

/* ─────────────────────────────────────────────────────────────
   4. MESSAGE
───────────────────────────────────────────────────────────── */
const BranchIssueMessage = sequelize.define(
  "BranchIssueMessage",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    issue_id: { type: DataTypes.INTEGER, allowNull: false },
    sender_user_id: { type: DataTypes.INTEGER, allowNull: true },
    sender_name: { type: DataTypes.STRING, allowNull: true },
    sender_role: { type: DataTypes.STRING(30), allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: false },
    is_internal: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "branch_issue_messages",
    timestamps: false,
  }
);

/* ─────────────────────────────────────────────────────────────
   5. ACTIVITY LOG
───────────────────────────────────────────────────────────── */
const BranchIssueActivityLog = sequelize.define(
  "BranchIssueActivityLog",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    issue_id: { type: DataTypes.INTEGER, allowNull: false },
    actor_user_id: { type: DataTypes.INTEGER, allowNull: true },
    actor_name: { type: DataTypes.STRING, allowNull: true },
    action: {
      type: DataTypes.ENUM(
        "Created",
        "StatusChanged",
        "MessageAdded",
        "AttachmentAdded",
        "Assigned",
        "Closed",
        "Reopened"
      ),
      allowNull: false,
    },
    old_status: { type: DataTypes.STRING(30), allowNull: true },
    new_status: { type: DataTypes.STRING(30), allowNull: true },
    remarks: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "branch_issue_activity_logs",
    timestamps: false,
  }
);

/* ─────────────────────────────────────────────────────────────
   ASSOCIATIONS
───────────────────────────────────────────────────────────── */
BranchIssue.belongsTo(BranchIssueCategory, {
  foreignKey: "category_id",
  as: "category",
});

BranchIssueCategory.hasMany(BranchIssue, {
  foreignKey: "category_id",
  as: "issues",
});

BranchIssue.hasMany(BranchIssueAttachment, {
  foreignKey: "issue_id",
  as: "attachments",
});

BranchIssue.hasMany(BranchIssueMessage, {
  foreignKey: "issue_id",
  as: "messages",
});

BranchIssue.hasMany(BranchIssueActivityLog, {
  foreignKey: "issue_id",
  as: "logs",
});

BranchIssueAttachment.belongsTo(BranchIssue, { foreignKey: "issue_id" });
BranchIssueMessage.belongsTo(BranchIssue, { foreignKey: "issue_id" });
BranchIssueActivityLog.belongsTo(BranchIssue, { foreignKey: "issue_id" });

module.exports = {
  BranchIssue,
  BranchIssueCategory,
  BranchIssueAttachment,
  BranchIssueMessage,
  BranchIssueActivityLog,
};
