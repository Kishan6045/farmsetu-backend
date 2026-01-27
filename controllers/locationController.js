const Location = require("../models/Location");

/**
 * 1️⃣ GET STATES
 */
exports.getStates = async (req, res) => {
  try {
    const states = await Location.distinct("state", {
      state: { $ne: null }
    });

    res.json({
      success: true,
      data: states.sort()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 2️⃣ GET DISTRICTS BY STATE
 */
exports.getDistricts = async (req, res) => {
  try {
    const { state } = req.params;

    const districts = await Location.distinct("district_clean", {
      state,
      district_clean: { $ne: null }
    });

    res.json({
      success: true,
      data: districts.sort()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 3️⃣ GET TALUKOS BY STATE & DISTRICT
 * (postal division ko taluko treat kar rahe hain)
 */
exports.getTalukos = async (req, res) => {
  try {
    const { state, district } = req.params;

    const talukos = await Location.distinct("taluko", {
      state,
      district_clean: district,
      taluko: { $ne: null }
    });

    res.json({
      success: true,
      data: talukos.sort()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 4️⃣ GET VILLAGES BY STATE, DISTRICT & TALUKO
 */
exports.getVillages = async (req, res) => {
  try {
    const { state, district, taluko } = req.params;

    const villages = await Location.distinct("village", {
      state,
      district_clean: district,
      taluko,
      village: { $ne: null }
    });

    res.json({
      success: true,
      data: villages.sort()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 5️⃣ GET LOCATION BY PINCODE
 */
exports.getByPincode = async (req, res) => {
  try {
    const { pincode } = req.params;

    const location = await Location.findOne({
      pincode: String(pincode)
    }).select("state district_clean taluko village pincode");

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Pincode not found"
      });
    }

    res.json({
      success: true,
      data: {
        state: location.state,
        district: location.district_clean,
        taluko: location.taluko,
        village: location.village,
        pincode: location.pincode
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
