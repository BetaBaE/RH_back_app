const express = require("express");
const router = express.Router();

const { getAssurances, 
        updateAssurance,
        createNewAssurance, 
        deleteAssurances ,
        getAssurancesById,
        getAssurancesCount, 
        
    }
 = require("../controllers/assurance");

router.get("/assurances", 
getAssurancesCount, 
getAssurances);
router.post("/assurances", createNewAssurance);
router.get("/assurances/:id", getAssurancesById);
router.delete("/assurances/:id", deleteAssurances);
router.put("/assurances/:id", updateAssurance);

module.exports = router;