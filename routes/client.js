const express = require("express");
const mongoose = require("mongoose");

const { userLogin } = require("../helpers/userLogin");
const { userClient } = require("../helpers/userLogin");

require("../models/Package");
require("../models/Client");
require("../models/User");
require("../models/User_type");
require("../models/Batch");
require("../models/Delivery");
require("../models/List_import");
require("../models/Package_Type");

const Packages = mongoose.model("package");
const Client = mongoose.model("client");
const User = mongoose.model("user");
const User_Type = mongoose.model("user_type");
const Batch = mongoose.model("batch");
const Delivery = mongoose.model("delivery");
const List_import = mongoose.model("list_import");
const Package_Type = mongoose.model("package_types");

const router = express.Router();

router.get("/", userClient, (req, res) => {
  Packages.countDocuments({
    status: "Pendente",
    Id_client: res.locals.user.Id_client,
  }).then((pending) => {
    Packages.countDocuments({
      status: "Entregue",
      Id_client: res.locals.user.Id_client,
    }).then((delyvered) => {
      Packages.countDocuments({
        status: "Em rota",
        Id_client: res.locals.user.Id_client,
      }).then((onroute) => {
        Packages.countDocuments({
          status: "Falha na Entrega",
          Id_client: res.locals.user.Id_client,
        }).then((faiuldelivery) => {
          Packages.countDocuments({
            status: "Fora do sistema",
            Id_client: res.locals.user.Id_client,
          }).then((systemout) => {
            Client.findOne({ _id: res.locals.user.Id_client }).then(
              (clientData) => {
                List_import.find({ Id_client: res.locals.user.Id_client }).then(
                  (list) => {
                    res.render("client/index", {
                      layout: "client",
                      clientData: clientData,
                      pending: pending,
                      delyvered: delyvered,
                      faiuldelivery: faiuldelivery,
                      onroute: onroute,
                      systemout: systemout,
                      list: list,
                    });
                  }
                );
              }
            );
          });
        });
      });
    });
  });
});

router.get("/pacotes", userClient, (req, res) => {
  date = new Date().toISOString().slice(0, 10);
  const value = req.query;
  if (req.query.nlist && req.query.nlist != "") {
    Packages.find()
      .and({
        Id_List: req.query.nlist,
        Id_client: res.locals.user.Id_client,
      })
      .populate("Id_type")
      .then((allpackages) => {
        Client.find().then((allcompany) => {
          Package_Type.find().then((alltypes) => {
            res.render("admin/pacotes", {
              alltypes: alltypes,
              date: date,
              allpackages: allpackages,
              allcompany: allcompany,
            });
          });
        });
      });
  } else if (req.query.filter && req.query.filter != "") {
    const datenow = new Date();
    const datenow1 = new Date();
    datenow1.setDate(datenow1.getDate() + 1);
    datenow.setDate(datenow.getDate() - 10);

    Packages.find()
      .and({
        updatedAt: { $gte: new Date(datenow), $lt: new Date(datenow1) },
        status: req.query.filter,
        Id_client: res.locals.user.Id_client,
      })
      .populate("Id_type")
      .then((allpackages) => {
        Client.find().then((allcompany) => {
          res.render("client/pacotes", {
            layout: "client",
            date: date,
            allpackages: allpackages,
            allcompany: allcompany,
          });
        });
      });
  } else if (req.query.npackage == undefined) {
    const datenow = new Date();
    const datenow1 = new Date();
    datenow1.setDate(datenow1.getDate() + 1);
    datenow.setDate(datenow.getDate() - 1);
    Packages.find({
      updatedAt: { $gt: new Date(datenow), $lt: new Date(datenow1) },
      Id_client: res.locals.user.Id_client,
    })
      .populate("Id_type")
      .then((allpackages) => {
        Client.find().then((allcompany) => {
          res.render("client/pacotes", {
            layout: "client",
            allpackages: allpackages,
            date: date,
            allcompany: allcompany,
          });
        });
      });
  } else if (req.query.npackage != "") {
    Packages.find({
      code: req.query.npackage,
      Id_client: res.locals.user.Id_client,
    })
      .populate("Id_type")
      .then((allpackages) => {
        Client.find().then((allcompany) => {
          res.render("client/pacotes", {
            layout: "client",
            allpackages: allpackages,
            date: date,
            value: value,
            allcompany: allcompany,
          });
        });
      });
  } else if (req.query.status_filter != "") {
    dateout = new Date(req.query.dateout);
    dateout.setDate(dateout.getDate() + 1);

    Packages.find()
      .and({
        updatedAt: { $gte: new Date(req.query.datein), $lt: new Date(dateout) },
        status: req.query.status_filter,
        Id_client: res.locals.user.Id_client,
      })
      .populate("Id_type")
      .then((allpackages) => {
        Client.find().then((allcompany) => {
          res.render("client/pacotes", {
            layout: "client",
            allpackages: allpackages,
            date: date,
            value: value,
            allcompany: allcompany,
          });
        });
      });
  } else if (req.query.status_filter == "") {
    dateout = new Date(req.query.dateout);
    dateout.setDate(dateout.getDate() + 1);
    Packages.find({
      updatedAt: { $gte: new Date(req.query.datein), $lt: new Date(dateout) },
      Id_client: res.locals.user.Id_client,
    })
      .populate("Id_type")
      .then((allpackages) => {
        Client.find().then((allcompany) => {
          res.render("client/pacotes", {
            layout: "client",
            allpackages: allpackages,
            date: date,
            value: value,
            allcompany: allcompany,
          });
        });
      });
  }
});

router.get("/entregas/", userClient, (req, res) => {
  date = new Date().toISOString().slice(0, 10);
  const value = req.query;
  if (req.query.datein == "" || req.query.datein == undefined) {
    const datenow = new Date();
    const datenow1 = new Date();
    datenow1.setDate(datenow1.getDate() + 1);
    datenow.setDate(datenow.getDate() - 50);

    Packages.find()
      .and({
        updatedAt: { $gte: new Date(datenow), $lt: new Date(datenow1) },
        Id_client: res.locals.user.Id_client,
      })
      .then((result) => {
        if (req.query.npackage == undefined) {
          const datenow = new Date();
          const datenow1 = new Date();
          datenow1.setDate(datenow1.getDate() + 1);
          datenow.setDate(datenow.getDate() - 1);
          var barcodeResult = [];
          for (item in result) {
            barcodeResult.push(result[item].code);
          }
          Delivery.find({
            barcode: barcodeResult,
            updatedAt: { $gt: new Date(datenow), $lt: new Date(datenow1) },
          })
            .populate("Id_deliveryman")
            .then((alldelivery) => {
              res.render("client/delivery", {
                layout: "client",
                alldelivery: alldelivery,
                date: date,
              });
            });
        }
      });
  } else if (req.query.datein != "" || req.query.datein != undefined) {
    dateout = new Date(req.query.dateout);
    dateout.setDate(dateout.getDate() + 1);

    if (req.query.npackage != "") {
      Delivery.find({ barcode: req.query.npackage })
        .populate("Id_deliveryman")
        .then((alldelivery) => {
          res.render("client/delivery", {
            layout: "client",
            alldelivery: alldelivery,
            date: date,
            value: value,
          });
        });
    } else {
      Packages.find()
        .and({
          updatedAt: {
            $gte: new Date(req.query.datein),
            $lt: new Date(dateout),
          },
          Id_client: res.locals.user.Id_client,
        })
        .then((result) => {
          var barcodeResult = [];

          for (item in result) {
            barcodeResult.push(result[item].code);
          }

          if (req.query.status_filter != "") {
            dateout = new Date(req.query.dateout);
            dateout.setDate(dateout.getDate() + 1);

            Delivery.find()
              .and({
                updatedAt: {
                  $gte: new Date(req.query.datein),
                  $lt: new Date(dateout),
                },
                status: req.query.status_filter,
                barcode: barcodeResult,
              })
              .populate("Id_deliveryman")
              .then((alldelivery) => {
                res.render("client/delivery", {
                  layout: "client",
                  alldelivery: alldelivery,
                  date: date,
                  value: value,
                });
              });
          } else if (req.query.status_filter == "") {
            dateout = new Date(req.query.dateout);
            dateout.setDate(dateout.getDate() + 1);
            Delivery.find({
              updatedAt: {
                $gte: new Date(req.query.datein),
                $lt: new Date(dateout),
              },
              barcode: barcodeResult,
            })
              .populate("Id_deliveryman")
              .then((alldelivery) => {
                res.render("client/delivery", {
                  layout: "client",
                  alldelivery: alldelivery,
                  date: date,
                  value: value,
                });
              });
          }
        });
    }
  }
});

module.exports = router;
