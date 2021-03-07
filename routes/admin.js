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

router.post("/addpacote", (req, res) => {
  var erros = [];

  if (
    !req.body.code ||
    typeof req.body.code == undefined ||
    req.body.code == null
  ) {
    erros.push({ text: "Pacote inválido" });
  }

  if (
    !req.body.receiver ||
    typeof req.body.receiver == undefined ||
    req.body.receiver == null
  ) {
    erros.push({ text: "Destinatário inválido" });
  }

  if (
    !req.body.cep ||
    typeof req.body.cep == undefined ||
    req.body.cep == null
  ) {
    erros.push({ text: "CEP inválido" });
  }

  if (
    !req.body.address ||
    typeof req.body.address == undefined ||
    req.body.address == null
  ) {
    erros.push({ text: "Endereço inválido" });
  }

  if (
    !req.body.city ||
    typeof req.body.city == undefined ||
    req.body.city == null
  ) {
    erros.push({ text: "Cidade inválida" });
  }

  if (
    !req.body.state ||
    typeof req.body.state == undefined ||
    req.body.state == null
  ) {
    erros.push({ text: "Estado inválido" });
  }

  if (erros.length > 0) {
    res.render("admin/addpackage", { erros: erros });
  } else {
    const NewPackage = {
      code: req.body.code,
      receiver: req.body.receiver,
      cep: req.body.cep,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      status: "Aguardando",
    };

    new Packages(NewPackage)
      .save()
      .then(() => {
        console.log("Pacote cadastrado");
        res.redirect("/admin/pacotes");
      })
      .catch((err) => {
        console.log("Erro ao Salvar no Banco (Pacote)");
      });
  }
});

router.get("/editpacote", (req, res) => {
  res.render("admin/editpackage");
});

router.get("/editpacote/:id", (req, res) => {
  Packages.findOne({ _id: req.params.id })
    .then((package) => {
      res.render("admin/editpackage", { package: package });
    })
    .catch((err) => {
      console.log("Erro ao editar um pacote");
    });
});

router.post("/editpacote", (req, res) => {
  Packages.findOne({ _id: req.body.id }).then((package) => {
    console.log(req.body);
    var erros = [];

    if (
      !req.body.code ||
      typeof req.body.code == undefined ||
      req.body.code == null
    ) {
      erros.push({ text: "Pacote inválido" });
    }

    if (
      !req.body.receiver ||
      typeof req.body.receiver == undefined ||
      req.body.receiver == null
    ) {
      erros.push({ text: "Destinatário inválido" });
    }

    if (
      !req.body.cep ||
      typeof req.body.cep == undefined ||
      req.body.cep == null
    ) {
      erros.push({ text: "CEP inválido" });
    }

    if (
      !req.body.address ||
      typeof req.body.address == undefined ||
      req.body.address == null
    ) {
      erros.push({ text: "Endereço inválido" });
    }

    if (
      !req.body.city ||
      typeof req.body.city == undefined ||
      req.body.city == null
    ) {
      erros.push({ text: "Cidade inválida" });
    }

    if (
      !req.body.state ||
      typeof req.body.state == undefined ||
      req.body.state == null
    ) {
      erros.push({ text: "Estado inválido" });
    }

    if (erros.length > 0) {
      res.render("admin/editpackage", { erros: erros, package: package });
    } else {
      package.code = req.body.code;
      package.receiver = req.body.receiver;
      package.cep = req.body.cep;
      package.address = req.body.address;
      package.city = req.body.city;
      package.state = req.body.state;
      package.status = "Aguardando";

      package
        .save()
        .then(() => {
          console.log("Pacote editado com Sucesso");
          res.redirect("/admin/pacotes");
        })
        .catch((err) => {
          console.log("Erro ao Salvar no Banco (Pacote)");
        });
    }
  });
});

router.post("/delpackage", (req, res) => {
  Packages.remove({ _id: req.body.id })
    .then(() => {
      res.json({ ok: "deletok" });
    })
    .catch((err) => {
      console.log("Erro ao procurar pacte");
    });
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
