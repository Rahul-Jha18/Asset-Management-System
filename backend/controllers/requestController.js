// backend/controllers/requestController.js
const asyncHandler = require("express-async-handler");
const Request = require("../models/Request");
const User = require("../models/User");
const { sendMail } = require("../utils/mailer");

// Create Request (SubAdmin only by route middleware)
exports.createRequest = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const {
    type, // groupId like H/S/L/I/C
    category, // subCategoryCode like DC/LC/...
    sub_category, // request type like Issue/Replacement/...

    title,
    asset,
    priority,
    description,
    status,
    branchId,

    requestedByName,
    requestedByContact,
    purchaseDate,
    warrantyExpiry,
    invoiceNo,
    vendorName,
    province,
    district,
    localLevel,
    fiscalYear,

    agreeAccuracy,
  } = req.body;

  if (!type || !branchId || !description) {
    return res.status(400).json({ message: "Type, branch and description are required" });
  }

  if (!agreeAccuracy) {
    return res.status(400).json({ message: "Agreement required" });
  }

  const created = await Request.create({
    userId,
    type,
    category: category || null,
    sub_category: sub_category || null,

    title: title || null,
    asset: asset || null,
    priority: priority || "Medium",
    description,
    status: status || "Pending",
    branchId,

    requestedByName: requestedByName || null,
    requestedByContact: requestedByContact || null,
    purchaseDate: purchaseDate || null,
    warrantyExpiry: warrantyExpiry || null,
    invoiceNo: invoiceNo || null,
    vendorName: vendorName || null,
    province: province || null,
    district: district || null,
    localLevel: localLevel || null,
    fiscalYear: fiscalYear || null,

    agreeAccuracy: true,
  });

  // --- Fetch user info for email (name instead of userId) ---
  let requestedByUser = null;
  try {
    if (userId) {
      requestedByUser = await User.findByPk(userId, {
        attributes: ["id", "name", "email", "role"],
      });
    }
  } catch (e) {
    console.log("User fetch failed:", e?.message || e);
  }

  const adminEmail = process.env.ADMIN_EMAIL || "";

  const requesterName = requestedByUser?.name || created.requestedByName || "Unknown User";
  const requesterEmail = requestedByUser?.email ? ` (${requestedByUser.email})` : "";
  const requesterRole = requestedByUser?.role ? ` [${requestedByUser.role}]` : "";

  const subject = `New IT Service Request Submitted (#${created.id})`;

  const submittedOn = created.createdAt
    ? new Date(created.createdAt).toLocaleString()
    : new Date().toLocaleString();

  const safe = (v) => (v === null || v === undefined || String(v).trim() === "" ? "-" : v);

  // ✅ FIXED Professional TEXT email (category/sub_category were not correct before)
  const text = `Dear Admin,

A new IT service request has been submitted in the Project Asset Management System (AMS).

Request Summary
--------------------------------------------------
Request ID       : #${created.id}
Submitted On     : ${submittedOn}
Status           : ${safe(created.status)}
Priority         : ${safe(created.priority)}

Title            : ${safe(created.title)}
Type (Group)     : ${safe(created.type)}
Category         : ${safe(created.category)}
Sub Category     : ${safe(created.sub_category)}

Branch ID        : ${safe(created.branchId)}
Asset            : ${safe(created.asset)}

Requested By     : ${requesterName}${requesterEmail}${requesterRole}
Contact          : ${safe(created.requestedByContact)}

Purchase Date    : ${safe(created.purchaseDate)}
Warranty Expiry  : ${safe(created.warrantyExpiry)}
Invoice No       : ${safe(created.invoiceNo)}
Vendor Name      : ${safe(created.vendorName)}

Location
--------------------------------------------------
Province    : ${safe(created.province)}
District    : ${safe(created.district)}
Local Level : ${safe(created.localLevel)}
Fiscal Year : ${safe(created.fiscalYear)}

Description
--------------------------------------------------
${safe(created.description)}
--------------------------------------------------

Please review the request and take necessary action at your earliest convenience.

This is a system-generated email. Please do not reply to this message.

Regards,
IT & Digital Transformation Department
Nepal Life Insurance Company Ltd.
`;

  // ✅ UPDATED Professional HTML email (also shows Type+Category clearly)
  const html = `
  <div style="font-family: Arial, sans-serif; font-size:14px; color:#333; line-height:1.6;">
  <div style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", flexShrink:0 }}>
              <span style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:16, letterSpacing:"-0.02em", color:"#1474f3ea" }}>
              Asset <span style={{fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:16, letterSpacing:"-0.02em", color:"#ffffff"}}>IMS</span>
              </span>
              </div>
    <p>Dear Admin,</p>
    <p>
      A new <strong>IT Service Request</strong> has been submitted in the
      <strong>Project Asset Management System (AMS)</strong>.
    </p>

    <h3 style="margin:16px 0 8px;">Request Summary</h3>
    <table cellpadding="8" cellspacing="0" width="100%" style="border-collapse:collapse; border:1px solid #ddd;">
      <tr style="background:#f5f5f5;">
        <td style="border:1px solid #ddd;"><strong>Request ID</strong></td>
        <td style="border:1px solid #ddd;">#${created.id}</td>
      </tr>
      <tr>
        <td style="border:1px solid #ddd;"><strong>Submitted On</strong></td>
        <td style="border:1px solid #ddd;">${submittedOn}</td>
      </tr>
      <tr>
        <td style="border:1px solid #ddd;"><strong>Status</strong></td>
        <td style="border:1px solid #ddd;">${safe(created.status)}</td>
      </tr>
      <tr>
        <td style="border:1px solid #ddd;"><strong>Priority</strong></td>
        <td style="border:1px solid #ddd;">${safe(created.priority)}</td>
      </tr>
      <tr>
        <td style="border:1px solid #ddd;"><strong>Title</strong></td>
        <td style="border:1px solid #ddd;">${safe(created.title)}</td>
      </tr>
      <tr>
        <td style="border:1px solid #ddd;"><strong>Type (Group)</strong></td>
        <td style="border:1px solid #ddd;">${safe(created.type)}</td>
      </tr>
      <tr>
        <td style="border:1px solid #ddd;"><strong>Category</strong></td>
        <td style="border:1px solid #ddd;">${safe(created.category)}</td>
      </tr>
      <tr>
        <td style="border:1px solid #ddd;"><strong>Sub Category</strong></td>
        <td style="border:1px solid #ddd;">${safe(created.sub_category)}</td>
      </tr>
      <tr>
        <td style="border:1px solid #ddd;"><strong>Branch ID</strong></td>
        <td style="border:1px solid #ddd;">${safe(created.branchId)}</td>
      </tr>
      <tr>
        <td style="border:1px solid #ddd;"><strong>Asset</strong></td>
        <td style="border:1px solid #ddd;">${safe(created.asset)}</td>
      </tr>

      <tr style="background:#f5f5f5;">
        <td style="border:1px solid #ddd;"><strong>Requested By</strong></td>
        <td style="border:1px solid #ddd;">${requesterName}${requesterEmail}${requesterRole}</td>
      </tr>
      <tr>
        <td style="border:1px solid #ddd;"><strong>Contact</strong></td>
        <td style="border:1px solid #ddd;">${safe(created.requestedByContact)}</td>
      </tr>

      <tr>
        <td style="border:1px solid #ddd;"><strong>Purchase Date</strong></td>
        <td style="border:1px solid #ddd;">${safe(created.purchaseDate)}</td>
      </tr>
      <tr>
        <td style="border:1px solid #ddd;"><strong>Warranty Expiry</strong></td>
        <td style="border:1px solid #ddd;">${safe(created.warrantyExpiry)}</td>
      </tr>
      <tr>
        <td style="border:1px solid #ddd;"><strong>Invoice No</strong></td>
        <td style="border:1px solid #ddd;">${safe(created.invoiceNo)}</td>
      </tr>
      <tr>
        <td style="border:1px solid #ddd;"><strong>Vendor Name</strong></td>
        <td style="border:1px solid #ddd;">${safe(created.vendorName)}</td>
      </tr>

      <tr>
        <td style="border:1px solid #ddd;"><strong>Location</strong></td>
        <td style="border:1px solid #ddd;">
          Province: ${safe(created.province)}<br/>
          District: ${safe(created.district)}<br/>
          Local Level: ${safe(created.localLevel)}<br/>
          Fiscal Year: ${safe(created.fiscalYear)}
        </td>
      </tr>

      <tr>
        <td style="border:1px solid #ddd;"><strong>Description</strong></td>
        <td style="border:1px solid #ddd;">${String(created.description || "-").replace(/\n/g, "<br/>")}</td>
      </tr>
    </table>

    <p style="margin-top:16px;">
      Please log in to AMS to review and process this request.
    </p>

    <p style="font-size:12px; color:#666;">
      This is a system-generated email. Please do not reply to this message.
    </p>

    <p>
      Regards,<br/>
      <strong>IT & Digital Transformation Department</strong><br/>
      Nepal Life Insurance Company Ltd.
    </p>
  </div>
  `;

  try {
    await sendMail({
      to: adminEmail,
      subject,
      text,
      html,
    });
  } catch (e) {
    console.error("Admin email failed:", e?.message || e);
  }

  return res.status(201).json({ message: "Request created", data: created });
});

// SubAdmin sees own requests only
exports.getSubadminOwnRequests = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const list = await Request.findAll({
    where: { userId },
    order: [["created_at", "DESC"]],
  });

  res.json(list);
});

// Admin/SubAdmin: view all
exports.getAllRequests = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const offset = (page - 1) * limit;

  const { count, rows } = await Request.findAndCountAll({
    include: [{ model: User, as: "user", attributes: ["id", "name", "email", "role"] }],
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });

  res.json({
    data: rows,
    pagination: {
      total: count,
      pages: Math.ceil(count / limit) || 1,
      page,
      limit,
    },
  });
});

// Admin only: status update
exports.updateRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: "Status is required" });

  const allowed = ["Pending", "In Progress", "Approved", "Rejected", "Completed", "Done"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const reqItem = await Request.findByPk(id);
  if (!reqItem) return res.status(404).json({ message: "Request not found" });

  await reqItem.update({ status });

  res.json({ message: "Status updated", data: reqItem });
});

// Admin only: full edit
exports.editRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const reqItem = await Request.findByPk(id);
  if (!reqItem) return res.status(404).json({ message: "Request not found" });

  const payload = { ...req.body };

  // keep safe: never change userId from edit
  delete payload.userId;

  await reqItem.update(payload);

  res.json({ message: "Request updated", data: reqItem });
});

// Admin only: delete
exports.deleteRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const reqItem = await Request.findByPk(id);
  if (!reqItem) return res.status(404).json({ message: "Request not found" });

  await reqItem.destroy();

  res.json({ message: "Request deleted" });
});
