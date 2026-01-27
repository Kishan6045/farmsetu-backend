const Location = require("../models/Location");

/* ---------- helper ---------- */
const normalize = (v = "") =>
  v.replace(/\s+/g, " ").trim();

/* ================= STATES ================= */
exports.getStates = async (req, res) => {
  const states = await Location.distinct("statename");
  res.json({ success: true, data: states.filter(Boolean).sort() });
};

/* ================= DISTRICTS ================= */
exports.getDistricts = async (req, res) => {
  const state = normalize(req.params.state);

  const districts = await Location.distinct("Districtname", {
    statename: { $regex: new RegExp(state, "i") }
  });

  res.json({ success: true, data: districts.filter(Boolean).sort() });
};

/* ================= TALUKOS ================= */
exports.getTalukos = async (req, res) => {
  const state = normalize(req.params.state);
  const district = normalize(req.params.district);

  const talukos = await Location.distinct("Taluk", {
    statename: { $regex: new RegExp(state, "i") },
    Districtname: { $regex: new RegExp(district, "i") }
  });

  res.json({ success: true, data: talukos.filter(Boolean).sort() });
};

/* ================= VILLAGES (Taluk / SO / HO) ================= */
exports.getVillages = async (req, res) => {
  try {
    const state = normalize(req.params.state);
    const district = normalize(req.params.district);
    const key = normalize(req.params.taluko);

    const docs = await Location.find({
      statename: { $regex: new RegExp(state, "i") },
      Districtname: { $regex: new RegExp(district, "i") },
      $or: [
        { Taluk: { $regex: new RegExp(key, "i") } },
        { RelatedSuboffice: { $regex: new RegExp(key, "i") } },
        { RelatedHeadoffice: { $regex: new RegExp(key, "i") } }
      ]
    }).select("officename pincode -_id");

    const map = new Map();

    docs.forEach(d => {
      if (!d.officename) return;

      const village = d.officename
        .replace(/\s*(B\.O|S\.O|H\.O)$/i, "")
        .trim();

      if (!map.has(village)) {
        map.set(village, { village, pincode: d.pincode });
      }
    });

    res.json({
      success: true,
      total: map.size,
      data: Array.from(map.values())
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= ALL VILLAGES OF DISTRICT ================= */
exports.getAllVillagesOfDistrict = async (req, res) => {
  try {
    const state = normalize(req.params.state);
    const district = normalize(req.params.district);

    const docs = await Location.find({
      statename: { $regex: new RegExp(`^${state}$`, "i") },
      Districtname: { $regex: new RegExp(`^${district}$`, "i") }
    }).select("officename pincode -_id");

    const map = new Map();

    docs.forEach(d => {
      if (!d.officename) return;

      const village = d.officename
        .replace(/\s*(B\.O|S\.O|H\.O)$/i, "")
        .trim();

      if (!map.has(village)) {
        map.set(village, { village, pincode: d.pincode });
      }
    });

    res.json({
      success: true,
      total: map.size,
      data: Array.from(map.values())
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= PINCODE ================= */
exports.getByPincode = async (req, res) => {
  const { pincode } = req.params;

  const doc = await Location.findOne({ pincode: Number(pincode) });

  if (!doc) {
    return res.status(404).json({
      success: false,
      message: "Pincode not found"
    });
  }

  res.json({
    success: true,
    data: {
      state: doc.statename,
      district: doc.Districtname,
      taluko: doc.Taluk,
      village: doc.officename
        .replace(/\s*(B\.O|S\.O|H\.O)$/i, "")
        .trim(),
      pincode: doc.pincode
    }
  });
};
