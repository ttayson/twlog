const express = require("express");
const mongoose = require("mongoose");
const randToken = require("rand-token");

require("../models/User");
require("../models/User_type");
require("../models/Package");

const User = mongoose.model("user");
const User_type = mongoose.model("user_type");
const Packages = mongoose.model("package");

const passport = require("passport");
const bcrypt = require("bcryptjs");

const { userLogin } = require("../helpers/userLogin");

const router = express.Router();

router.get("/", userLogin, (req, res) => {
  res.redirect("/admin/");
});

router.get("/login", (req, res) => {
  res.render("guest/login", { layout: "basic" });
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),

  function (req, res, next) {
    User.updateOne(
      { login: req.body.login },
      { $set: { token: randToken.generate(64) } }
    )
      .then(() => {
        console.log("Token Salvo");
      })
      .catch((err) => {
        console.log(err);
      });
    User.findOne({ _id: req.user._id })
      .populate("type")
      .then((userLogin) => {
        if (userLogin.type[0].code == 0 || userLogin.type[0].code == 1) {
          console.log(userLogin);
          res.redirect("/admin");
          next();
        } else {
          res.redirect("/client");
          next();
        }
      });
  }
);

router.get("/cadastrar", (req, res) => {
  const user = {
    permission: "user",
    name: "Usuário",
    code: 0,
  };
  const user2 = {
    permission: "admin",
    name: "Administrador",
    code: 1,
  };
  const user3 = {
    permission: "deliveryman",
    name: "Entregador",
    code: 3,
  };
  const user4 = {
    permission: "client",
    name: "Cliente",
    code: 4,
  };
  new User_type(user).save().then(() => {});
  new User_type(user2).save().then(() => {});
  new User_type(user3).save().then(() => {});
  new User_type(user4).save().then(() => {});
});

module.exports = router;
