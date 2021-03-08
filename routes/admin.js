const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { userLogin } = require("../helpers/userLogin");

//Tratamento do CSV
const neatCsv = require("neat-csv");
const fs = require("fs");

// Upload files
const UploadCSV = require("../helpers/uploadCSV");

require("../models/Package");
require("../models/Client");
require("../models/User");
const Packages = mongoose.model("package");
const Client = mongoose.model("client");
const User = mongoose.model("user");

const router = express.Router();

router.get("/", (req, res) => {
  // res.json({ ok: "Teste admin" });
  res.render("admin/index");
});

router.get("/pacotes", (req, res) => {
  Packages.find({ status: "Aguardando" }).then((allpackage) => {
    Client.find().then((allcompany) => {
      res.render("admin/pacotes", {
        allpackage: allpackage,
        allcompany: allcompany,
      });
    });
  });
});

router.get("/addpacote", (req, res) => {
  Client.find().then((allcompany) => {
    res.render("admin/addpackage", { allcompany: allcompany });
  });
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
    !req.body.company ||
    typeof req.body.company == undefined ||
    req.body.company == null
  ) {
    erros.push({ text: "Empresa inválida" });
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
      Id_client: req.body.company,
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
      console.log(package);
      Client.find().then((allcompany) => {
        res.render("admin/editpackage", {
          package: package,
          allcompany: allcompany,
        });
      });
    })
    .catch((err) => {
      console.log("Erro ao editar um pacote");
    });
});

router.post("/editpacote", (req, res) => {
  Packages.findOne({ _id: req.body.id }).then((package) => {
    var erros = [];

    if (
      !req.body.code ||
      typeof req.body.code == undefined ||
      req.body.code == null
    ) {
      erros.push({ text: "Pacote inválido" });
    }

    if (
      !req.body.company ||
      typeof req.body.company == undefined ||
      req.body.company == null
    ) {
      erros.push({ text: "Empresa inválida" });
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
      package.Id_client = req.body.company;
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
      console.log("Erro ao procurar pacote");
    });
});

router.get("/user", (req, res) => {
  User.find()
    .populate("Id_client")
    .then((alluser) => {
      console.log(alluser);
      res.render("admin/users", { alluser: alluser });
    });
});

router.get("/adduser", (req, res) => {
  Client.find().then((allcompany) => {
    res.render("admin/adduser", { allcompany: allcompany });
  });
});

router.post("/adduser", (req, res) => {
  var erros = [];

  if (
    !req.body.name ||
    typeof req.body.name == undefined ||
    req.body.name == null
  ) {
    erros.push({ text: "Nome inválido" });
  }

  if (
    !req.body.user ||
    typeof req.body.user == undefined ||
    req.body.user == null
  ) {
    erros.push({ text: "User inválido" });
  }

  if (
    !req.body.company ||
    typeof req.body.company == undefined ||
    req.body.company == null
  ) {
    erros.push({ text: "Empresa inválida" });
  }

  if (
    !req.body.type ||
    typeof req.body.type == undefined ||
    req.body.type == null
  ) {
    erros.push({ text: "Tipo inválido" });
  }

  if (
    !req.body.userpass ||
    typeof req.body.userpass == undefined ||
    req.body.userpass == null
  ) {
    erros.push({ text: "Senha inválida" });
  }

  if (erros.length > 0) {
    res.render("admin/adduser", { erros: erros });
  } else {
    const NewUser = {
      name: req.body.name,
      email: req.body.email,
      login: req.body.user,
      type: req.body.type,
      Id_client: req.body.company,
      userpass: req.body.userpass,
    };

    bcrypt.genSalt(10, (erro, salt) => {
      bcrypt.hash(NewUser.userpass, salt, (erro, hash) => {
        if (erro) {
          console.log("Erro ao salvar usuário");
        } else {
          NewUser.userpass = hash;

          new User(NewUser)
            .save()
            .then(() => {
              console.log("Usuário Cadastrado");
              res.redirect("/login");
            })
            .catch((err) => {
              console.log("Erro ao Salvar no Banco (User)");
            });
        }
      });
    });
  }
});

router.get("/empresas", (req, res) => {
  Client.find().then((allpcompany) => {
    res.render("admin/company", { allpcompany: allpcompany });
  });
});

router.get("/editempresa/:id", (req, res) => {
  Client.findOne({ _id: req.params.id })
    .then((company) => {
      res.render("admin/editcompany", { company: company });
    })
    .catch((err) => {
      console.log("Erro ao editar um empresa");
    });
});

router.post("/editempresa", (req, res) => {
  Client.findOne({ _id: req.body.id }).then((company) => {
    var erros = [];

    if (
      !req.body.name ||
      typeof req.body.name == undefined ||
      req.body.name == null
    ) {
      erros.push({ text: "Nome inválido" });
    }

    if (
      !req.body.cnpj ||
      typeof req.body.cnpj == undefined ||
      req.body.cnpj == null
    ) {
      erros.push({ text: "CPNJ inválido" });
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
      res.render("admin/addcompany", { erros: erros });
    } else {
      company.name = req.body.name;
      company.cnpj = req.body.cnpj;
      company.cep = req.body.cep;
      company.address = req.body.address;
      company.city = req.body.city;
      company.state = req.body.state;

      company
        .save()
        .then(() => {
          console.log("Empresa editada");
          res.redirect("/admin/empresas");
        })
        .catch((err) => {
          console.log("Erro ao Salvar no Banco (Empresa)");
        });
    }
  });
});

router.get("/addempresa", (req, res) => {
  res.render("admin/addcompany");
});

router.post("/addempresa", (req, res) => {
  var erros = [];

  if (
    !req.body.name ||
    typeof req.body.name == undefined ||
    req.body.name == null
  ) {
    erros.push({ text: "Nome inválido" });
  }

  if (
    !req.body.cnpj ||
    typeof req.body.cnpj == undefined ||
    req.body.cnpj == null
  ) {
    erros.push({ text: "CPNJ inválido" });
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
    res.render("admin/addcompany", { erros: erros });
  } else {
    const NewCompany = {
      name: req.body.name,
      cnpj: req.body.cnpj,
      cep: req.body.cep,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
    };

    new Client(NewCompany)
      .save()
      .then(() => {
        console.log("Empresa cadastrada");
        res.redirect("/admin/empresas");
      })
      .catch((err) => {
        console.log("Erro ao Salvar no Banco (Empresa)");
      });
  }
});

router.post("/delcompany", (req, res) => {
  Client.remove({ _id: req.body.id })
    .then(() => {
      res.json({ ok: "deletok" });
    })
    .catch((err) => {
      console.log("Erro ao procurar company");
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

    for (item in PackageImport) {
      const newImport = {
        Id_client: req.body.company,
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
