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

const createCustomerUser = (userData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, email, address, image, phone, password } = userData;

      // Kiểm tra email đã tồn tại chưa
      const checkemail = await User.findOne({ email: email });
      if (checkemail !== null) {
        return resolve({
          status: "Error",
          message: "This email address is already in use",
        });
      }

      // Kiểm tra đầy đủ thông tin bắt buộc
      if (!name || !email || !password || !phone) {
        return resolve({
          status: "Error",
          message: "Name, email, password and phone are required",
        });
      }

      // Hash mật khẩu
      const passwordHash = bcrypt.hashSync(password, 10);

      // Tạo người dùng mới với role="customer"
      const newUser = new User({
        name,
        email,
        address: address || "",
        image: image || "",
        phone,
        passwordHash,
        role: "customer", // Mặc định là customer
      });

      await newUser.save();

      // Tạo token đăng nhập luôn cho người dùng mới
      const accesstoken = await generalAccessToken({
        id: newUser.id,
        role: newUser.role,
      });

      const refreshtoken = await generalRefreshToken({
        id: newUser.id,
        role: newUser.role,
      });

      resolve({
        status: "Success",
        message: "Customer account created successfully",
        userData: {
          accesstoken,
          refreshtoken,
          user: newUser,
        },
      });
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

const getAllUsers = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const users = await User.find({});
      resolve({
        status: "Success",
        message: "Users retrieved successfully",
        data: users,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const detailUser = (id) => {
  return new Promise( async (resolve, reject) => {
    try {

       const user = await User.findById(id);

       if (!user) {
         resolve({
           status: 'Failure',
           message: 'There was no user '
         });
       }

       resolve({
         status: 'Success',
         message: 'get all User successfully',
         data: user
       });
 
     } catch (err) {
       reject({
         status: 'Error',
         message: err.message
       });
     }
   });
};

const deleteUser = (id) => {
  return new Promise( async (resolve, reject) => {
    try {

       const checkUser = await User.findById(id);
       if (!checkUser) {
         resolve({
           status: 'Failure',
           message: 'There was no user with that id'
         });
       }


        await User.findByIdAndDelete(id);

       resolve({
         status: 'Success',
         message: 'User delete successfully',
         checkUser
       });
 
     } catch (err) {
       reject({
         status: 'Error',
         message: err.message
       });
     }
   });
};

const updateUser = (id, datauser) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findById(id);
      if (!checkUser) {
        return resolve({
          status: "Failure",
          message: "There was no user with that id",
        });
      }

      if (datauser.password) {
        const salt = await bcrypt.genSalt(10);
        datauser.password = await bcrypt.hash(datauser.password, salt);
      }

      datauser.updated_at = new Date();

      const updatedUser = await User.findByIdAndUpdate(id, datauser, { new: true });
      console.log("Updated user:", updatedUser);

      resolve({
        status: "Success",
        message: "User updated successfully",
        data: updatedUser,
      });

    } catch (err) {
      reject({
        status: "Error",
        message: err.message,
      });
    }
  });
};

module.exports = {
  createUser,
  signIn,
  createCustomerUser,
  getAllUsers,
  detailUser,
  deleteUser,
  updateUser,
};
