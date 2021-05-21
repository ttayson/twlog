const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const randToken = require("rand-token");

require("dotenv").config();

require("../models/User");
require("../models/Batch");
require("../models/Delivery");
require("../models/Package");
require("../models/Integration_Intelipost");

const User = mongoose.model("user");
const Batch = mongoose.model("batch");
const Delivery = mongoose.model("delivery");
const Packages = mongoose.model("package");
const Integration_Intelipost = mongoose.model("intelipost");

const router = express.Router();

const routerteste = "carro";

router.post("/prelist", (req, res) => {
  console.log(req.body);

  var reponseArray = [];
  const logistics_provider_shipment_list =
    req.body.intelipost_pre_shipment_list;

  orders_array = [];
  shipment_order_volume_array = [];

  for (item in req.body.shipment_order_array) {
    order_number = req.body.shipment_order_array[item].order_number;
    shipment_order_volume_array = [];

    for (x in req.body.shipment_order_array[item].shipment_order_volume_array) {
      shipment_order_volume_array[x] = {
        shipment_order_volume_number:
          req.body.shipment_order_array[item].shipment_order_volume_array[x]
            .shipment_order_volume_number,
      };
    }
    orders_array.push({
      order_number,
      shipment_order_volume_array,
    });
  }

  reponseArray.push({ logistics_provider_shipment_list, orders_array });

  token = req.get("logistic-provider-api-key");

  if (token != process.env.INTELIPOST_TOKEN) {
    res
      .status(401)
      .send({ type: "ERROR", text: "Este pedido requer autenticação." });
  } else {
    Integration_Intelipost.findOne({
      intelipost_pre_shipment_list: req.body.intelipost_pre_shipment_list,
    }).then(async (response) => {
      if (response) {
        res
          .status(400)
          .send({ type: "ERROR", text: "Pre lista já adicionada." });
      } else {
        await new Integration_Intelipost(req.body).save().then(() => {
          console.log("Pacote de integração");
          res.status(200).send(reponseArray[0]);
        });
      }
    });
  }
});

router.post("/batch", (req, res) => {
  User.findOne({ token: req.body.token })
    .then((user) => {
      if (!user) {
        res.json({ error: "Invalid Token" });
      } else {
        Batch.findOne({ _id: req.body.qr })
          .populate("Package_list")
          .then((batch) => {
            if (batch) {
              if (batch.status == "Pendente") {
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
                      res.json({ success: "ok", batchInfo: batch });
                    });
                  })
                  .catch((err) => {
                    console.log("Erro no recebimento de lote");
                  });
              } else if (
                batch.status == "Em rota" ||
                batch.status == "Concluído"
              ) {
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
      console.log(
        "TS - usuário: " +
          user.name +
          " Imei:" +
          req.body.imei +
          " Versão:" +
          req.body.app_version
      );
      Packages.findOne({
        $and: [
          { code: req.body.barcode.toUpperCase().trim() },
          {
            $or: [
              { status: "Pendente" },
              { status: "Em rota" },
              { status: "Falha na Entrega" },
            ],
          },
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
                  barcode: req.body.barcode.toUpperCase(),
                  location: req.body.location,
                  receiver_name: req.body.receiver_name,
                  img_package: req.body.img_package,
                  img_received: req.body.img_received,
                  status: req.body.status,
                  reason: req.body.reason,
                  reason_description: req.body.reason_description,
                  Id_deliveryman: user._id,
                  delivery_date: req.body.date,
                };

                new Delivery(Newdelivery).save().then(() => {
                  console.log("Pacote Sincronizado - usuário: " + user.name);
                  res.json({ success: "Delivery ok" });
                });
              })
              .catch((err) => {
                console.log("err");
              });
          } else {
            const Newdelivery = {
              barcode: req.body.barcode.toUpperCase(),
              location: req.body.location,
              receiver_name: req.body.receiver_name,
              img_package: req.body.img_package,
              img_received: req.body.img_received,
              status: "Fora do sistema",
              reason: req.body.reason,
              reason_description: req.body.reason_description,
              Id_deliveryman: user._id,
              delivery_date: req.body.date,
            };

            new Delivery(Newdelivery).save().then(() => {
              console.log(
                "Pacote Sincronizado (Fora do Sistema) - usuário: " + user.name
              );
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
          console.log("Login APP: " + user.name);
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
