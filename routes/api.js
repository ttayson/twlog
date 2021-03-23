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
  res.json({ info: "Api" });
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
                  Packages.updateMany(
                    { _id: batch.Package_list },
                    { $set: { status: "Em rota" } }
                  ).then(() => {
                    res.json({ success: "ok" });
                  });
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
    })
    .catch(() => {});
});

router.post("/delivery", (req, res) => {
  User.findOne({ token: req.body.token }).then((user) => {
    if (!user) {
      res.json({ error: "Invalid Token" });
    } else {
      Packages.findOne({
        $and: [
          { code: req.body.barcode },
          { $or: [{ status: "Pendente" }, { status: "Em rota" }] },
        ],
      })
        .then(async (pack) => {
          if (pack) {
            await Packages.updateOne(
              { _id: pack._id },
              { $set: { status: req.body.status } }
            )
              .then(() => {
                const Newdelivery = {
                  barcode: req.body.barcode,
                  location: req.body.location,
                  img_package: req.body.img_package,
                  img_received: req.body.img_received,
                  status: req.body.status,
                  reason: req.body.reason,
                  reason_description: req.body.reason_description,
                  Id_deliveryman: user._id,
                };

                new Delivery(Newdelivery).save().then(() => {
                  console.log("Pacote salvo");
                  res.json({ success: "Delivery ok" });
                });
              })
              .catch((err) => {
                console.log("err");
              });
          } else {
            const Newdelivery = {
              barcode: req.body.barcode,
              location: req.body.location,
              img_package: req.body.img_package,
              img_received: req.body.img_received,
              status: "Fora do sistema",
              reason: req.body.reason,
              reason_description: req.body.reason_description,
              Id_deliveryman: user._id,
            };

            new Delivery(Newdelivery).save().then(() => {
              console.log("Pacote salvo");
              res.json({ success: "Delivery ok" });
            });
          }
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
  async function (req, res) {
    await User.updateOne(
      { login: req.body.login },
      { $set: { token: randToken.generate(64) } }
    )
      .then(() => {
        User.findOne({ login: req.body.login }).then((user) => {
          res.json({
            name: user.name,
            user: user.login,
            token: user.token,
          });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

module.exports = router;
