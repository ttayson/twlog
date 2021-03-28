const mongoose = require("mongoose");
require("../models/User");
const User = mongoose.model("user");

module.exports = {
  userLogin: function (req, res, next) {
    if (req.isAuthenticated()) {
      User.findOne({ _id: res.locals.user._id })
        .populate("type")
        .then((isAdmin) => {
          if (isAdmin.type[0].code == 0 || isAdmin.type[0].code == 1) {
            return next();
          } else {
            req.flash("error", "Contate o Administrador");
            res.redirect("/login");
          }
        });
    }
  },

  userClient: function (req, res, next) {
    if (req.isAuthenticated()) {
      User.findOne({ _id: res.locals.user._id })
        .populate("type")
        .then((isAdmin) => {
          if (isAdmin.type[0].code == 3) {
            return next();
          } else {
            req.flash("error", "Contate o Administrador");
            res.redirect("/login");
          }
        });
    }
  },
};
