const express = require("express");
const mongoose = require("mongoose");
const randToken = require("rand-token");

require("../models/User");
require("../models/User_type");

const User = mongoose.model("user");
const User_type = mongoose.model("user_type");

const passport = require("passport");
const bcrypt = require("bcryptjs");

const { userLogin } = require("../helpers/userLogin");

const router = express.Router();

router.get("/", (req, res) => {
  // res.render("admin/index");
  res.json({ ok: "Teste", info: user });
});

router.get("/login", (req, res) => {
  res.render("guest/login", { layout: "basic" });
  // res.json({ ok: "Teste"})
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
    res.redirect("/admin");
    next();
  }
);

router.get("/cadastrar", (req, res) => {
  // const user = {
  //   permission: "user",
  //   name: "Usuário",
  //   code: 0,
  // };
  // const user2 = {
  //   permission: "admin",
  //   name: "Administrador",
  //   code: 1,
  // };
  // const user3 = {
  //   permission: "deliveryman",
  //   name: "Entregador",
  //   code: 3,
  // };
  // const user4 = {
  //   permission: "client",
  //   name: "Cliente",
  //   code: 4,
  // };
  // new User_type(user4)
  //   .save()
  //   .then(() => {
  //     console.log("Teste Cadastrado");
  //     res.redirect("/login");
  //   })
  //   .catch((err) => {
  //     console.log("Erro ao Salvar no Banco (User)");
  //   });
});

module.exports = router;
