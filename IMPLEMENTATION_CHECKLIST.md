# Asset History Implementation Checklist & Guide

## 📋 Complete Implementation Checklist

### Phase 1: Database Setup
- [ ] Check if `asset_history` table exists
  ```bash
  mysql -u root -p projectims -e "DESCRIBE asset_history;"
  ```
- [ ] If not exists, run migration:
  ```bash
  cd backend
  npx sequelize-cli db:migrate --to 20260209100000-create-asset-history.js
  ```
  OR Run manually:
  ```sql
  USE projectims;
  CREATE TABLE asset_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branchId INT NOT NULL,
    assetId INT NOT NULL,
    assetType VARCHAR(50) NOT NULL,
    changeType ENUM('CREATE', 'UPDATE', 'DELETE', 'TRANSFER', 'MAINTENANCE') DEFAULT 'UPDATE',
    fieldName VARCHAR(100),
    oldValue LONGTEXT,
    newValue LONGTEXT,
    changedBy INT,
    changedByName VARCHAR(100),
    description LONGTEXT,
    metadata JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_branch_asset (branchId, assetId),
    INDEX idx_type_change (assetType, changeType),
    INDEX idx_created (createdAt)
  );
  ```
- [ ] Verify table created: `SHOW TABLES LIKE 'asset_history';`

### Phase 2: Backend Integration
- [ ] ✅ AssetHistory model created (`backend/models/AssetHistory.js`)
- [ ] ✅ Model added to `backend/models/index.js`
- [ ] ✅ Utility functions created (`backend/utils/assetHistoryTracker.js`)
- [ ] ✅ History controller created (`backend/controllers/assetHistoryController.js`)
- [ ] ✅ History routes created (`backend/routes/assetHistoryRoutes.js`)
- [ ] ✅ Routes added to `backend/server.js`

**Verify Backend:**
```bash
# Check if routes are registered
curl http://localhost:5000/api/asset-history/asset/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should return 200 (with or without data)
```

### Phase 3: Integrate History Tracking into Asset Updates
Choose your approach:

#### Option A: Update Individual Endpoints (RECOMMENDED)
1. [ ] Find event that updates assets (create/update/delete/transfer)
2. [ ] Add `const { trackAssetChange } = require("../utils/assetHistoryTracker");` 
3. [ ] Capture oldData before update: `const oldData = asset.toJSON();`
4. [ ] Call trackAssetChange() after update (see sample implementations)
5. [ ] Test with curl

Example for laptop update:
```javascript
// In your update endpoint:
const oldData = asset.toJSON();
await asset.update(updatePayload);

await trackAssetChange({
  branchId: asset.branchId,
  assetId: asset.id,
  assetType: "laptop",
  oldData,
  newData: updatePayload,
  changeType: "UPDATE",
  userId: req.user.id,
  userName: req.user.name,
});
```

#### Option B: Use Global Middleware (ADVANCED)
Create a lifecycle hook in the models to auto-track changes.

### Phase 4: Frontend Integration

#### Step 1: Display History in Asset Detail
- [ ] Import AssetHistoryTimeline component in your Asset Detail page:
```jsx
import AssetHistoryTimeline from "../components/AssetHistoryTimeline";
```

- [ ] Add to JSX in Asset Detail (bottom of page):
```jsx
<AssetHistoryTimeline assetId={asset.id} token={token} />
```

#### Step 2: Add Branch History Page Route
- [ ] Add to your router configuration (e.g., App.jsx or Routes file):
```jsx
import BranchHistoryPage from "./pages/BranchHistoryPage";

// In your routes:
<Route path="/branch-history/:branchId" element={<BranchHistoryPage />} />
```

#### Step 3: Add Navigation Links
- [ ] Add button to Asset Detail to view history:
```jsx
<button
  onClick={() => navigate(`/branch-history/${branchId}`)}
  className="btn-primary"
>
  View Branch History
</button>
```

- [ ] Add link in Branch page:
```jsx
<NavLink to={`/branch-history/${branch.id}`}>
  History
</NavLink>
```

### Phase 5: Testing

#### Test 1: API Endpoints
```bash
# Get asset history
curl "http://localhost:5000/api/asset-history/asset/1" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq

# Get branch history
curl "http://localhost:5000/api/asset-history/branch/1" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq

# Get change summary
curl "http://localhost:5000/api/asset-history/summary/1" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq

# Get recent changes
curl "http://localhost:5000/api/asset-history/recent-changes/1?days=7" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq
```

#### Test 2: Update Asset and Verify History
1. [ ] Update an asset via API or UI
2. [ ] Check database:
```sql
SELECT * FROM asset_history WHERE assetId = 1 ORDER BY createdAt DESC;
```
3. [ ] Should see new record(s) with:
   - changeType: UPDATE
   - fieldName: name of changed field
   - oldValue: previous value
   - newValue: new value
   - changedByName: who changed it
   - createdAt: timestamp

#### Test 3: Frontend Components
- [ ] Navigate to Asset Detail page
- [ ] Scroll down to see History Timeline
- [ ] Verify changes are displayed correctly with colors
- [ ] Click on Branch History link
- [ ] Verify Branch History page loads
- [ ] Filter by asset type
- [ ] Change page limit

### Phase 6: Verification Queries

```sql
-- Check total records
SELECT COUNT(*) as total_records FROM asset_history;

-- Check changes by type
SELECT changeType, COUNT(*) as count 
FROM asset_history 
GROUP BY changeType;

-- Check asset-specific history
SELECT * FROM asset_history 
WHERE assetId = 10 
ORDER BY createdAt DESC 
LIMIT 10;

-- Check branch history
SELECT assetType, changeType, COUNT(*) as count
FROM asset_history 
WHERE branchId = 1 
GROUP BY assetType, changeType;

-- Find who made most changes
SELECT changedByName, COUNT(*) as changes
FROM asset_history 
WHERE changedByName IS NOT NULL
GROUP BY changedByName 
ORDER BY changes DESC
LIMIT 10;

-- Check recent changes (last 7 days)
SELECT * FROM asset_history 
WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY createdAt DESC;
```

## 🚀 Quick Integration Guide (5 Minutes)

### For Asset Update Endpoints Only:

1. **Add import at top of controller:**
```javascript
const { trackAssetChange } = require("../utils/assetHistoryTracker");
```

2. **In update handler, before updating:**
```javascript
const oldData = asset.toJSON(); // Capture before changes
```

3. **After successful update:**
```javascript
try {
  await asset.update(newData); // Your update
  
  // Track the change
  await trackAssetChange({
    branchId: asset.branchId,
    assetId: asset.id,
    assetType: "laptop", // or whatever asset you're updating
    oldData,
    newData,
    changeType: "UPDATE",
    userId: req.user?.id || null,
    userName: req.user?.name || "Unknown",
  });
} catch (error) {
  console.error("Update error:", error);
  throw error;
}
```

## 📊 What Gets Tracked

✅ **Tracked:**
- Asset field changes (name, user, location, status, etc.)
- Warranty and expiry dates
- Asset transfers between branches
- Maintenance activities
- Asset creation/deletion
- Software/license changes

❌ **NOT Tracked (Excluded):**
- Timestamps (createdAt, updatedAt)
- Internal IDs
- System fields

## 🔒 Security & Privacy

- [ ] Don't track: passwords, API keys, sensitive credentials
- [ ] Do include: userId for accountability
- [ ] Do include: userName for human readability
- [ ] Set proper access controls on history endpoints
- [ ] Consider data retention: Archive/delete very old history

## 📈 Performance Optimization

For large datasets (>1M records):
```sql
-- Archive old records to history_archive table
INSERT INTO asset_history_archive 
SELECT * FROM asset_history 
WHERE createdAt < DATE_SUB(NOW(), INTERVAL 2 YEAR);

DELETE FROM asset_history 
WHERE createdAt < DATE_SUB(NOW(), INTERVAL 2 YEAR);
```

## 🆘 Troubleshooting

### Issue: History not being tracked
- Check: Are you calling trackAssetChange()?
- Check: Is the table created?
- Check: Do you have database write permissions?
- Solution: Check console for errors from trackAssetChange

### Issue: Old endpoints don't show in history
- Cause: Those endpoints weren't updated with trackAssetChange()
- Solution: Add history tracking to those endpoints

### Issue: Performance is slow
- Cause: Too many records in asset_history
- Solution: Add indices (already done), archive old records

### Issue: History not showing in UI
- Check: Is API endpoint working? (Test with curl)
- Check: Is token valid?
- Check: Is component mounted?
- Solution: Check browser console for errors

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Run the verification SQL queries
3. Test API endpoints with curl
4. Check this checklist for missed steps

---

**Last Updated:** 2026-02-09  
**Version:** 1.0  
**Status:** ✅ Ready for Implementation
