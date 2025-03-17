const express = require("express");
const user = require("../models/user");


const Router = express.Router();
const userController = require("../controllers/userController");

Router.post("/signup", userController.signup);
Router.post("/login", userController.login);

module.exports = Router;

