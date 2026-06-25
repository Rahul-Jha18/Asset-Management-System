"use strict";

const CATEGORIES = [
  {
    name: "Policy Administration System",
    code: "PAS",
    default_sla_hours: 24,
    sort_order: 1,
  },
  {
    name: "Premium & Collection",
    code: "PAC",
    default_sla_hours: 24,
    sort_order: 2,
  },
  {
    name: "Claims Processing",
    code: "CLM",
    default_sla_hours: 12,
    sort_order: 3,
  },
  {
    name: "Agent & Agency Management",
    code: "AAM",
    default_sla_hours: 48,
    sort_order: 4,
  },
  {
    name: "Reporting / MIS",
    code: "MIS",
    default_sla_hours: 48,
    sort_order: 5,
  },
  {
    name: "User Access & Permissions",
    code: "UAP",
    default_sla_hours: 8,
    sort_order: 6,
  },
  {
    name: "Network & Connectivity",
    code: "NET",
    default_sla_hours: 4,
    sort_order: 7,
  },
  {
    name: "Hardware & Peripherals",
    code: "HWP",
    default_sla_hours: 48,
    sort_order: 8,
  },
  {
    name: "Email & Communication",
    code: "EML",
    default_sla_hours: 8,
    sort_order: 9,
  },
  {
    name: "Printing & Documents",
    code: "PRN",
    default_sla_hours: 24,
    sort_order: 10,
  },
];

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();

    const rows = CATEGORIES.map((category) => ({
      ...category,
      description: null,
      is_active: true,
      created_at: now,
    }));

    await queryInterface.bulkInsert("branch_issue_categories", rows, {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("branch_issue_categories", null, {});
  },
};