const express = require("express");
const mongoose = require("mongoose");
const randToken = require("rand-token");

require("../models/User");

const User = mongoose.model("user");

const passport = require("passport");
const bcrypt = require("bcryptjs");

const { userLogin } = require("../helpers/userLogin");

const router = express.Router();

router.get("/", (req, res) => {
  // res.render("admin/index");
  res.json({ ok: "Teste" });
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
  function (req, res) {
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
  }
);

router.post(
  "/apilogin",
  passport.authenticate("local", {
    failureRedirect: "",
  }),
  function (req, res) {
    User.updateOne(
      { login: req.body.login },
      { $set: { token: randToken.generate(64) } }
    )
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });

    User.findOne({ login: req.body.login }).then((user) => {
      res.json({
        name: user.nome,
        user: user.login,
        token: user.token,
      });
    });
  }
);

router.get("/cadastrar", (req, res) => {
  const user = {
    nome: "Talles Tayson",
    login: "ttayson",
    email: "tallestayson@gmail.com",
    userpass: "123456",
  };

  bcrypt.genSalt(10, (erro, salt) => {
    bcrypt.hash(user.userpass, salt, (erro, hash) => {
      if (erro) {
        console.log("Erro ao salvar usuário");
      } else {
        user.userpass = hash;

        new User(user)
          .save()
          .then(() => {
            console.log("Usuário Cadastrado");
            res.redirect("/login");
          })
          .catch((err) => {
            console.log("Erro ao Salvar no Banco (User)");
          });
      }
    });
  });
});

module.exports = router;
