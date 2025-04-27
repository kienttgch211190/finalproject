const User = require("../models/User");
const userService = require("../services/userService");

const createUser = async (req, res) => {
  try {
    const { name, email, address, image, phone, password, role } = req.body;

    if (!name || !email || !password || !address || !phone || !role) {
      return res
        .status(400)
        .json({ status: "Error", message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ status: "Error", message: "Invalid email format" });
    }

    const newUser = await userService.createUser({
      name,
      email,
      address,
      image,
      phone,
      password,
      role,
    });
    res.status(200).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCustomerUser = async (req, res) => {
  try {
    const { name, email, phone, password, address, image } = req.body;

    // Kiểm tra các trường bắt buộc - giống với service
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        status: "Error",
        message: "Name, email, password and phone are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ status: "Error", message: "Invalid email format" });
    }

    const result = await userService.createCustomerUser({
      name,
      email,
      address,
      image,
      phone,
      password,
    });

    // Kiểm tra status từ service để trả về mã trạng thái HTTP phù hợp
    if (result.status === "Error") {
      return res.status(400).json(result);
    }

    // Trường hợp tạo tài khoản thành công
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "Error", message: "Email and password are required" });
    }
    //Kiem tra xem email có hợp lệ hay không
    const reg =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    const isValidEmail = reg.test(email);
    if (!isValidEmail) {
      return res
        .status(400)
        .json({ status: "Error", message: "Invalid email format" });
    }

    const response = await userService.signIn(req.body);
    if (response.status === "Error") {
      return res.status(400).json(response);
    }
    const { accessToken, refreshToken, ...userData } = response;
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    res.status(200).json({
      status: "Success",
      message: "Login successfully",
      accessToken,
      refreshToken,
      userData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error.message);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const response = await userService.getAllUsers();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ status: "Error", message: error.message });
    console.log(error.message);
  }
};

const detailUser = async (req, res) => {
  try {
    const userid = req.params.id;
    if (!userid) {
      return res.status(400).json({
        message: 'this Id is required'
      })
    }
    const response = await userService.detailUser(userid);
    return res.status(200).json(response)
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userid = req.params.id;

    if (!userid) {
      return res.status(400).json({ message: 'this Id is required' });
    }

    const user = await userService.detailUser(userid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.deleteOne({ user_id: userid });

    await userService.deleteUser(userid);

    return res.status(200).json({ message: 'User and associated role deleted successfully' });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const userid = req.params.id;
    const datauser = req.body;

    if (!userid) {
      return res.status(400).json({ message: 'this Id is required' });
    }

    const response = await userService.updateUser(userid, datauser);
    return res.status(200).json(response)
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

}


module.exports = {
  createUser,
  signIn,
  createCustomerUser,
  getAllUsers,
  detailUser,
  deleteUser,
  updateUser,
};
