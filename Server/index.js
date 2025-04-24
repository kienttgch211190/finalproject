const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
// const path = require("path");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();
const port = 3001;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to DB successfully");
  })
  .catch((err) => {
    console.log("Failed to connect to DB: " + err.message);
  });
//Cấu hình mongoose kết nối với MongoDB

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//cấu hình body-parser để lấy dữ liệu từ client gửi lên server
app.use(express.json());
app.use(cookieParser());
//cấu hình cookie-parser để lấy dữ liệu từ cookie

app.use(
  cors({
    origin: process.env.ORIGIN_HOST,
    credentials: true,
  })
);
//cấu hình cors cho phép ORIGIN_HOST truy cập vào server

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//#region Routes
const userRouter = require("./routes/userRoute");
const reservationRouter = require("./routes/reservationRoute");
const reviewRouter = require("./routes/reviewRoute");
const restaurantRouter = require("./routes/restaurantRoute");
const tableInfoRouter = require("./routes/tableInfoRoute");
const promotionRouter = require("./routes/promotionRoute");
const menuRouter = require("./routes/menuRoute");
const restaurantStaffRouter = require("./routes/restaurantStaffRoute");
const customerPreferenceRouter = require("./routes/customerPreferenceRoute");
//#endregion



app.use("/api/user", userRouter);
app.use("/api/reservation", reservationRouter);
app.use("/api/review", reviewRouter);
app.use("/api/restaurant", restaurantRouter);
app.use("/api/table", tableInfoRouter);
app.use("/api/promotion", promotionRouter);
app.use("/api/menu", menuRouter);
app.use("/api/staff", restaurantStaffRouter);
app.use("/api/preference", customerPreferenceRouter);
app.listen(port, () => {
  console.log(
    `Restaurant reservation app listening at http://localhost:${port}`
  );
});
