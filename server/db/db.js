const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

module.exports.connectDB = async () => {
    
        try {
          await mongoose
            .connect(process.env.MONGODB_URI)
            .then(() => {
              console.log("Connected to MongoDB");
            })
            .catch((err) => {
              console.error("Could not connect to MongoDB", err);
            });
        } catch (err) {
          console.error("Could not connect to MongoDB", err);
        }
      }


      
