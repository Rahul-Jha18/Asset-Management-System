# Asset ID Implementation Guide

## Overview
This implementation allows users to create custom, editable asset IDs (like "DC1", "L001") for all assets across tables and master-detail views, replacing the auto-increment IDs.

## Changes Made

### 1. Database Models - Backend

#### Updated Models with `assetId` Field:
All asset-related models now include an optional `assetId` field (VARCHAR 100):

**BranchInfra Models:**
- `BranchScanner`
- `BranchProjector`
- `BranchPrinter`
- `BranchDesktop`
- `BranchLaptop`
- `BranchCctv`
- `BranchPanel`
- `BranchIpPhone`

**BranchConnectivity Models:**
- `BranchConnectivity`
- `BranchUps`

**BranchSoftware Models:**
- `BranchApplicationSoftware`
- `BranchOfficeSoftware`
- `BranchUtilitySoftware`
- `BranchServices`
- `BranchLicenses`
- `BranchSecuritySoftware`
- `BranchSecuritySoftwareInstalled`
- `BranchWindowsOS`
- `BranchWindowsServers`

**Field Definition:**
```javascript
assetId: { type: DataTypes.STRING(100), allowNull: true, unique: false }
```

### 2. Database Migration

**File:** `backend/migrations/20260210-add-assetId-columns.js`

This migration automatically:
- Adds the `assetId` column to all 20 asset tables
- Handles duplicate column errors gracefully
- Runs on server startup

**Affected Tables:**
- branch_infra, branch_connectivity, branch_ups
- branch_scanners, branch_projectors, branch_printers
- branch_desktops, branch_laptops, branch_cctv
- branch_panels, branch_ip_phones
- branch_application_software, branch_office_software
- branch_utility_software, branch_services, branch_licenses
- branch_security_software, branch_security_software_installed
- branch_windows_os, branch_windows_servers

### 3. Frontend Changes

#### AssetDashboard Component (`frontend/src/pages/AssetDashboard.jsx`)
- Updated `toReportRows()` function to use `assetId: rawObj?.assetId ?? rawObj?.id ?? "—"`
- Added `recordId` field to track database ID separately
- Asset ID now defaults to custom assetId if available, otherwise uses database ID

#### BranchDetail Component (`frontend/src/components/BranchDetail.jsx`)

**Table Configuration Updates:**
- Updated `sectionConfig` to include "assetId" in summary fields for all 20 asset types:
  - Hardware devices (scanners, projectors, printers, desktops, laptops, cctv, panels, ipphones)
  - Infrastructure (connectivity, UPS, infra)
  - Software (application, office, utility, security, services, licenses, windows OS, servers)

**Field Mapping:**
- Added "assetId" to niceLabel mapping: `assetId: "Asset ID"`
- Asset ID displays and is editable in both summary and detail views

**Table Rendering:**
- Asset ID appears as first column in summary tables
- Asset ID is included in detail panels
- Both view and edit modes support asset ID

#### AddAssetModal Component (`frontend/src/components/AddAssetModal.jsx`)
- Updated `niceLabel()` function to include assetId label
- Asset ID field automatically appears in form when creating new assets
- Accepts any alphanumeric text (e.g., "DC1", "L001", "PRINTER-10")

### 4. Backend Server Integration

**File:** `backend/server.js`
- Imported migration module: `{ addAssetIdColumns }`
- Added automatic migration execution after database connection
- Runs migration on every server startup

```javascript
(async () => {
  try {
    await addAssetIdColumns();
  } catch (err) {
    console.warn("⚠️ Migration warning:", err.message);
  }
})();
```

## Frontend Features

### Viewing Asset IDs
- Asset IDs are displayed in all data tables
- Visible in master tables and master-detail views
- Exported to Excel exports

### Editing Asset IDs
1. Open BranchDetail component
2. Click "Edit" button for any asset
3. Scroll to "Asset ID" field
4. Enter custom ID (e.g., "DC1", "L001")
5. Add remarks (required)
6. Save changes

### Creating Assets with Custom IDs
1. Click "Add Asset" button
2. Select Category and Sub-Category
3. Enter Asset ID in the form
4. Fill other required fields
5. Save

### Excel Export
- Asset ID column included in exports
- Headers: "S.N.", "Section", "Asset ID", "Category", etc.
- All asset types included

## API Contracts

### Create Asset
**Route:** `POST /api/branches/:branchId/{section}`

**Payload:**
```json
{
  "assetId": "DC1",
  "section_specific_field": "value",
  "remarks": "Initial asset setup",
  "sub_category_code": "HW"
}
```

### Update Asset
**Route:** `PUT /api/branches/:branchId/{section}/:rowId`

**Payload:**
```json
{
  "assetId": "DC1-UPDATED",
  "section_specific_field": "new_value",
  "remarks": "Updated by admin: Changed location",
  "sub_category_code": "HW"
}
```

## Data Types & Constraints

- **Column:** `assetId`
- **Type:** STRING(100)
- **Nullable:** Yes (allows null for backward compatibility)
- **Unique:** No (allows duplicate asset IDs across branches)
- **Default:** NULL

## Usage Examples

### Custom Asset IDs
- `DC1`, `DC2`, `DC3` - Desktop computers
- `LP1`, `LP2` - Laptops
- `PR1`, `PR2` - Printers
- `SC1` - Scanner
- `L001`, `L002` - Licenses
- `SW-OFFICE-1` - Office Software
- `CVH-01` - CCTV
- `UPS-MAIN`, `UPS-BACKUP` - UPS devices

## Database Migration Execution

### Automatic (Default)
- Runs automatically on server startup
- Runs before API routes are initialized
- Safe - handles existing columns gracefully

### Manual Execution
```javascript
const { addAssetIdColumns } = require("./migrations/20260210-add-assetId-columns");
await addAssetIdColumns();
```

## Backward Compatibility

- ✅ Database ID (`id` field) remains auto-increment
- ✅ Existing data continues to work (assetId defaults to NULL)
- ✅ No breaking changes to existing APIs
- ✅ Asset ID is optional - old records can be updated later

## Field Priority

When displaying Asset ID:
1. Custom `assetId` field (if filled)
2. Database `id` field (fallback)
3. "—" (if both are missing)

## Testing Checklist

- [ ] Server starts and runs migration without errors
- [ ] AssetDashboard displays asset IDs
- [ ] BranchDetail tables show asset IDs in summary
- [ ] Can edit asset IDs in BranchDetail
- [ ] Can create new assets with custom IDs
- [ ] Can update existing assets with new IDs
- [ ] Excel export includes asset IDs
- [ ] Asset IDs appear in master export
- [ ] All 20 asset types support custom IDs

## Notes

- Asset IDs are branch-scoped (same ID can exist in different branches)
- No validation on asset ID format (accepts any alphanumeric text)
- asset IDs are sortable in tables
- asset IDs are included in asset history tracking
- Works with all existing asset management features
