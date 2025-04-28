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
router.put('/update/:id', authMiddleware("access"),updateUser);
router.delete('/delete/:id', authMiddleware("access"),isAdmin, deleteUser);
router.get('/detailuser/:id',authMiddleware("access"),detailUser);
router.get('/profile', authMiddleware("access"), (req, res) => {
  // Use the authenticated user's ID from the JWT token
  const userId = req.user.payload.id;
  detailUser({ params: { id: userId } }, res);
}
);

module.exports = router;
