const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();

const hotelDataAddedToDBRouter = require("./routes/dataimport.router");
const categoryDataAddedToDBRouter = require("./routes/categoryimport.router");

const hotelRouter = require("./routes/hotel.router");
const categoryRouter = require("./routes/category.router");
const singleHotelRouter = require("./routes/singlehotel.router");
const authRouter = require("./routes/auth.router");
const wishlistRouter = require("./routes/wishlist.router");
const userRouter = require("./routes/user.router");
const bookingRouter = require("./routes/booking.router");
const reviewRouter = require("./routes/review.router");
const paymentRouter = require("./routes/payment.router");
const filterRouter = require("./routes/filter.router");
const adminRouter = require("./routes/admin.router");
const hostRouter = require("./routes/host.router");
const propertyRouter = require("./routes/property.router");

const connectDB = require("./config/dbconfig");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
connectDB();

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Hello Geeks");
});

app.use("/api/hoteldata", hotelDataAddedToDBRouter);
app.use("/api/categorydata", categoryDataAddedToDBRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/category", categoryRouter);
app.use("/api/hotels/single", singleHotelRouter);
app.use("/api/auth", authRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/users", userRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/filters", filterRouter);
app.use("/api/admin", adminRouter);
app.use("/api/host", hostRouter);
app.use("/api/properties", propertyRouter);

mongoose.connection.once("open", () => {
  console.log("Connected to DB");
  app.listen(PORT, () => {
    console.log("Server is Up and Running on port", PORT);
  });
});
