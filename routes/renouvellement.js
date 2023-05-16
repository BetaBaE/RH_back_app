const express = require("express");
const {
  getRenouvellementCount,
  getRenouvellement,
} = require("../controllers/renouvellement");
const router = express.Router();

router.get("/renouvellement", getRenouvellementCount, getRenouvellement);

module.exports = router;
