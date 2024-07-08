const express = require("express");
const profileController = require("../controllers/profileController");

const router = express.Router();

router
  .route("/createContactProfile")
  .post(profileController.createAddressProfile);

router
  .route("/updateProfile/:id/:addressType")
  .patch(profileController.updateAddressProfile);

module.exports = router;
