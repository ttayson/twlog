const mongoose = require("mongoose");
require("../models/List_import");
require("../models/Package");
const List_import = mongoose.model("list_import");
const Package = mongoose.model("package");

module.exports = {
  deliveryUpdate: function () {
    List_import.find().then(async (list) => {
      for (i in list) {
        await Package.countDocuments()
          .and({
            Id_List: list[i].Id_List,
            status: "Entregue",
          })
          .then(async (package) => {
            if (list[i].status === "Não Iniciada" && package != 0) {
              await List_import.updateOne(
                { _id: list[i]._id },
                { $set: { status: "Iniciada" } }
              )
                .then(() => {})
                .catch((err) => {
                  console.log(err);
                });
            } else if (package == list[i].Qt_Sucess) {
              await List_import.updateOne(
                { _id: list[i]._id },
                { $set: { status: "Concluída" } }
              )
                .then(() => {})
                .catch((err) => {
                  console.log("Erro Conclusão da lista" + err);
                });
            }

            await List_import.updateOne(
              { _id: list[i]._id },
              { $set: { Qt_delivery: package } }
            )
              .then(() => {})
              .catch((err) => {
                console.log(err);
              });
          });

        await Package.countDocuments()
          .and({
            Id_List: list[i].Id_List,
            status: "Falha na Entrega",
          })
          .then(async (package) => {
            if (list[i].status === "Não Iniciada" && package != 0) {
              await List_import.updateOne(
                { _id: list[i]._id },
                { $set: { status: "Iniciada" } }
              )
                .then(() => {})
                .catch((err) => {
                  console.log("Erro Iniciar lista" + err);
                });
            }
            await List_import.updateOne(
              { _id: list[i]._id },
              { $set: { Qt_errorDelivery: package } }
            )
              .then(() => {})
              .catch((err) => {
                console.log(err);
              });
          });
      }
    });
  },
};
