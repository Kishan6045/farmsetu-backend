const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");

// cascading APIs (FINAL)
router.get("/states", locationController.getStates);
router.get("/districts/:state", locationController.getDistricts);
router.get("/talukos/:state/:district", locationController.getTalukos);
router.get("/villages/:state/:district/:taluko", locationController.getVillages);
router.get("/pincode/:pincode", locationController.getByPincode);

module.exports = router;
