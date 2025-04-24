const User = require("../models/User");
const bcrypt = require("bcrypt");
const { generalAccessToken, generalRefreshToken } = require("./jwt");

const createUser = (userData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, email, address, image, phone, password, role } = userData;

      const checkemail = await User.findOne({ email: email });
      if (checkemail !== null) {
        return resolve({
          status: "Failure",
          message: "This email address is already in use",
        });
      }

      const passwordHash = bcrypt.hashSync(password, 10);
      console.log("Hashed password: " + passwordHash);
      const newUser = new User({
        name,
        email,
        address,
        image,
        phone,
        passwordHash,
        role,
      });
      await newUser.save();
      resolve(newUser);
      if (newUser) {
        resolve({
          status: "Success",
          message: "User created successfully",
          data: newUser,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const signIn = (userData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { email, password } = userData;
      if (!email || !password) {
        return resolve({
          status: "Error",
          message: "Email and password are required",
        });
      }
      const user = await User.findOne({ email: email });
      if (!user) {
        return resolve({
          status: "Error",
          message: "User not found",
        });
      }
      const comparePassword = bcrypt.compareSync(password, user.passwordHash);

      if (!comparePassword) {
        resolve({
          status: "ERROR",
          message: "this is wrong password",
        });
      }

      const accesstoken = await generalAccessToken({
        id: user.id,
        role: user.role,
      });

      const refreshtoken = await generalRefreshToken({
        id: user.id,
        role: user.role,
      });

      resolve({
        status: "SUCCESS",
        message: "Login successful",
        accesstoken,
        refreshtoken,
        user,
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createUser,
  signIn,
};
