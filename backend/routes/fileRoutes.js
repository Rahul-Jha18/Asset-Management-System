const express = require("express");
const path = require("path");
const fs = require("fs");
const upload = require("../middleware/uploadMiddleware");
const { sequelize } = require("../config/db");

const router = express.Router();

/* Upload file */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const { title, category, description } = req.body;

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    const filePath = `/uploads/stored_file/${file.filename}`;

    const sql = `
      INSERT INTO stored_files
      (title, original_name, stored_name, file_path, mime_type, category, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await sequelize.query(sql, {
      replacements: [
        title || file.originalname,
        file.originalname,
        file.filename,
        filePath,
        file.mimetype,
        category || null,
        description || null,
      ],
    });

    return res.status(201).json({
      message: "File uploaded successfully",
      data: {
        id: result.insertId,
        title: title || file.originalname,
        original_name: file.originalname,
        stored_name: file.filename,
        file_path: filePath,
        mime_type: file.mimetype,
        category: category || null,
        description: description || null,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
});

/* Get all files */
router.get("/", async (req, res) => {
  try {
    const [rows] = await sequelize.query(`
      SELECT * FROM stored_files
      ORDER BY created_at DESC
    `);

    return res.json({ data: rows });
  } catch (error) {
    console.error("Fetch files error:", error);
    return res.status(500).json({
      message: "Failed to fetch files",
      error: error.message,
    });
  }
});

/* Get single file */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT * FROM stored_files WHERE id = ? LIMIT 1`,
      {
        replacements: [req.params.id],
      }
    );

    if (!rows.length) {
      return res.status(404).json({ message: "File not found" });
    }

    return res.json({ data: rows[0] });
  } catch (error) {
    console.error("Fetch file error:", error);
    return res.status(500).json({
      message: "Failed to fetch file",
      error: error.message,
    });
  }
});

/* Download file */
router.get("/download/:id", async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT * FROM stored_files WHERE id = ? LIMIT 1`,
      {
        replacements: [req.params.id],
      }
    );

    if (!rows.length) {
      return res.status(404).json({ message: "File not found" });
    }

    const file = rows[0];

    const physicalPath = path.join(
      process.cwd(),
      file.file_path.replace(/^\/+/, "")
    );

    if (!fs.existsSync(physicalPath)) {
      return res.status(404).json({ message: "Physical file not found on server" });
    }

    return res.download(physicalPath, file.original_name);
  } catch (error) {
    console.error("Download file error:", error);
    return res.status(500).json({
      message: "Download failed",
      error: error.message,
    });
  }
});

/* Delete file */
router.delete("/:id", async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT * FROM stored_files WHERE id = ? LIMIT 1`,
      {
        replacements: [req.params.id],
      }
    );

    if (!rows.length) {
      return res.status(404).json({ message: "File not found" });
    }

    const file = rows[0];

    const physicalPath = path.join(
      process.cwd(),
      file.file_path.replace(/^\/+/, "")
    );

    if (fs.existsSync(physicalPath)) {
      fs.unlinkSync(physicalPath);
    }

    await sequelize.query(`DELETE FROM stored_files WHERE id = ?`, {
      replacements: [req.params.id],
    });

    return res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    return res.status(500).json({
      message: "Delete failed",
      error: error.message,
    });
  }
});

module.exports = router;