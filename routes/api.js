const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const randToken = require("rand-token");

require("../models/User");
require("../models/Batch");
require("../models/Delivery");
require("../models/Package");

const User = mongoose.model("user");
const Batch = mongoose.model("batch");
const Delivery = mongoose.model("delivery");
const Packages = mongoose.model("package");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ info: "teste" });
});

router.post("/batch", (req, res) => {
  User.findOne({ token: req.body.token })
    .then((user) => {
      if (!user) {
        res.json({ error: "Invalid Token" });
      } else {
        Batch.findOne({ _id: req.body.qr }).then((batch) => {
          if (batch) {
            if (batch.status != "Em rota") {
              batch.Id_deliveryman = user._id;
              batch.status = "Em rota";

              batch
                .save()
                .then(() => {
                  console.log("Lote recebido");
                  res.json({ success: "ok" });
                })
                .catch((err) => {
                  console.log("Erro no recebimento de lote");
                });
            } else if (batch.status == "Em rota") {
              res.json({ error: "Batch received" });
            }
          } else {
            res.json({ error: "Invalid Batch" });
          }
        });
      }
      // res.json({
      //   name: user.nome,
      //   user: user.login,
      //   token: user.token,
      // });
    })
    .catch(() => {});
});

router.post("/package", (req, res) => {
  User.findOne({ token: req.body.token }).then((user) => {
    if (!user) {
      res.json({ error: "Invalid Token" });
    } else {
      const Newdelivery = {
        barcode: req.body.barcode,
        location: req.body.location,
        img_packge: req.body.img_packge,
        img_received: req.body.img_received,
        status: req.body.status,
        reason: req.body.reason,
        reason_description: req.body.reason_description,
        Id_deliveryman: user._id,
      };

      new Delivery(Newdelivery)
        .save()
        .then(() => {
          console.log("Pacote salvo");
          Packages.updateOne(
            { code: req.body.barcode },
            { $set: { status: req.body.status } }
          )
            .then((updatestatus) => {
              if (updatestatus.nModified == 1) {
                res.json({ success: "Delivery ok" });
              }
            })
            .catch((err) => {
              console.log("err");
            });
        })
        .catch((err) => {
          console.log("Erro ao Salvar no Banco (Entrega)");
        });
    }
  });
});

router.post(
  "/login",
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
        name: user.name,
        user: user.login,
        token: user.token,
      });
    });
  }
);

module.exports = router;
