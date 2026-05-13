const router = require("express").Router();
const { runExpiryCheck } = require("../jobs/expiryJob");

router.get("/run-expiry", async (req, res) => {
  const out = await runExpiryCheck({ daysAhead: Number(req.query.days || 7) });
  res.json(out);
});

module.exports = router;
