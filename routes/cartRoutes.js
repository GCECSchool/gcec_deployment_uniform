const express = require("express");
const {
  checkout,
  getReportByDate,
  deleteCheckoutData,
} = require("../controllers/cartControllers");
const router = express.Router();

// Checkout route
router.post("/checkout", checkout);

router.get("/report/:date", getReportByDate);

router.delete("/checkout/:id", deleteCheckoutData);

module.exports = router;
