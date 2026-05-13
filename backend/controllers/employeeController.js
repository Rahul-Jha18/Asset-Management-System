// controllers/employeeController.js
const { Op } = require("sequelize");
const Employee = require("../models/Employee");

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const { search, branch, status, department } = req.query;

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { employee_code: { [Op.like]: `%${search}%` } },
        { department: { [Op.like]: `%${search}%` } },
        { designation: { [Op.like]: `%${search}%` } },
      ];
    }

    if (branch) {
      whereClause.branch = branch;
    }

    if (status) {
      whereClause.status = status;
    }

    if (department) {
      whereClause.department = department;
    }

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

// Get single employee
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("getEmployeeById error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employee",
      error: error.message,
    });
  }
};

// Create employee
const createEmployee = async (req, res) => {
  try {
    const {
      employee_code,
      full_name,
      email,
      department,
      designation,
      phone,
      branch,
      status,
    } = req.body;

    if (!employee_code || !full_name) {
      return res.status(400).json({
        success: false,
        message: "employee_code and full_name are required",
      });
    }

    // Check for duplicate employee_code
    const existing = await Employee.findOne({ where: { employee_code } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Employee code "${employee_code}" already exists`,
      });
    }

    const employee = await Employee.create({
      employee_code,
      full_name,
      email: email || null,
      department: department || null,
      designation: designation || null,
      phone: phone || null,
      branch: branch || null,
      status: status || "active",
    });

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    console.error("createEmployee error:", error);
    // Sequelize unique constraint
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

// Bulk import employees from parsed Excel rows
const importEmployees = async (req, res) => {
  try {
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No rows provided for import",
      });
    }

    let inserted = 0;
    let updated = 0;
    let failed = 0;
    const errors = [];

    for (const row of rows) {
      try {
        const {
          employee_code,
          full_name,
          email,
          department,
          designation,
          phone,
          branch,
          status,
        } = row;

        if (!employee_code || !full_name) {
          failed++;
          errors.push(`Missing employee_code or full_name: ${JSON.stringify(row)}`);
          continue;
        }

        const [emp, created] = await Employee.findOrCreate({
          where: { employee_code: String(employee_code).trim() },
          defaults: {
            full_name: String(full_name).trim(),
            email: email ? String(email).trim() : null,
            department: department ? String(department).trim() : null,
            designation: designation ? String(designation).trim() : null,
            phone: phone ? String(phone).trim() : null,
            branch: branch ? String(branch).trim() : null,
            status: status || "active",
          },
        });

        if (created) {
          inserted++;
        } else {
          await emp.update({
            full_name: String(full_name).trim(),
            email: email ? String(email).trim() : emp.email,
            department: department ? String(department).trim() : emp.department,
            designation: designation ? String(designation).trim() : emp.designation,
            phone: phone ? String(phone).trim() : emp.phone,
            branch: branch ? String(branch).trim() : emp.branch,
            status: status || emp.status,
          });
          updated++;
        }
      } catch (rowErr) {
        failed++;
        errors.push(rowErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Import complete: ${inserted} inserted, ${updated} updated, ${failed} failed`,
      data: { inserted, updated, failed, errors: errors.slice(0, 10) },
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

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    await employee.update(req.body);

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    console.error("updateEmployee error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update employee",
      error: error.message,
    });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
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

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  importEmployees,
};