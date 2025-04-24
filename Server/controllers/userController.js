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
const signIn = async (req, res) => {
    try{
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({status: "Error", message: "Email and password are required"})
        }
        //Kiem tra xem email có hợp lệ hay không
        const reg =
          /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
          const isValidEmail = reg.test(email);
            if (!isValidEmail) {
                return res.status(400).json({status: "Error", message: "Invalid email format"})
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


    }catch(error){
        res.status(500).json({message: error.message})
        console.log(error.message);
    }
}

module.exports = {
  createUser,
    signIn,
};
