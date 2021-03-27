const express = require("express");
const mongoose = require("mongoose");

const { userLogin } = require("../helpers/userLogin");

require("../models/Package");
require("../models/Client");
require("../models/User");
require("../models/User_type");
require("../models/Batch");
require("../models/Delivery");

const Packages = mongoose.model("package");
const Client = mongoose.model("client");
const User = mongoose.model("user");
const User_Type = mongoose.model("user_type");
const Batch = mongoose.model("batch");
const Delivery = mongoose.model("delivery");

const router = express.Router();

router.get("/", (req, res) => {
  res.render("client/index");
});

module.exports = router;
