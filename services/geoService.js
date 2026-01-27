const fetch = require('node-fetch');
const Location = require('../models/Location');

exports.reverseGeocode = async (lat, lng) => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'FarmSetu/1.0'
    }
  });

  const data = await res.json();
  const a = data.address || {};

  return {
    state: a.state || null,
    district: a.state_district || a.county || null,
    taluko: a.subdistrict || null,
    village: a.village || a.town || a.hamlet || null,
    pincode: a.postcode || null
  };
};
