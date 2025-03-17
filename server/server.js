const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const { connectDB } = require('./db/db');
dotenv.config();

const app = express();
connectDB();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use("/", userRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
