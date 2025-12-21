// backend/routes/requestRoutes.js
const express = require('express');
const router = express.Router();

const {
  createRequest,
  getUserRequests,
  getAllRequests,
  updateRequestStatus,
  editRequest,
  deleteRequest,
} = require('../controllers/requestController');

const { protect } = require('../middleware/authMiddleware');
const { adminOrSubadmin, adminOnlyDelete } = require('../middleware/adminMiddleware');

// User routes
router.post('/', protect, createRequest);
router.get('/', protect, getUserRequests);

// Admin + Subadmin routes
router.get('/all', protect, adminOrSubadmin, getAllRequests);
router.put('/:id', protect, adminOrSubadmin, updateRequestStatus);
router.put('/:id/edit', protect, adminOrSubadmin, editRequest);

// Only Admin can delete request
router.delete('/:id', protect, adminOnlyDelete, deleteRequest);

module.exports = router;