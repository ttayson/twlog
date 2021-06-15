const mongoose = require("mongoose");
const addMinutes = require("date-fns/addMinutes");
const format = require("date-fns/format");

require("../models/Integration_Intelipost");
require("../models/Client");
require("../models/Package");
require("../models/List_import");

const Intelipost = mongoose.model("intelipost");
const Client = mongoose.model("client");
const Packages = mongoose.model("package");
const List_import = mongoose.model("list_import");

module.exports = {
  import_intelipost: async function (id) {
    console.log("Sinc Intelipost Executado");
    // const timeCron = -6;
    var error_return = [];
    await Intelipost.find({ _id: id }).then((result) => {
      if (result.length == 0) {
        error_return.push({ error: "Resultado Encontrado" });
      }
    });

    if (error_return.length > 0) {
      return;
    }

    var error = [];
    var success = [];
    const userRegex = new RegExp("Juspodivm", "i");
    var Id_client = await Client.findOne({ name: userRegex }).then((result) => {
      return result._id;
    });

    Intelipost.find({ _id: id }).then(async (imports) => {
      for (item in imports) {
        Id_List = imports[item].intelipost_pre_shipment_list;
        User_add = imports[item].origin_name;
        for (i in imports[item].shipment_order_array) {
          for (y in imports[item].shipment_order_array[i]
            .shipment_order_volume_array) {
            data = {
              Id_client: Id_client,
              Id_List: imports[item].intelipost_pre_shipment_list,
              note_number: null,
              receiver:
                imports[item].shipment_order_array[i].end_customer[0]
                  .first_name +
                " " +
                imports[item].shipment_order_array[i].end_customer[0].last_name,
              city: imports[item].shipment_order_array[i].end_customer[0]
                .shipping_city,
              address:
                imports[item].shipment_order_array[i].end_customer[0]
                  .shipping_address +
                " " +
                imports[item].shipment_order_array[i].end_customer[0]
                  .shipping_number,
              district:
                imports[item].shipment_order_array[i].end_customer[0]
                  .shipping_quarter,
              state:
                imports[item].shipment_order_array[i].end_customer[0]
                  .shipping_state,
              cep: imports[item].shipment_order_array[i].end_customer[0]
                .shipping_zip_code,
              status: "Pendente",
              code: imports[item].shipment_order_array[i]
                .shipment_order_volume_array[y].shipment_order_volume_number,
            };

            await new Packages(data)
              .save()
              .then(() => {
                success.push({ text: "Pacote adicionado " });
                console.log(
                  "Pacotes Importados com Sucesso (import Intelipost)"
                );
              })
              .catch((err) => {
                error.push({ text: "Pacote não adicionado " });
                console.log("Erro ao Salvar no Banco (Pacotes)");
              });
          }
        }
        const listimport = {
          Id_List: Id_List,
          Qt_Sucess: success.length,
          Qt_error: error.length,
          User_add: User_add,
          Id_client: Id_client,
          note_number: "",
          type: "Intelipost",
        };
        await new List_import(listimport)
          .save()
          .then(() => {
            console.log("Lista Adicionada via import intelipot");
            error = [];
            success = [];
          })
          .catch((err) => {
            console.log("Erro ao Salvar no Banco (import Intelipost)");
          });
      }
    });
  },
};
