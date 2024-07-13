const express = require("express");
const eventController = require("../controllers/eventController");
const accountController = require("../controllers/accountController");

const router = express.Router({ mergeParams: true });

router.use(accountController.protect);

router.route("/createEvent").post(eventController.createEvent);
router.route("/").get(eventController.getAllEvent);

router.route("/getEvent/:eventId").get(eventController.getEvent);

router.route("/getEventByHashtag").get(eventController.getParticularData);
module.exports = router;
