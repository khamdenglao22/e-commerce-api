const router = require("express").Router();
const {
  createConversation,
  getConversationsByUserId,
  findAllMessageBetweenUsers,
  findBrandById,
  createMessage,
  updateBrand,
  deleteBrand,
} = require("../../controllers/controllers-bof/message-controller");

router.post("/conversation", createConversation);
router.get("/conversation/:userId/:role/:type", getConversationsByUserId);

// router.get("/", findAllMessage);
router.get("/:user1/:user2/:role", findAllMessageBetweenUsers);
// router.get("/:id", findBrandById);
router.post("/", createMessage);

// router.put("/:id", updateBrand);
// router.delete("/:id", deleteBrand);

module.exports = router;
