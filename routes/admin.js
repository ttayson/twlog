const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const qr = require("qr-image");

const { userLogin } = require("../helpers/userLogin");

//Tratamento do CSV
const neatCsv = require("neat-csv");
const fs = require("fs");

// Upload files
const UploadCSV = require("../helpers/uploadCSV");

require("../models/Package");
require("../models/Client");
require("../models/User");
require("../models/User_type");
require("../models/Batch");
require("../models/Delivery");

const Packages = mongoose.model("package");
const Client = mongoose.model("client");
const User = mongoose.model("user");
const User_Type = mongoose.model("user_type");
const Batch = mongoose.model("batch");
const Delivery = mongoose.model("delivery");

const router = express.Router();

router.get("/", userLogin, (req, res) => {
  res.render("admin/index");
});

router.get("/pacotes", userLogin, (req, res) => {
  Packages.find({ status: "Pendente" }).then((allpackage) => {
    Client.find().then((allcompany) => {
      res.render("admin/pacotes", {
        allpackage: allpackage,
        allcompany: allcompany,
      });
    });
  });
});

router.get("/addpacote", userLogin, (req, res) => {
  Client.find().then((allcompany) => {
    res.render("admin/addpackage", { allcompany: allcompany });
  });
});

router.post("/addpacote", userLogin, (req, res) => {
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
      status: "Pendente",
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

router.get("/editpacote", userLogin, (req, res) => {
  res.render("admin/editpackage");
});

router.get("/editpacote/:id", userLogin, (req, res) => {
  Packages.findOne({ _id: req.params.id })
    .populate("Id_client")
    .then((package) => {
      Client.find({ _id: { $ne: package.Id_client[0]._id } }).then(
        (allcompany) => {
          res.render("admin/editpackage", {
            package: package,
            allcompany: allcompany,
          });
        }
      );
    })
    .catch((err) => {
      console.log("Erro ao editar um pacote");
    });
});

router.post("/editpacote", userLogin, (req, res) => {
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

router.post("/delpackage", userLogin, (req, res) => {
  Packages.deleteOne({ _id: req.body.id })
    .then(() => {
      res.json({ ok: "deletok" });
    })
    .catch((err) => {
      console.log("Erro ao procurar pacote");
    });
});

router.get("/user", userLogin, (req, res) => {
  User.find()
    .populate("type")
    .populate("Id_client")
    .then((alluser) => {
      res.render("admin/users", { alluser: alluser });
    });
});

router.get("/adduser", userLogin, (req, res) => {
  Client.find().then((allcompany) => {
    User_Type.find().then((usertype) => {
      res.render("admin/adduser", {
        allcompany: allcompany,
        usertype: usertype,
      });
    });
  });
});

router.post("/adduser", userLogin, (req, res) => {
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

router.post("/edituser", userLogin, (req, res) => {
  User.findOne({ _id: req.body.id }).then((edituser) => {
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

    if (erros.length > 0) {
      res.render("admin/edituser", { erros: erros });
    } else {
      edituser.name = req.body.name;
      edituser.email = req.body.email;
      edituser.login = req.body.user;
      edituser.type = req.body.type;
      edituser.Id_client = req.body.company;
      edituser.userpass = req.body.userpass;

      bcrypt.genSalt(10, (erro, salt) => {
        bcrypt.hash(edituser.userpass, salt, (erro, hash) => {
          if (erro) {
            console.log("Erro ao salvar usuário");
          } else {
            edituser.userpass = hash;

            edituser
              .save()
              .then(() => {
                console.log("Usuário editado");
                res.redirect("/admin/user");
              })
              .catch((err) => {
                console.log("Erro ao Salvar no Banco (User)");
              });
          }
        });
      });
    }
  });
});

router.get("/edituser/:id", userLogin, (req, res) => {
  User.findOne({ _id: req.params.id })
    .populate("Id_client")
    .populate("type")
    .then((edituser) => {
      Client.find({ _id: { $ne: edituser.Id_client[0]._id } }).then(
        (client) => {
          User_Type.find({ _id: { $ne: edituser.type[0]._id } }).then(
            (user_type) => {
              res.render("admin/edituser", {
                edituser: edituser,
                client: client,
                user_type: user_type,
              });
            }
          );
        }
      );
    });
});

router.post("/deluser", userLogin, (req, res) => {
  User.deleteOne({ _id: req.body.id })
    .then(() => {
      res.json({ ok: "deletok" });
    })
    .catch((err) => {
      console.log("Erro ao procurar user");
    });
});

router.get("/empresas", userLogin, (req, res) => {
  Client.find().then((allpcompany) => {
    res.render("admin/company", { allpcompany: allpcompany });
  });
});

router.get("/editempresa/:id", userLogin, (req, res) => {
  Client.findOne({ _id: req.params.id })
    .then((company) => {
      res.render("admin/editcompany", { company: company });
    })
    .catch((err) => {
      console.log("Erro ao editar um empresa");
    });
});

router.post("/editempresa", userLogin, (req, res) => {
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

router.get("/addempresa", userLogin, (req, res) => {
  res.render("admin/addcompany");
});

router.post("/addempresa", userLogin, (req, res) => {
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

router.post("/delcompany", userLogin, (req, res) => {
  Client.deleteOne({ _id: req.body.id })
    .then(() => {
      res.json({ ok: "deletok" });
    })
    .catch((err) => {
      console.log("Erro ao procurar company");
    });
});

router.get("/lotes", userLogin, (req, res) => {
  Batch.find()
    .populate("Id_deliveryman")
    .then((allbatchs) => {
      res.render("admin/lotes", { allbatchs: allbatchs });
    });
});

router.get("/addlote", userLogin, (req, res) => {
  Packages.find({ status: "Pendente" }).then((allpackage) => {
    res.render("admin/addbatch", { allpackage: allpackage });
  });
});

router.post("/addlote", userLogin, (req, res) => {
  var id_package = [];

  for (item in req.body) {
    if (req.body[item].id != undefined) {
      id_package.push(req.body[item].id);
    }
  }

  const NewBatch = {
    Package_list: id_package,
    received: false,
    status: "Pendente",
  };

  new Batch(NewBatch)
    .save()
    .then(() => {
      for (item in req.body) {
        if (req.body[item].id != undefined) {
          Packages.updateOne(
            { _id: req.body[item].id },
            { $set: { status: "Em lote" } }
          )
            .then(() => {})
            .catch((err) => {
              console.log(err);
            });
        }
      }
      console.log("Lote cadastrado");
      res.json({ info: "loteok" });
    })
    .catch((err) => {
      console.log("Erro ao Salvar no Banco (Lote)" + err);
    });
});

router.post("/dellote", userLogin, (req, res) => {
  Batch.findOne({ _id: req.body.id }).then(async (batch) => {
    for (item in batch.Package_list) {
      await Packages.updateOne(
        { _id: batch.Package_list[item] },
        { $set: { status: "Pendente" } }
      )
        .then(() => {})
        .catch((err) => {
          console.log(err);
        });
    }
    Batch.deleteOne({ _id: req.body.id })
      .then(() => {
        res.json({ ok: "deletok" });
      })
      .catch((err) => {
        console.log("Erro ao procurar Lote");
      });
  });
});

router.get("/entregas/", userLogin, (req, res) => {
  date = new Date().toLocaleDateString("pt-BR");
  date = date.split("/");
  date = date[2] + "-" + date[1] + "-" + date[0];

  const value = req.query;

  if (req.query.npackage == undefined) {
    const datenow = new Date();
    const datenow1 = new Date();
    datenow1.setDate(datenow1.getDate() + 1);
    datenow.setDate(datenow.getDate() - 1);
    Delivery.find({
      date: { $gte: new Date(datenow), $lt: new Date(datenow1) },
    }).then((alldelivery) => {
      res.render("admin/delivery", { alldelivery: alldelivery, date: date });
    });
  } else if (req.query.npackage != "") {
    Delivery.find({ barcode: req.query.npackage }).then((alldelivery) => {
      res.render("admin/delivery", {
        alldelivery: alldelivery,
        date: date,
        value: value,
      });
    });
  } else if (req.query.status_filter != "") {
    dateout = new Date(req.query.dateout);
    dateout.setDate(dateout.getDate() + 1);

    Delivery.find()
      .and({
        date: { $gte: new Date(req.query.datein), $lt: new Date(dateout) },
        status: req.query.status_filter,
      })
      .then((alldelivery) => {
        res.render("admin/delivery", {
          alldelivery: alldelivery,
          date: date,
          value: value,
        });
      });
  } else if (req.query.status_filter == "") {
    dateout = new Date(req.query.dateout);
    dateout.setDate(dateout.getDate() + 1);
    Delivery.find({
      date: { $gte: new Date(req.query.datein), $lt: new Date(dateout) },
    }).then((alldelivery) => {
      res.render("admin/delivery", {
        alldelivery: alldelivery,
        date: date,
        value: value,
      });
    });
  }
});

router.post(
  "/importpackage",
  UploadCSV.single("file"),
  userLogin,
  (req, res) => {
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
          status: "Pendente",
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
  }
);

router.get("/qrcode/:code", userLogin, (req, res) => {
  const code = qr.image(req.params.code, { type: "svg" });

  res.type("svg");

  code.pipe(res);
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("error", "Logout realizado");
  res.redirect("/login");
});

module.exports = router;
