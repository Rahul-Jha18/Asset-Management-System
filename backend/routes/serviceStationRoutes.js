const router = require("express").Router();
const { getServiceStations } = require("../controllers/serviceStationController");
const { protect } = require("../middleware/authMiddleware"); // if you have this

router.get("/", protect, getServiceStations);

module.exports = router;
