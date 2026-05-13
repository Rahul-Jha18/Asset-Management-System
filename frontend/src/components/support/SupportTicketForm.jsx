import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { submitSupportTicket } from "../../services/supportApi";

const ASSET_GROUPS = [
  { id: "", name: "Select" },
  { id: "H", name: "Hardware" },
  { id: "S", name: "Software" },
  { id: "L", name: "Software Licenses" },
  { id: "I", name: "Internet & VPN" },
  { id: "C", name: "Services" },
];

const ASSET_SUB_CATEGORIES = [
  { code: "DC", group: "H", name: "Desktop Computer" },
  { code: "LC", group: "H", name: "Laptop" },
  { code: "MO", group: "H", name: "Monitor" },
  { code: "FR", group: "H", name: "Firewall Router Device" },
  { code: "NS", group: "H", name: "Network Switches" },
  { code: "CC", group: "H", name: "CCTV Camera" },
  { code: "CR", group: "H", name: "NVR of CCTV" },
  { code: "PR", group: "H", name: "Printers" },
  { code: "SC", group: "H", name: "Scanners" },
  { code: "BD", group: "H", name: "Biometric Devices" },
  { code: "IP", group: "H", name: "IP Phone" },
  { code: "PJ", group: "H", name: "Projectors" },
  { code: "IB", group: "H", name: "Interactive Board" },
  { code: "UP", group: "H", name: "UPS" },
  { code: "BT", group: "H", name: "Battery of UPS" },
  { code: "WL", group: "L", name: "Windows OS Licenses" },
  { code: "WS", group: "L", name: "Windows Server Licenses" },
  { code: "AL", group: "L", name: "Application Software Licenses" },
  { code: "IN", group: "I", name: "Internet" },
  { code: "VP", group: "I", name: "VPN" },
  { code: "MS", group: "S", name: "Maintenance Service" },
];

const ISSUE_TYPES = [
  "Issue",
  "Change Request",
  "Installation",
  "Access Request",
  "Replacement",
  "Procurement",
  "Maintenance",
  "Other",
];

const PRIORITIES = ["Low", "Medium", "High", "Critical"];

const SUBCODE_TO_SECTION = {
  DC: "desktop",
  DT: "desktop",
  LC: "laptop",
  LP: "laptop",
  PR: "printer",
  SC: "scanner",
  PJ: "projector",
  PN: "panel",
  IP: "ipphone",
  CC: "cctv",
  CV: "cctv",
  IN: "connectivity",
  UP: "ups",
  SR: "server",
  SVR: "server",
  FR: "firewall_router",
  EA: "extra_asset",
  EX: "extra_asset",
  AL: "application_software",
  OF: "office_software",
  BR: "utility_software",
  SE: "security_software",
  SI: "security_software_installed",
  MS: "services",
  L: "licenses",
  LS: "licenses",
  WL: "windows_os",
  WS: "windows_servers",
};

const SECTION_PLURAL = {
  desktop: "desktops",
  laptop: "laptops",
  printer: "printers",
  scanner: "scanners",
  projector: "projectors",
  panel: "panels",
  ipphone: "ipphones",
  cctv: "cctvs",
  server: "servers",
  firewall_router: "firewall-routers",
  extra_asset: "extra-assets",
  connectivity: "connectivity",
  ups: "ups",
  application_software: "application-software",
  office_software: "office-software",
  utility_software: "utility-software",
  security_software: "security-software",
  security_software_installed: "security-software-installed",
  services: "services",
  licenses: "licenses",
  windows_os: "windows-os",
  windows_servers: "windows-servers",
};

const getAssetLabel = (section, obj) => {
  if (!obj) return "";
  const id = obj.assetId ?? obj.asset_id ?? obj.id ?? "";
  const name =
    obj.asset_name ||
    obj.software_name ||
    obj.product_name ||
    obj.license_name ||
    obj.service_name ||
    obj.server_name ||
    obj.scanner_name ||
    obj.projector_name ||
    obj.printer_name ||
    obj.panel_name ||
    obj.desktop_ids ||
    obj.ip_telephone_ext_no ||
    obj.ups_model ||
    obj.connectivity_network ||
    "";
  const brand =
    obj.desktop_brand ||
    obj.laptop_brand ||
    obj.panel_brand ||
    obj.cctv_brand ||
    obj.brand ||
    "";
  const assignedUser =
    obj.userName ||
    obj.laptop_user ||
    obj.assigned_user ||
    obj.panel_user ||
    "";

  const parts = [brand, name, assignedUser].filter(Boolean).join(" · ");
  return id ? `${id}${parts ? ` — ${parts}` : ""}` : parts || "Unknown";
};

const initialForm = (user) => ({
  name: user?.name || "",
  email: user?.email || "",
  contact_no: "",
  branch_id: "",
  branch_name: "",
  type: "",
  category: "",
  sub_category: "",
  issue_type: "Issue",
  asset_id: "",
  asset_label: "",
  priority: "Medium",
  subject: "",
  message: "",
  location_note: "",
  requested_change: "",
});

function Label({ children }) {
  return (
    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
      {children}
    </label>
  );
}

export default function SupportTicketForm({ user, onSuccess }) {
  const [form, setForm] = useState(initialForm(user));
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [assetPickerGroup, setAssetPickerGroup] = useState("");
  const [assetPickerSubCat, setAssetPickerSubCat] = useState("");
  const [assetItems, setAssetItems] = useState([]);
  const [assetItemsLoading, setAssetItemsLoading] = useState(false);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const assetPickerSubCats = useMemo(() => {
    if (!assetPickerGroup) return ASSET_SUB_CATEGORIES;
    return ASSET_SUB_CATEGORIES.filter((s) => s.group === assetPickerGroup);
  }, [assetPickerGroup]);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await api.get("/api/branches", {
        params: { page: 1, limit: 5000 },
      });
      const payload = res?.data?.data ?? res?.data ?? [];
      setBranches(Array.isArray(payload) ? payload : []);
    } catch {
      setBranches([]);
    }
  }, []);

  const fetchAssetItems = useCallback(async (branchId, subCatCode) => {
    if (!branchId || !subCatCode) {
      setAssetItems([]);
      return;
    }

    const section = SUBCODE_TO_SECTION[String(subCatCode).toUpperCase()];
    const plural = section ? SECTION_PLURAL[section] : null;

    if (!plural) {
      setAssetItems([]);
      return;
    }

    setAssetItemsLoading(true);
    try {
      const res = await api.get(`/api/branches/${branchId}/${plural}`);
      const raw = res?.data?.data ?? res?.data ?? [];
      const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];

      setAssetItems(
        arr.map((obj) => ({
          value: obj.assetId ?? obj.asset_id ?? obj.id ?? "",
          label: getAssetLabel(section, obj),
          raw: obj,
        }))
      );
    } catch {
      setAssetItems([]);
    } finally {
      setAssetItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    if (form.branch_id && assetPickerSubCat) {
      fetchAssetItems(form.branch_id, assetPickerSubCat);
    } else {
      setAssetItems([]);
    }
  }, [form.branch_id, assetPickerSubCat, fetchAssetItems]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await submitSupportTicket({
        ...form,
        branch_id: form.branch_id ? Number(form.branch_id) : null,
      });

      setForm(initialForm(user));
      setAssetPickerGroup("");
      setAssetPickerSubCat("");
      setAssetItems([]);

      onSuccess?.();
    } catch (err) {
      alert(err?.response?.data?.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-rose-600 px-6 py-5 text-white">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">
            Nepal Life Support Desk
          </div>
          <h2 className="mt-1 text-2xl font-extrabold">Submit Support Ticket</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/85">
            Fill in the issue details. New tickets are routed to the branch sub-admin first,
            then escalated to admin when forwarded.
          </p>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Your Name *</Label>
              <input
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Your Email *</Label>
              <input
                type="email"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Contact No.</Label>
              <input
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500"
                value={form.contact_no}
                onChange={(e) => setField("contact_no", e.target.value)}
                placeholder="98XXXXXXXX / extension"
              />
            </div>

            <div>
              <Label>Issue Type *</Label>
              <select
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500"
                value={form.issue_type}
                onChange={(e) => setField("issue_type", e.target.value)}
              >
                {ISSUE_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>Branch *</Label>
            <select
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500"
              value={form.branch_id}
              onChange={(e) => {
                const branchId = e.target.value;
                const branch = branches.find((b) => String(b.id) === String(branchId));

                setForm((prev) => ({
                  ...prev,
                  branch_id: branchId,
                  branch_name: branch?.name || "",
                  type: "",
                  category: "",
                  sub_category: "",
                  asset_id: "",
                  asset_label: "",
                }));

                setAssetPickerGroup("");
                setAssetPickerSubCat("");
                setAssetItems([]);
              }}
              required
            >
              <option value="">— Select Branch —</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-slate-50 p-5">
            <div className="mb-4">
              <h3 className="text-lg font-extrabold text-slate-900">Asset Selection</h3>
              <p className="mt-1 text-sm text-slate-500">
                Select branch, asset group, sub-category, and the exact asset.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div>
                <Label>Asset Group *</Label>
                <select
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 disabled:bg-slate-100"
                  value={assetPickerGroup}
                  disabled={!form.branch_id}
                  onChange={(e) => {
                    const group = e.target.value;
                    setAssetPickerGroup(group);
                    setAssetPickerSubCat("");
                    setAssetItems([]);

                    setForm((prev) => ({
                      ...prev,
                      type: group,
                      category: group,
                      sub_category: "",
                      asset_id: "",
                      asset_label: "",
                    }));
                  }}
                >
                  <option value="">— Select Group —</option>
                  {ASSET_GROUPS.filter((g) => g.id).map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Sub Category *</Label>
                <select
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 disabled:bg-slate-100"
                  value={assetPickerSubCat}
                  disabled={!assetPickerGroup || !form.branch_id}
                  onChange={(e) => {
                    const code = e.target.value;
                    const sub = ASSET_SUB_CATEGORIES.find((s) => s.code === code);

                    setAssetPickerSubCat(code);
                    setAssetItems([]);

                    setForm((prev) => ({
                      ...prev,
                      sub_category: sub?.name || "",
                      asset_id: "",
                      asset_label: "",
                    }));

                    if (code && form.branch_id) {
                      fetchAssetItems(form.branch_id, code);
                    }
                  }}
                >
                  <option value="">— Select Sub Category —</option>
                  {assetPickerSubCats.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Asset *</Label>
                <select
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 disabled:bg-slate-100"
                  value={form.asset_id}
                  disabled={!assetPickerSubCat || assetItemsLoading}
                  onChange={(e) => {
                    const selected = assetItems.find(
                      (item) => String(item.value) === String(e.target.value)
                    );

                    setForm((prev) => ({
                      ...prev,
                      asset_id: e.target.value,
                      asset_label: selected?.label || "",
                    }));
                  }}
                >
                  <option value="">
                    {assetItemsLoading
                      ? "Fetching assets..."
                      : assetItems.length === 0
                      ? "No assets found"
                      : "— Select Asset —"}
                  </option>
                  {assetItems.map((item, i) => (
                    <option key={item.value || i} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {form.asset_label && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                Selected Asset: {form.asset_label}
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Priority *</Label>
              <select
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500"
                value={form.priority}
                onChange={(e) => setField("priority", e.target.value)}
              >
                {PRIORITIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Location Note</Label>
              <input
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500"
                value={form.location_note}
                onChange={(e) => setField("location_note", e.target.value)}
                placeholder="Floor / room / desk"
              />
            </div>
          </div>

          <div>
            <Label>Subject *</Label>
            <input
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500"
              value={form.subject}
              onChange={(e) => setField("subject", e.target.value)}
              required
              placeholder="Brief issue title"
            />
          </div>

          <div>
            <Label>Requested Change</Label>
            <textarea
              rows={4}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500"
              value={form.requested_change}
              onChange={(e) => setField("requested_change", e.target.value)}
              placeholder="What should be changed, fixed, replaced, or updated?"
            />
          </div>

          <div>
            <Label>Detailed Message *</Label>
            <textarea
              rows={6}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500"
              value={form.message}
              onChange={(e) => setField("message", e.target.value)}
              required
              placeholder="Describe the issue clearly"
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Your ticket will be assigned to the branch <span className="font-bold">sub-admin</span> first.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-rose-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Support Ticket"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}