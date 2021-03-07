const express = require("express");
const mongoose = require("mongoose");

const { userLogin } = require("../helpers/userLogin");

//Tratamento do CSV
const neatCsv = require("neat-csv");
const fs = require("fs");

// Upload files
const UploadCSV = require("../helpers/uploadCSV");

require("../models/Package");
const Packages = mongoose.model("package");

const router = express.Router();

router.get("/", (req, res) => {
  // res.json({ ok: "Teste admin" });
  res.render("admin/index");
});

router.get("/pacotes", (req, res) => {
  Packages.find({ status: "Aguardando" }).then((allpackage) => {
    res.render("admin/pacotes", { allpackage: allpackage });
  });
});

router.get("/addpacote", (req, res) => {
  res.render("admin/addpackage");
});

router.get("/editpacote", (req, res) => {
  res.render("admin/editpackage");
});

router.get("/lotes", (req, res) => {
  // res.json({ ok: "Teste admin" });
  res.render("admin/lotes");
});

router.get("/addlote", (req, res) => {
  res.render("admin/addbatch");
});

router.post("/importpackage", UploadCSV.single("file"), (req, res) => {
  fs.readFile("./uploads/file.csv", async (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const PackageImport = await neatCsv(data);

    console.log(PackageImport);

    for (item in PackageImport) {
      const newImport = {
        code: PackageImport[item]["code"],
        receiver: PackageImport[item]["receiver"],
        city: PackageImport[item]["city"],
        address: PackageImport[item]["address"],
        state: PackageImport[item]["state"],
        cep: PackageImport[item]["cep"],
        status: "Aguardando",
      };

      await new Packages(newImport)
        .save()
        .then(() => {
          console.log("Pacotes Importados com Sucesso");
        })
        .catch((err) => {
          console.log("Erro ao Salvar no Banco (Pacotes)");
        });
    }
  });

  res.redirect("/admin/pacotes");
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("error", "Logout realizado");
  res.redirect("/login");
});

module.exports = router;
