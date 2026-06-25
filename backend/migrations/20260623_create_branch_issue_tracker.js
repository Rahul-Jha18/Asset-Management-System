"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("branch_issue_categories", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      name: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },

      code: {
        type: Sequelize.STRING(60),
        allowNull: false,
        unique: true,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      default_sla_hours: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 48,
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable("branch_issues", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      ticket_no: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },

      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      expected_outcome: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "branch_issue_categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      priority: {
        type: Sequelize.ENUM("Low", "Medium", "High", "Critical"),
        allowNull: false,
        defaultValue: "Medium",
      },

      status: {
        type: Sequelize.ENUM("Open", "UnderReview", "Closed"),
        allowNull: false,
        defaultValue: "Open",
      },

      reporter_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      reporter_branch_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      reporter_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      reporter_email: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      assigned_to_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      due_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      closed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      is_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable("branch_issue_attachments", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      issue_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "branch_issues",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      original_file_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      stored_file_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      content_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      file_size_bytes: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      storage_path: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      uploaded_by_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable("branch_issue_messages", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      issue_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "branch_issues",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      sender_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      sender_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      sender_role: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },

      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      is_internal: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable("branch_issue_activity_logs", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      issue_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "branch_issues",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      actor_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      actor_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      action: {
        type: Sequelize.ENUM(
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

      old_status: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },

      new_status: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },

      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex("branch_issues", ["ticket_no"]);
    await queryInterface.addIndex("branch_issues", ["reporter_branch_id"]);
    await queryInterface.addIndex("branch_issues", ["status"]);
    await queryInterface.addIndex("branch_issues", ["priority"]);
    await queryInterface.addIndex("branch_issues", ["category_id"]);
    await queryInterface.addIndex("branch_issue_messages", ["issue_id"]);
    await queryInterface.addIndex("branch_issue_attachments", ["issue_id"]);
    await queryInterface.addIndex("branch_issue_activity_logs", ["issue_id"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("branch_issue_activity_logs");
    await queryInterface.dropTable("branch_issue_messages");
    await queryInterface.dropTable("branch_issue_attachments");
    await queryInterface.dropTable("branch_issues");
    await queryInterface.dropTable("branch_issue_categories");

    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_branch_issues_priority;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_branch_issues_status;");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_branch_issue_activity_logs_action;");
  },
};