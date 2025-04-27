const express = require("express");
const router = express.Router();
const { authMiddleware, isAdmin} = require("../middlewares/middleware");
const {
  createCustomerUser,
  createUser,
  signIn,
  getAllUsers,
  detailUser,
  deleteUser,
  updateUser,
} = require("../controllers/userController");
const userService = require("../services/userService");

router.post("/signup",   createCustomerUser);
router.post("/signin", signIn);
router.post("/create-user",authMiddleware("access"),isAdmin , createUser);
router.get("/get-all-users", authMiddleware("access"),isAdmin, getAllUsers);
router.put('/update/:id', authMiddleware("access"),isAdmin, updateUser);
router.delete('/delete/:id', authMiddleware("access"),isAdmin, deleteUser);
router.get('/detailuser/:id',authMiddleware("access"),isAdmin, detailUser);

module.exports = router;
