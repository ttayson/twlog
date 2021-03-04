const express = require("express");
const mongoose = require("mongoose");

const { userLogin } = require("../helpers/userLogin");

const router = express.Router();

router.get("/", (req, res) => {
  // res.json({ ok: "Teste admin" });
  res.render("admin/index");
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("error", "Logout realizado");
  res.redirect("/login");
});

module.exports = router;
