const express = require("express");
const router = express.Router();
const { createSubscription } = require("../controllers/subscriptionController");
const { protect } = require("../middleware/protect");

router.post("/subscribe", protect, createSubscription);

module.exports = router;
