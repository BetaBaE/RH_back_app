const express = require("express");
const router = express.Router();
const {
  createNewQualification,
  getQualifications,
  getQualificationById,
  deleteQualifications,
  updateQualification,
  getQualificationsCount,
} = require("../controllers/Qualification");

router.get("/qualification", getQualificationsCount, getQualifications);
router.post("/qualification", createNewQualification);
router.get("/qualification/:id", getQualificationById);
router.delete("/qualification/:id", deleteQualifications);
router.put("/qualification/:id", updateQualification);
// router.get("/qualification/count", getQualificationsCount);

module.exports = router;
