const express = require("express");
const router = express.Router();
const controller = require("../controllers/locationController");

router.get("/states", controller.getStates);
router.get("/districts/:state", controller.getDistricts);
router.get("/talukos/:state/:district", controller.getTalukos);

// taluk / SO / HO wise villages
router.get("/villages/:state/:district/:taluko", controller.getVillages);

// 🔥 FULL district villages (Ingorala, Thesiya, sab)
router.get(
  "/villages-all/:state/:district",
  controller.getAllVillagesOfDistrict
);

router.get("/pincode/:pincode", controller.getByPincode);

module.exports = router;
