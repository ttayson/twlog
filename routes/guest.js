const express = require("express");
const mongoose = require("mongoose");

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

router.post("/login", (req, res, next) => {
  // Rota de Login
  passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

module.exports = router;
