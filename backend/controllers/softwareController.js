// backend/controllers/softwareController.js
const Branch = require('../models/Branch');
// const SoftwareDetails = require('../models/SoftwareDetails');

// GET /api/software/:branchId
exports.getSoftwareByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;

    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    const sw = await SoftwareDetails.findOne({ where: { branchId } });

    return res.json({
      branchId: branch.id,
      branchName: branch.name,
      branchLocation: branch.address,
      ...(sw ? sw.toJSON() : {}),
    });
  } catch (err) {
    console.error('getSoftwareByBranch error:', err);
    return res
      .status(500)
      .json({ message: 'Server error while fetching software details' });
  }
};

// PUT /api/software/:branchId
exports.upsertSoftwareByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const data = req.body;

    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    const [record, created] = await SoftwareDetails.findOrCreate({
      where: { branchId },
      defaults: { branchId, ...data },
    });

    if (!created) {
      await record.update(data);
    }

    return res.json(record);
  } catch (err) {
    console.error('upsertSoftwareByBranch error:', err);
    return res
      .status(500)
      .json({ message: 'Failed to save software details' });
  }
};
