const express = require("express");
const router = express.Router();
const {
  createCustomerUser,
  createUser,
  signIn,
} = require("../controllers/userController");
const userService = require("../services/userService");

router.post("/signup", createCustomerUser);
router.post("/signin", signIn);
router.post("/create-user", createUser);

module.exports = router;
