const asyncHandler = require("express-async-handler");
const { exec } = require("child_process");
const { Op } = require("sequelize");

const AssetTrackingProfile = require("../models/AssetTrackingProfile");
const AssetLiveStatus = require("../models/AssetLiveStatus");
const AssetPresenceLog = require("../models/AssetPresenceLog");
const BranchNetwork = require("../models/BranchNetwork");

function ipMatchesSubnet(ip, subnetPrefix) {
  const cleanIp = String(ip || "").trim();
  const cleanSubnet = String(subnetPrefix || "").trim();
  if (!cleanIp || !cleanSubnet) return false;
  return cleanIp.startsWith(cleanSubnet);
}

async function getBranchNetwork(branch_id) {
  if (!branch_id) return null;
  return BranchNetwork.findOne({ where: { branch_id } });
}

function detectLocationStatus(branchNetwork, localIp, publicIp) {
  if (branchNetwork?.public_ip && publicIp && String(publicIp) === String(branchNetwork.public_ip)) {
    return "At Branch";
  }
  if (branchNetwork?.local_subnet && localIp && ipMatchesSubnet(localIp, branchNetwork.local_subnet)) {
    return "At Branch";
  }
  if (localIp || publicIp) return "Mismatch";
  return "Unknown";
}

function pingHost(host, timeoutMs = 2000) {
  return new Promise((resolve) => {
    if (!host) {
      resolve({ ok: false, response_ms: null, raw: "" });
      return;
    }

    const isWin = process.platform === "win32";
    const timeoutArg = isWin ? timeoutMs : Math.ceil(timeoutMs / 1000);
    const cmd = isWin
      ? `ping -n 1 -w ${timeoutArg} ${host}`
      : `ping -c 1 -W ${timeoutArg} ${host}`;

    const started = Date.now();

    exec(cmd, { timeout: timeoutMs + 1000 }, (error, stdout = "", stderr = "") => {
      const ms = Date.now() - started;
      if (error) {
        resolve({
          ok: false,
          response_ms: null,
          raw: `${stdout}\n${stderr}`.trim(),
        });
        return;
      }

      resolve({
        ok: true,
        response_ms: ms,
        raw: `${stdout}\n${stderr}`.trim(),
      });
    });
  });
}

async function saveProbeResult(profile, probe) {
  const branchNetwork = await getBranchNetwork(profile.branch_id);
  const localIp = profile.expected_local_ip || null;
  const publicIp = null;
  const locationStatus = detectLocationStatus(branchNetwork, localIp, publicIp);
  const deviceStatus = probe.ok ? "Online" : "Offline";

  let live = await AssetLiveStatus.findOne({
    where: { asset_id: profile.asset_id },
  });

  const payload = {
    asset_id: profile.asset_id,
    asset_label: profile.asset_label || null,
    branch_id: profile.branch_id,
    branch_name: profile.branch_name || null,
    asset_type: profile.asset_type || null,
    hostname: profile.hostname || null,
    local_ip: localIp,
    public_ip: publicIp,
    mac_address: profile.expected_mac || null,
    device_status: deviceStatus,
    location_status: locationStatus,
    tracking_source: "icmp",
    response_ms: probe.response_ms,
    last_seen_at: probe.ok ? new Date() : live?.last_seen_at || null,
    details: {
      raw_ping: probe.raw || "",
    },
  };

  if (!live) {
    live = await AssetLiveStatus.create(payload);
  } else {
    await live.update(payload);
    await live.reload();
  }

  await AssetPresenceLog.create({
    asset_id: profile.asset_id,
    asset_label: profile.asset_label || null,
    branch_id: profile.branch_id,
    branch_name: profile.branch_name || null,
    local_ip: localIp,
    public_ip: publicIp,
    mac_address: profile.expected_mac || null,
    device_status: deviceStatus,
    location_status: locationStatus,
    tracking_source: "icmp",
    response_ms: probe.response_ms,
    seen_at: new Date(),
    details: {
      raw_ping: probe.raw || "",
    },
  });

  return live;
}

function normalizeCandidate(row) {
  return {
    asset_id: String(row.asset_id || "").trim(),
    asset_label: String(row.asset_label || "").trim() || null,
    branch_id: row.branch_id ? Number(row.branch_id) : null,
    branch_name: String(row.branch_name || "").trim() || null,
    asset_type: String(row.asset_type || "").trim() || "Unknown",
    tracking_method: String(row.tracking_method || "ping").trim() || "ping",
    hostname: String(row.hostname || "").trim() || null,
    expected_local_ip: String(row.expected_local_ip || "").trim() || null,
    expected_mac: String(row.expected_mac || "").trim() || null,
    monitor_port: row.monitor_port ? Number(row.monitor_port) : null,
    http_url: String(row.http_url || "").trim() || null,
    rtsp_url: String(row.rtsp_url || "").trim() || null,
    is_active: row.is_active === false ? 0 : 1,
  };
}

// POST /api/asset-tracking/sync-from-master
exports.syncFromMaster = asyncHandler(async (req, res) => {
  const rows = Array.isArray(req.body?.candidates) ? req.body.candidates : [];

  if (!rows.length) {
    return res.status(400).json({
      success: false,
      message: "No candidates received",
    });
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const raw of rows) {
    const row = normalizeCandidate(raw);

    if (!row.asset_id || !row.branch_id || !row.asset_type || !row.expected_local_ip) {
      skipped += 1;
      continue;
    }

    const existing = await AssetTrackingProfile.findOne({
      where: { asset_id: row.asset_id },
    });

    if (!existing) {
      await AssetTrackingProfile.create(row);
      created += 1;
    } else {
      await existing.update({
        asset_label: row.asset_label,
        branch_id: row.branch_id,
        branch_name: row.branch_name,
        asset_type: row.asset_type,
        tracking_method: row.tracking_method,
        hostname: row.hostname,
        expected_local_ip: row.expected_local_ip,
        expected_mac: row.expected_mac,
        monitor_port: row.monitor_port,
        http_url: row.http_url,
        rtsp_url: row.rtsp_url,
        is_active: row.is_active,
      });
      updated += 1;
    }
  }

  return res.json({
    success: true,
    message: "Asset master sync completed",
    data: { created, updated, skipped, total: rows.length },
  });
});

// GET /api/asset-tracking/scan-now
exports.scanNow = asyncHandler(async (req, res) => {
  const profiles = await AssetTrackingProfile.findAll({
    where: { is_active: 1 },
    order: [["updated_at", "DESC"]],
  });

  const out = [];

  for (const profile of profiles) {
    try {
      const probe = await pingHost(profile.expected_local_ip);
      const live = await saveProbeResult(profile, probe);
      out.push(live);
    } catch (err) {
      out.push({
        asset_id: profile.asset_id,
        error: err.message,
      });
    }
  }

  return res.json({
    success: true,
    message: "Live scan completed",
    data: out,
  });
});

// GET /api/asset-tracking
exports.getTrackingList = asyncHandler(async (req, res) => {
  const { search, device_status, location_status, branch_id, asset_type } = req.query;

  const where = {};

  if (device_status) where.device_status = device_status;
  if (location_status) where.location_status = location_status;
  if (branch_id) where.branch_id = Number(branch_id);
  if (asset_type) where.asset_type = asset_type;

  if (search) {
    where[Op.or] = [
      { asset_id: { [Op.like]: `%${search}%` } },
      { asset_label: { [Op.like]: `%${search}%` } },
      { branch_name: { [Op.like]: `%${search}%` } },
      { hostname: { [Op.like]: `%${search}%` } },
      { local_ip: { [Op.like]: `%${search}%` } },
    ];
  }

  const rows = await AssetLiveStatus.findAll({
    where,
    order: [["updated_at", "DESC"]],
  });

  return res.json({ success: true, data: rows });
});

// GET /api/asset-tracking/summary
exports.getTrackingSummary = asyncHandler(async (req, res) => {
  const rows = await AssetLiveStatus.findAll();

  return res.json({
    success: true,
    data: {
      total: rows.length,
      online: rows.filter((x) => x.device_status === "Online").length,
      offline: rows.filter((x) => x.device_status === "Offline").length,
      atBranch: rows.filter((x) => x.location_status === "At Branch").length,
      mismatch: rows.filter((x) => x.location_status === "Mismatch").length,
    },
  });
});

// GET /api/asset-tracking/:asset_id
exports.getTrackingDetail = asyncHandler(async (req, res) => {
  const live = await AssetLiveStatus.findOne({
    where: { asset_id: req.params.asset_id },
  });

  if (!live) {
    return res.status(404).json({
      success: false,
      message: "Tracking record not found",
    });
  }

  const history = await AssetPresenceLog.findAll({
    where: { asset_id: req.params.asset_id },
    order: [["seen_at", "DESC"]],
    limit: 50,
  });

  return res.json({
    success: true,
    data: { live, history },
  });
});