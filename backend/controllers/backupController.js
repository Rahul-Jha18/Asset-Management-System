// backend/controllers/backupController.js
const fs = require("fs");
const os = require("os");
const path = require("path");
const util = require("util");
const { execFile } = require("child_process");

const execFileAsync = util.promisify(execFile);

exports.downloadBackup = async (req, res) => {
  const {
    MYSQL_HOST,
    MYSQL_PORT = "3307",
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_DB,
    MYSQLDUMP_PATH = "C:\\xampp\\mysql\\bin\\mysqldump.exe",
  } = process.env;

  if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_DB) {
    return res.status(500).json({
      message: "Database environment variables are missing",
      debug: {
        MYSQL_HOST: !!MYSQL_HOST,
        MYSQL_PORT,
        MYSQL_USER: !!MYSQL_USER,
        MYSQL_DB: !!MYSQL_DB,
        MYSQLDUMP_PATH,
      },
    });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `backup-${MYSQL_DB}-${timestamp}.sql`;
  const tempFilePath = path.join(os.tmpdir(), fileName);

  try {
    if (!fs.existsSync(MYSQLDUMP_PATH)) {
      return res.status(500).json({
        message: "mysqldump.exe not found",
        path: MYSQLDUMP_PATH,
      });
    }

    const dumpArgs = [
      `--host=${MYSQL_HOST}`,
      `--port=${MYSQL_PORT}`,
      `--user=${MYSQL_USER}`,
      "--single-transaction",
      "--routines",
      "--triggers",
      // "--events", // removed because user has no SHOW EVENTS permission
      "--add-drop-table",
      "--default-character-set=utf8mb4",
      MYSQL_DB,
    ];

    const env = {
      ...process.env,
      MYSQL_PWD: MYSQL_PASSWORD || "",
    };

    const result = await execFileAsync(MYSQLDUMP_PATH, dumpArgs, {
      env,
      maxBuffer: 1024 * 1024 * 150,
      windowsHide: true,
    });

    if (result.stderr) {
      console.log("mysqldump stderr:", result.stderr);
    }

    if (!result.stdout || !result.stdout.trim()) {
      return res.status(500).json({
        message: "mysqldump returned empty output",
        stderr: result.stderr || null,
      });
    }

    fs.writeFileSync(tempFilePath, result.stdout, "utf8");

    res.setHeader("Content-Type", "application/sql");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    const stream = fs.createReadStream(tempFilePath);

    stream.on("close", () => {
      fs.unlink(tempFilePath, () => {});
    });

    stream.on("error", (err) => {
      console.error("Backup stream error:", err);
      if (fs.existsSync(tempFilePath)) {
        fs.unlink(tempFilePath, () => {});
      }
      if (!res.headersSent) {
        return res.status(500).json({
          message: "Failed to stream backup file",
        });
      }
    });

    stream.pipe(res);
  } catch (error) {
    console.error("========== BACKUP ERROR ==========");
    console.error("message:", error.message);
    console.error("code:", error.code);
    console.error("stderr:", error.stderr);
    console.error("stdout:", error.stdout);
    console.error("stack:", error.stack);
    console.error("==================================");

    if (fs.existsSync(tempFilePath)) {
      fs.unlink(tempFilePath, () => {});
    }

    return res.status(500).json({
      message: "Backup generation failed",
      error: error.message || null,
      code: error.code || null,
      stderr: error.stderr || null,
      stdout: error.stdout || null,
      mysqldumpPath: MYSQLDUMP_PATH,
      dbName: MYSQL_DB,
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
    });
  }
};