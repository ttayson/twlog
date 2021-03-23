const mongoose = require("mongoose");
require("../models/User");
const User = mongoose.model("user");

module.exports = {
  userLogin: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error", "Login necessário");
    res.redirect("/login");
  },

  userAdmin: function (req, res, next) {
    if (req.isAuthenticated()) {
      User.findOne({ _id: res.locals.user._id })
        .populate("type")
        .then((isAdmin) => {
          if (isAdmin.type[0].code == 1) {
            return next();
          }
        });
    }
    req.flash("error", "Contate o Administrador");
  },
};
