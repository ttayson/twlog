const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const qr = require("qr-image");
const format = require("date-fns/format");

const { userLogin } = require("../helpers/userLogin");
const { userAdmin } = require("../helpers/userLogin");

//Tratamento do CSV
const neatCsv = require("neat-csv");
const fs = require("fs");

// Upload files
const UploadCSV = require("../helpers/uploadCSV");
const {
  import_intelipost,
  event_inteliport,
} = require("../helpers/Import_List");
const { tag } = require("../helpers/etiqueta");
const { deliveryUpdate } = require("../helpers/cron");

require("../models/Package");
require("../models/Client");
require("../models/User");
require("../models/User_type");
require("../models/Batch");
require("../models/Delivery");
require("../models/Package_Type");
require("../models/List_import");

const Packages = mongoose.model("package");
const Client = mongoose.model("client");
const User = mongoose.model("user");
const User_Type = mongoose.model("user_type");
const Batch = mongoose.model("batch");
const Delivery = mongoose.model("delivery");
const Package_Types = mongoose.model("package_types");
const List_Import = mongoose.model("list_import");

const router = express.Router();

router.get("/", userLogin, (req, res) => {
  Packages.countDocuments({ status: "Pendente" }).then((pending) => {
    Packages.countDocuments({ status: "Entregue" }).then((delyvered) => {
      Packages.countDocuments({ status: "Em rota" }).then((onroute) => {
        Packages.countDocuments({ status: "Falha na Entrega" }).then(
          (faiuldelivery) => {
            Packages.countDocuments({ status: "Fora do sistema" }).then(
              (systemout) => {
                List_Import.find().then((list) => {
                  res.render("admin/index", {
                    pending: pending,
                    delyvered: delyvered,
                    faiuldelivery: faiuldelivery,
                    onroute: onroute,
                    systemout: systemout,
                    list: list,
                  });
                });
              }
            );
          }
        );
      });
    });
  });
});

router.get("/pacotes", userLogin, (req, res) => {
  date = new Date().toISOString().slice(0, 10);

  const value = req.query;
  if (req.query.nlist && req.query.nlist != "") {
    Packages.find({ Id_List: req.query.nlist })
      .populate("Id_type")
      .then((allpackages) => {
        Client.find().then((allcompany) => {
          Package_Types.find().then((alltypes) => {
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
      })
      .populate("Id_type")
      .then((allpackages) => {
        Client.find().then((allcompany) => {
          Package_Types.find().then((alltypes) => {
            res.render("admin/pacotes", {
              alltypes: alltypes,
              date: date,
              allpackages: allpackages,
              allcompany: allcompany,
            });
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
    })
      .populate("Id_type")
      .then((allpackages) => {
        Client.find().then((allcompany) => {
          Package_Types.find().then((alltypes) => {
            res.render("admin/pacotes", {
              alltypes: alltypes,
              allpackages: allpackages,
              date: date,
              allcompany: allcompany,
            });
          });
        });
      });
  } else if (req.query.npackage != "") {
    Packages.find({ code: req.query.npackage })
      .populate("Id_type")
      .then((allpackages) => {
        Client.find().then((allcompany) => {
          Package_Types.find().then((alltypes) => {
            res.render("admin/pacotes", {
              allpackages: allpackages,
              alltypes: alltypes,
              date: date,
              value: value,
              allcompany: allcompany,
            });
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
      })
      .populate("Id_type")
      .then((allpackages) => {
        Client.find().then((allcompany) => {
          Package_Types.find().then((alltypes) => {
            res.render("admin/pacotes", {
              allpackages: allpackages,
              alltypes: alltypes,
              date: date,
              value: value,
              allcompany: allcompany,
            });
          });
        });
      });
  } else if (req.query.status_filter == "") {
    dateout = new Date(req.query.dateout);
    dateout.setDate(dateout.getDate() + 1);
    Packages.find({
      updatedAt: { $gte: new Date(req.query.datein), $lt: new Date(dateout) },
    })
      .populate("Id_type")
      .then((allpackages) => {
        Client.find().then((allcompany) => {
          Package_Types.find().then((alltypes) => {
            res.render("admin/pacotes", {
              allpackages: allpackages,
              alltypes: alltypes,
              date: date,
              value: value,
              allcompany: allcompany,
            });
          });
        });
      });
  }
});

router.get("/addpacote", userLogin, (req, res) => {
  Client.find().then((allcompany) => {
    Package_Types.find().then((alltypes) => {
      res.render("admin/addpackage", {
        allcompany: allcompany,
        alltypes: alltypes,
      });
    });
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
    !req.body.district ||
    typeof req.body.district == undefined ||
    req.body.district == null
  ) {
    erros.push({ text: "Bairro inválido" });
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
      code: req.body.code.toUpperCase().trim(),
      receiver: req.body.receiver.trim(),
      Id_client: req.body.company,
      Id_type: req.body.type,
      note_number: req.body.notenumber,
      cep: req.body.cep.trim(),
      address: req.body.address.trim(),
      district: req.body.district.trim(),
      city: req.body.city.trim(),
      state: req.body.state.trim(),
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
    .populate("Id_type")
    .then((package) => {
      Client.find({ _id: { $ne: package.Id_client[0]._id } }).then(
        (allcompany) => {
          Package_Types.find({ _id: { $ne: package.Id_type[0]._id } }).then(
            (alltypes) => {
              res.render("admin/editpackage", {
                package: package,
                allcompany: allcompany,
                alltypes: alltypes,
              });
            }
          );
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
      !req.body.district ||
      typeof req.body.district == undefined ||
      req.body.district == null
    ) {
      erros.push({ text: "Bairro inválido" });
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
      package.Id_type = req.body.type;
      package.note_number = req.body.notenumber;
      package.receiver = req.body.receiver;
      package.cep = req.body.cep;
      package.address = req.body.address;
      package.district = req.body.district;
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
  Packages.findOne({ _id: req.body.id }).then((package) => {
    if (package.status != "Pendente") {
      res.json({ ok: "accessdenied" });
    } else {
      Packages.deleteOne({ _id: req.body.id })
        .then(() => {
          res.json({ ok: "deletok" });
        })
        .catch((err) => {
          console.log("Erro ao procurar pacote");
        });
    }
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
      name: req.body.name.trim(),
      email: req.body.email.toLowerCase().trim(),
      login: req.body.user.toLowerCase().trim(),
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
              req.flash("success_msg", "Usuário Cadastrado");
              res.redirect("/admin/adduser");
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
      edituser.name = req.body.name.trim();
      edituser.email = req.body.email.toLowerCase().trim();
      edituser.login = req.body.user.toLowerCase().trim();
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

router.get("/tipos", userLogin, (req, res) => {
  Package_Types.find().then((alltypes) => {
    res.render("admin/types", { alltypes: alltypes });
  });
});

router.get("/addtipos", userLogin, (req, res) => {
  res.render("admin/addPackagetypes");
});

router.post("/addtipos", userLogin, (req, res) => {
  var erros = [];

  if (
    !req.body.description ||
    typeof req.body.description == undefined ||
    req.body.description == null
  ) {
    erros.push({ text: "Nome inválido" });
  }

  if (
    !req.body.type ||
    typeof req.body.type == undefined ||
    req.body.type == null
  ) {
    erros.push({ text: "Tipo inválido" });
  }

  if (erros.length > 0) {
    res.render("admin/addPackagetypes", { erros: erros });
  } else {
    const Newtype = {
      description: req.body.description.trim(),
      type: req.body.type.trim(),
    };

    new Package_Types(Newtype)
      .save()
      .then(() => {
        console.log("Tipo cadastrado");
        req.flash("success_msg", "Tipo Cadastrado");
        res.redirect("/admin/tipos");
      })
      .catch((err) => {
        console.log("Erro ao Salvar no Banco (Tipos)");
        req.flash("error_msg", "Erro ao cadastrar empresa, verifique dados");
        res.redirect("/admin/addtipos");
      });
  }
});

router.get("/edittipos/:id", userLogin, (req, res) => {
  Package_Types.findOne({ _id: req.params.id })
    .then((types) => {
      res.render("admin/EditPackagetypes", { types: types });
    })
    .catch((err) => {
      console.log("Erro ao editar um Tipo");
    });
});

router.post("/edittipos", userLogin, (req, res) => {
  Package_Types.findOne({ _id: req.body.id }).then((types) => {
    var erros = [];

    if (
      !req.body.type ||
      typeof req.body.type == undefined ||
      req.body.type == null
    ) {
      erros.push({ text: "Tipo inválido" });
    }

    if (
      !req.body.description ||
      typeof req.body.description == undefined ||
      req.body.description == null
    ) {
      erros.push({ text: "Descrição inválida" });
    }

    if (erros.length > 0) {
      req.flash("error_msg", "Verifique campos em branco ou inválidos");
      res.redirect("/admin/edittipos/" + req.body.id);
    } else {
      types.type = req.body.type.trim();
      types.description = req.body.description.trim();

      types
        .save()
        .then(() => {
          console.log("Tipo editado");
          res.redirect("/admin/tipos");
        })
        .catch((err) => {
          console.log("Erro ao Salvar no Banco (Tipos)");
          req.flash("error_msg", "Erro ao cadastrar tipo, verifique dados");
          res.redirect("/admin/edittipos/" + req.body.id);
        });
    }
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
      req.flash("error_msg", "Verifique campos em branco ou inválidos");
      res.redirect("/admin/editempresa/" + req.body.id);
    } else {
      company.name = req.body.name.trim();
      company.cnpj = req.body.cnpj;
      company.cep = req.body.cep.trim();
      company.address = req.body.address;
      company.city = req.body.city.trim();
      company.state = req.body.state.trim();

      company
        .save()
        .then(() => {
          console.log("Empresa editada");
          res.redirect("/admin/empresas");
        })
        .catch((err) => {
          console.log("Erro ao Salvar no Banco (Empresa)");
          req.flash("error_msg", "Erro ao cadastrar empresa, verifique dados");
          res.redirect("/admin/editempresa/" + req.body.id);
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
      name: req.body.name.trim(),
      cnpj: req.body.cnpj,
      cep: req.body.cep.trim(),
      address: req.body.address,
      city: req.body.city.trim(),
      state: req.body.state.trim(),
    };

    new Client(NewCompany)
      .save()
      .then(() => {
        console.log("Empresa cadastrada");
        req.flash("success_msg", "Empresa cadastrada");
        res.redirect("/admin/empresas");
      })
      .catch((err) => {
        console.log("Erro ao Salvar no Banco (Empresa)");
        req.flash("error_msg", "Erro ao cadastrar empresa, verifique dados");
        res.redirect("/admin/addempresa");
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
  // Batch.find({ status: { $ne: "Concluído" } })
  Batch.find()
    .populate("Id_deliveryman")
    .then(async (allbatchs) => {
      for (item in allbatchs) {
        if (allbatchs[item].status == "Em rota") {
          await Packages.find({
            $and: [
              { _id: allbatchs[item].Package_list },
              { status: "Em rota" },
            ],
          }).then((pack) => {
            if (pack.length == 0) {
              allbatchs[item].status = "Concluído";
              allbatchs[item].save().then(() => {
                console.log("Lote Concluído");
              });
            }
          });
        }
      }

      res.render("admin/lotes", { allbatchs: allbatchs });
    });
});

router.get("/addlote", userLogin, (req, res) => {
  Packages.find({ status: "Pendente" })
    .populate("Id_client")
    .then((allpackage) => {
      res.render("admin/addbatch", { allpackage: allpackage });
    });
});

router.post("/addlote", userLogin, (req, res) => {
  var id_package = [];

  for (item in req.body) {
    if (req.body[item].id != undefined) {
      id_package.push(req.body[item].id);
    } else {
      note = req.body[item].note[0];
    }
  }

  const NewBatch = {
    Package_list: id_package,
    received: false,
    status: "Pendente",
    note: note,
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
    if (batch.status == "Pendente") {
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
    } else {
      res.json({ ok: "deleterror" });
    }
  });
});

router.get("/inlote/:id", userLogin, (req, res) => {
  Batch.findOne({ _id: req.params.id })
    .populate("Package_list")
    .then((allPackageinbatchs) => {
      res.render("admin/inlote", { allPackageinbatchs: allPackageinbatchs });
    });
});

router.post("/inlote/delpackage/", userLogin, (req, res) => {
  if (req.body[0].idStatus == "Pendente") {
    Batch.updateOne(
      { _id: req.body[0].idBatch },
      { $pull: { Package_list: { $in: req.body[0].idPackage } } }
    ).then((UpdateBatch) => {
      if (UpdateBatch.nModified == 1) {
        Packages.updateOne(
          { _id: req.body[0].idPackage },
          { $set: { status: "Pendente" } }
        ).then((teste) => {
          res.json({ ok: "deletok" });
        });
      } else {
        res.json({ ok: "accessdenied" });
      }
    });
  } else {
    res.json({ ok: "accessdenied" });
  }
});

router.get("/entregas/", userLogin, (req, res) => {
  date = new Date().toISOString().slice(0, 10);
  const value = req.query;

  if (req.query.npackage == undefined) {
    const datenow = new Date();
    const datenow1 = new Date();
    datenow1.setDate(datenow1.getDate() + 1);
    datenow.setDate(datenow.getDate() - 1);
    Delivery.find({
      updatedAt: { $gt: new Date(datenow), $lt: new Date(datenow1) },
    })
      .populate("Id_deliveryman")
      .then((alldelivery) => {
        res.render("admin/delivery", { alldelivery: alldelivery, date: date });
      });
  } else if (req.query.npackage != "") {
    Delivery.find({ barcode: req.query.npackage })
      .populate("Id_deliveryman")
      .then((alldelivery) => {
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
        updatedAt: { $gte: new Date(req.query.datein), $lt: new Date(dateout) },
        status: req.query.status_filter,
      })
      .populate("Id_deliveryman")
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
      updatedAt: { $gte: new Date(req.query.datein), $lt: new Date(dateout) },
    })
      .populate("Id_deliveryman")
      .then((alldelivery) => {
        res.render("admin/delivery", {
          alldelivery: alldelivery,
          date: date,
          value: value,
        });
      });
  }
});

router.get("/listas/", userLogin, (req, res) => {
  List_Import.find()
    .populate("Id_client")
    .then(async (alllist) => {
      res.render("admin/listas", { alllist: alllist });
    });
});

router.post("/listas/del", userLogin, (req, res) => {
  List_Import.findOne({ _id: req.body.id }).then(async (list) => {
    if (list.status == "Não Iniciada" && list.type == "interna") {
      Packages.deleteMany({ Id_List: list.Id_List }).then((result) => {
        List_Import.deleteOne({ _id: req.body.id }).then((listdel) => {
          res.json({ ok: "deletok" });
        });
      });
    } else if (list.status != "Não Iniciada") {
      res.json({ ok: "deleterror" });
    } else if (list.status == "Não Iniciada" && list.type != "interna") {
      res.json({ ok: "delfail" });
    }
  });
});

router.post(
  "/importpackage",
  UploadCSV.single("file"),
  userLogin,

  (req, res) => {
    fs.readFile("./uploads/file.csv", async (err, data) => {
      var erros = [];
      var success = [];
      var Id_List = (await Math.floor(Math.random() * (99999 - 10000))) + 10000;

      if (err) {
        console.error(err);
        return;
      }
      const PackageImport = await neatCsv(data);

      for (item in PackageImport) {
        if (
          !PackageImport[item]["code"] ||
          typeof PackageImport[item]["code"] == undefined ||
          PackageImport[item]["code"] == null
        ) {
          erros.push({ text: "Código inválido" });
          continue;
        }

        const newImport = {
          Id_List: Id_List,
          Id_client: req.body.company,
          Id_type: req.body.type,
          note_number: req.body.notenumber,
          code: PackageImport[item]["code"].toUpperCase().trim(),
          receiver: PackageImport[item]["receiver"].trim(),
          city: PackageImport[item]["city"].trim(),
          address: PackageImport[item]["address"].trim(),
          district: PackageImport[item]["district"].trim(),
          state: PackageImport[item]["state"].trim(),
          cep: PackageImport[item]["cep"].trim(),
          status: "Pendente",
        };

        await new Packages(newImport)
          .save()
          .then(() => {
            success.push({ text: "Pacote adicionado" });
            console.log("Pacotes Importados com Sucesso");
          })
          .catch((err) => {
            console.log("Erro ao Salvar no Banco (Pacotes)");
          });
      }
      if (erros.length != 0) {
        req.flash(
          "error_msg",
          erros.length +
            " Pacotes c/ erro (Código em branco), " +
            success.length +
            " Adicionados com sucesso"
        );
      } else {
        req.flash(
          "success_msg",
          success.length + " Pacotes foram adicionados com sucesso"
        );
      }
      const listimport = {
        Id_List: Id_List,
        Qt_Sucess: success.length,
        Qt_error: erros.length,
        User_add: req.user.login,
        Id_client: req.body.company,
        note_number: req.body.notenumber,
        type: "interna",
      };

      await new List_Import(listimport)
        .save()
        .then(() => {
          console.log("Lista de Importação Adicionada");
        })
        .catch((err) => {
          console.log("Erro ao Salvar no Banco (Lista de importação)");
        });

      res.redirect("/admin/pacotes");
    });
  }
);

router.get("/qrcode/:code", userLogin, (req, res) => {
  const code = qr.image(req.params.code, { type: "svg" });

  res.type("svg");

  code.pipe(res);
});

router.get("/etiquetas/:id/:local?", userLogin, async (req, res) => {
  var tags = "";
  if (req.params.local == "batch") {
    tags = await Batch.find({ _id: req.params.id })
      .populate("Package_list")
      .then(async (lotes) => {
        const data = await tag(lotes, req.params.local);
        return data;
      });
  } else if (req.params.local == "package") {
    tags = await Packages.find({ _id: req.params.id }).then(
      async (packages) => {
        const data = await tag(packages, req.params.local);
        return data;
      }
    );
  } else if (req.params.local == "list") {
    tags = await List_Import.findOne({ _id: req.params.id }).then(
      async (list) => {
        const temp = await Packages.find({ Id_List: list.Id_List }).then(
          async (packages) => {
            const data = await tag(packages, req.params.local);
            return data;
          }
        );
        return temp;
      }
    );
  }

  var PdfPrinter = require("pdfmake/src/printer");
  var fs = require("fs");

  var fonts = {
    Roboto: {
      normal: "public/fonts/Roboto-Regular.ttf",
      bold: "public/fonts/Roboto-Medium.ttf",
      italics: "public/fonts/Roboto-Italic.ttf",
      bolditalics: "public/fonts/Roboto-MediumItalic.ttf",
    },
  };
  var printer = new PdfPrinter(fonts);

  var options = {
    // ...
  };

  var pdfDoc = printer.createPdfKitDocument(tags, options);
  let stream = pdfDoc.pipe(
    (temp123 = fs.createWriteStream("public/document.pdf"))
  );
  pdfDoc.end();

  stream.on("finish", function () {
    res.download("public/document.pdf");
  });
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("error", "Logout realizado");
  res.redirect("/login");
});

module.exports = router;
