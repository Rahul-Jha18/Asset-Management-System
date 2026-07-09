// src/services/branchService.js
import api from "./api";

export const getBranches = async () => {
  const res = await api.get("/api/branches?page=1&limit=500");
  return res.data?.data || res.data?.rows || [];
};

export const getBranchByCode = async (branchCode) => {
  const branches = await getBranches();

  return branches.find(
    (branch) =>
      String(branch.branch_code || "").trim() ===
      String(branchCode || "").trim()
  );
};

export default { getBranches, getBranchByCode };