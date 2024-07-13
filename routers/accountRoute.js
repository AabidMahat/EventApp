const express = require("express");
const accountController = require("../controllers/accountController");

const router = express.Router({ mergeParams: true });

// router.route("/createAccount").post(accountController.createAccount);

router
  .route("/getAllAccount")
  .get(
    accountController.protect,
    accountController.restrictTo("admin"),
    accountController.getAllAccount
  );

router.route("/newAccount").post(accountController.createAccount);
router.route("/loginAccount").post(accountController.loginAccount);
router.route("/verifyAccount").post(accountController.verifyAccount);

router.route("/resendOtp").get(accountController.resendOtp);

router.route("/forgotPassword").post(accountController.forgotPassword);

router.route("/resetPassword/:token").patch(accountController.resetPassword);

router
  .route("/updateAccount/:accountId")
  .patch(accountController.updateAccount);

router
  .route("/likedEvent/:eventId")
  .patch(accountController.protect, accountController.eventLiked);

// router.route("/sendWhatsapp").get(accountController.sendWhatsapp);
module.exports = router;
