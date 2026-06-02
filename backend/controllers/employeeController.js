// controllers/employeeController.js
const { Op } = require("sequelize");
const Employee = require("../models/Employee");

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const setNoCache = (res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
};

const cleanValue = (value) => {
  if (value === undefined || value === null) return null;
  const cleaned = String(value).trim();
  return cleaned.length > 0 ? cleaned : null;
};

const cleanStatus = (value) => {
  const status = cleanValue(value)?.toLowerCase();
  return status === "inactive" ? "inactive" : "active";
};

/* ─────────────────────────────────────────────
   GET /api/employees
   Returns all employees (with optional server-side filters)
───────────────────────────────────────────── */
const getAllEmployees = async (req, res) => {
  try {
    setNoCache(res);

    const { search, branch, status, department } = req.query;
    const whereClause = {};

    if (search) {
      const searchText = `%${String(search).trim()}%`;
      whereClause[Op.or] = [
        { full_name:     { [Op.like]: searchText } },
        { email:         { [Op.like]: searchText } },
        { employee_code: { [Op.like]: searchText } },
        { department:    { [Op.like]: searchText } },
        { designation:   { [Op.like]: searchText } },
        { phone:         { [Op.like]: searchText } },
        { branch:        { [Op.like]: searchText } },
      ];
    }

    if (branch)     whereClause.branch     = String(branch).trim();
    if (status)     whereClause.status     = String(status).trim().toLowerCase();
    if (department) whereClause.department = String(department).trim();

    const employees = await Employee.findAll({
      where: whereClause,
      order: [["full_name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error("getAllEmployees error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
};

/* ─────────────────────────────────────────────
   GET /api/employees/export
   Returns all employees as a flat JSON array
   formatted for Excel export (same column order
   as the frontend EXCEL_COLUMNS constant).
───────────────────────────────────────────── */
const exportEmployees = async (req, res) => {
  try {
    setNoCache(res);

    const { branch, status, department } = req.query;
    const whereClause = {};

    if (branch)     whereClause.branch     = String(branch).trim();
    if (status)     whereClause.status     = String(status).trim().toLowerCase();
    if (department) whereClause.department = String(department).trim();

    const employees = await Employee.findAll({
      where: whereClause,
      order: [["full_name", "ASC"]],
      attributes: [
        "employee_code",
        "full_name",
        "email",
        "department",
        "designation",
        "phone",
        "branch",
        "status",
      ],
    });

    // Return plain array — the frontend will turn this into an Excel file
    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees.map((e) => ({
        "Employee Code": e.employee_code || "",
        "Full Name":     e.full_name     || "",
        "Email":         e.email         || "",
        "Department":    e.department    || "",
        "Designation":   e.designation   || "",
        "Phone":         e.phone         || "",
        "Branch":        e.branch        || "",
        "Status":        e.status        || "active",
      })),
    });
  } catch (error) {
    console.error("exportEmployees error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export employees",
      error: error.message,
    });
  }
};

/* ─────────────────────────────────────────────
   GET /api/employees/:id
───────────────────────────────────────────── */
const getEmployeeById = async (req, res) => {
  try {
    setNoCache(res);

    const { id } = req.params;
    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    return res.status(200).json({ success: true, data: employee });
  } catch (error) {
    console.error("getEmployeeById error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employee",
      error: error.message,
    });
  }
};

/* ─────────────────────────────────────────────
   POST /api/employees
   Create a single employee
───────────────────────────────────────────── */
const createEmployee = async (req, res) => {
  try {
    const {
      employee_code, full_name, email,
      department, designation, phone, branch, status,
    } = req.body;

    const cleanedCode = cleanValue(employee_code);
    const cleanedName = cleanValue(full_name);

    if (!cleanedCode || !cleanedName) {
      return res.status(400).json({
        success: false,
        message: "employee_code and full_name are required",
      });
    }

    // Duplicate check
    const existing = await Employee.findOne({ where: { employee_code: cleanedCode } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Employee code "${cleanedCode}" already exists`,
      });
    }

    const employee = await Employee.create({
      employee_code: cleanedCode,
      full_name:     cleanedName,
      email:         cleanValue(email),
      department:    cleanValue(department),
      designation:   cleanValue(designation),
      phone:         cleanValue(phone),
      branch:        cleanValue(branch),
      status:        cleanStatus(status),
    });

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    console.error("createEmployee error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Employee code or email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create employee",
      error: error.message,
    });
  }
};

/* ─────────────────────────────────────────────
   PUT /api/employees/:id
───────────────────────────────────────────── */
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const payload = {};

    if (req.body.employee_code !== undefined) {
      const code = cleanValue(req.body.employee_code);
      if (!code) return res.status(400).json({ success: false, message: "employee_code is required" });
      payload.employee_code = code;
    }

    if (req.body.full_name !== undefined) {
      const name = cleanValue(req.body.full_name);
      if (!name) return res.status(400).json({ success: false, message: "full_name is required" });
      payload.full_name = name;
    }

    if (req.body.email       !== undefined) payload.email       = cleanValue(req.body.email);
    if (req.body.department  !== undefined) payload.department  = cleanValue(req.body.department);
    if (req.body.designation !== undefined) payload.designation = cleanValue(req.body.designation);
    if (req.body.phone       !== undefined) payload.phone       = cleanValue(req.body.phone);
    if (req.body.branch      !== undefined) payload.branch      = cleanValue(req.body.branch);
    if (req.body.status      !== undefined) payload.status      = cleanStatus(req.body.status);

    await employee.update(payload);

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    console.error("updateEmployee error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Employee code or email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update employee",
      error: error.message,
    });
  }
};

/* ─────────────────────────────────────────────
   DELETE /api/employees/:id
───────────────────────────────────────────── */
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    await employee.destroy();

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("deleteEmployee error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete employee",
      error: error.message,
    });
  }
};

/* ─────────────────────────────────────────────
   POST /api/employees/import
   Upsert bulk rows from Excel.
   - Matches on employee_code (unique key)
   - Auto-generates code when missing (AUTO-0001, AUTO-0002 …)
   - Inserts if not found, updates if found
   - Returns per-row success/failure counts + error list
───────────────────────────────────────────── */
const importEmployees = async (req, res) => {
  try {
    setNoCache(res);

    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No rows provided for import",
      });
    }

    let inserted = 0;
    let updated  = 0;
    let failed   = 0;
    const errors = [];

    for (const [index, row] of rows.entries()) {
      try {
        // Accept any truthy value for code — auto-generate if still blank
        let employeeCode = cleanValue(row.employee_code);
        const fullName   = cleanValue(row.full_name);

        // If both are missing, skip
        if (!employeeCode && !fullName) {
          failed++;
          errors.push(`Row ${index + 1}: Both employee_code and full_name are empty — skipped`);
          continue;
        }

        // Auto-generate code if only name is present
        if (!employeeCode) {
          employeeCode = `AUTO-${String(index + 1).padStart(4, "0")}`;
        }

        // Use code as fallback name (rare edge case)
        const resolvedName = fullName || employeeCode;

        const payload = {
          full_name:   resolvedName,
          email:       cleanValue(row.email),
          department:  cleanValue(row.department),
          designation: cleanValue(row.designation),
          phone:       cleanValue(row.phone),
          branch:      cleanValue(row.branch),
          status:      cleanStatus(row.status),
        };

        const [employee, created] = await Employee.findOrCreate({
          where: { employee_code: employeeCode },
          defaults: { employee_code: employeeCode, ...payload },
        });

        if (created) {
          inserted++;
        } else {
          await employee.update(payload);
          updated++;
        }
      } catch (rowErr) {
        failed++;
        errors.push(`Row ${index + 1}: ${rowErr.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Import complete: ${inserted} inserted, ${updated} updated, ${failed} failed`,
      data: {
        inserted,
        updated,
        failed,
        total: rows.length,
        errors: errors.slice(0, 20),
      },
    });
  } catch (error) {
    console.error("importEmployees error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to import employees",
      error: error.message,
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  importEmployees,
  exportEmployees,   // ← new
};