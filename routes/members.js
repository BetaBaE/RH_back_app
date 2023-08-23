const express = require("express");
const router = express.Router();
const {
  createNewMember,
  getMembers,
  getMemberById,
  getMembersCount,
  updateMember,
  deleteMember,
  getMembersChart,
  PrintInsertedFile,
} = require("../controllers/members");

router.get("/members", getMembersCount, getMembers);
router.post("/members", createNewMember);
router.get("/members/:id", getMemberById);
router.delete("/members/:id", deleteMember);
router.put("/members/:id", updateMember);
router.get("/members/count", getMembersCount);
router.get("/memberschart", getMembersChart);
router.get("/printMember/:id",PrintInsertedFile)

module.exports = router;
