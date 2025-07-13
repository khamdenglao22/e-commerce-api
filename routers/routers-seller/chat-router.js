const router = require("express").Router();
const {
  findChatProduct,
} = require("../../controllers/controllers-seller/chat-controller");

router.get("/", findChatProduct);

module.exports = router;
