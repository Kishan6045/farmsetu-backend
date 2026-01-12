const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FarmSetu API",
      version: "1.0.0",
      description: "FarmSetu Authentication APIs",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
      {
        url: "https://farmsetu-backend-q03z.onrender.com",
      },
    ],
  },

  // ✅ IMPORTANT FIX
  apis: ["./routes/*.js"], // server.js ke perspective se path
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
