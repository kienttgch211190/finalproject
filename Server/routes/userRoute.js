const express = require("express");
const router = express.Router();
const { createUser, signIn } = require("../controllers/userController");
const userService = require("../services/userService");

router.post("/signup", createUser);
router.post("/signin", signIn);

module.exports = router;
