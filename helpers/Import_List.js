const mongoose = require("mongoose");
const addMinutes = require("date-fns/addMinutes");
const format = require("date-fns/format");
const axios = require("axios");

require("dotenv").config();

require("../models/Integration_Intelipost");
require("../models/Client");
require("../models/Package");
require("../models/List_import");
require("../models/Delivery");

const Intelipost = mongoose.model("intelipost");
const Client = mongoose.model("client");
const Packages = mongoose.model("package");
const List_import = mongoose.model("list_import");
const Delivery = mongoose.model("delivery");

module.exports = {
  import_intelipost: async function (id) {
    console.log("Sinc Intelipost Executado");

    // var error_return = [];
    // await Intelipost.find({ _id: id }).then((result) => {
    //   if (result.length == 0) {
    //     error_return.push({ error: "Resultado Encontrado" });
    //   }
    // });

    // if (error_return.length > 0) {
    //   return;
    // }

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
              code: imports[item].shipment_order_array[i].order_number,
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
  event_inteliport: async function () {
    var count = 0
    await Delivery.find({ sync: false }).then(async (result) => {
      for (item in result) {
        await Packages.findOne({ code: result[item].barcode }).then(
          async (packages) => {
            if(packages && packages.Id_List){
              await List_import.findOne({ Id_List: packages.Id_List, type: "Intelipost" }).then(
                async (list) => {
              if(list){
                if (list.type != "interna") {
                  count = count + 1
                  console.log(count)
                  await Intelipost.findOne({
                    intelipost_pre_shipment_list: list.Id_List,
                  }).then(async (prelist) => {
                    for (item in prelist.shipment_order_array) {
                      for (i in prelist.shipment_order_array[item]
                        .shipment_order_volume_array) {
                        if (packages.status == "Entregue") {
                          var delivery_code = 35;
                          var delivery_message = "Entregue";
                        } else {
                          // var delivery_code = 44;
                          // var delivery_message = "Falha na Entrega";
                          var delivery_code = 99;
                          var delivery_message = "Averiguar falha na entrega";
                        }
                        
                        if (
                          prelist.shipment_order_array[item].order_number === packages.code
                          ) {

                            data = {
                              logistic_provider: "Lm Translog",
                              shipper: "Livraria Juspodivm",
                              invoice_key:
                              prelist.shipment_order_array[item]
                                .shipment_order_volume_array[i]
                                .shipment_order_volume_invoice_array[0]
                                .invoice_key,
                            invoice_series:
                              prelist.shipment_order_array[item]
                                .shipment_order_volume_array[i]
                                .shipment_order_volume_invoice_array[0]
                                .invoice_series,
                            invoice_number:
                              prelist.shipment_order_array[item]
                                .shipment_order_volume_array[i]
                                .shipment_order_volume_invoice_array[0]
                                .invoice_number,
                            tracking_code: packages.code,
                            order_number:
                              prelist.shipment_order_array[item].order_number,
                            volume_number: "1",
                            events: [
                              {
                                event_date: new Date(),
                                original_code: delivery_code,
                                original_message: delivery_message,
                              },
                            ],
                          };

                          const options = {
                            method: "POST",
                            url: "https://api.intelipost.com.br/api/v1/tracking/add/events",
                            headers: {
                              "Content-Type": "application/json",
                              "logistic-provider-api-key":
                                process.env.INTELIPOST_TOKEN,
                              platform: "intelipost-docs",
                            },
                            data,
                          };
                          await axios
                            .request(options)
                            .then(function (response) {
                              Delivery.updateOne(
                                { barcode: packages.code },
                                { $set: { sync: true } }
                              ).then(() => {
                                console.log(packages.code)
                                console.log("Evento Atualizado (intelipost)");
                                // console.log(response.data);
                              });
                            })
                            .catch(function (error) {
                              console.error(error);
                            });
                        }
                      }
                    }
                  });
                }
              }
              }
            );
          }
          }
        );
      }
      console.log("Sincronização Eventos finalizada")
    });
  },


  event_inteliport_batch: async function (receiver_code) {
    
    for(item in receiver_code ){
      await Packages.findOne({ code: receiver_code[item].code }).then(
        async (packages) => {
          if(packages && packages.Id_List){
            await List_import.findOne({ Id_List: packages.Id_List, type: "Intelipost" }).then(
              async (list) => {
            if(list){
              if (list.type != "interna") {
                await Intelipost.findOne({
                  intelipost_pre_shipment_list: list.Id_List,
                }).then(async (prelist) => {
                  for (item in prelist.shipment_order_array) {
                    for (i in prelist.shipment_order_array[item]
                      .shipment_order_volume_array) {
                        
                        var delivery_code = 31;
                        var delivery_message = "Saiu para entrega";
                     
                      if (
                        prelist.shipment_order_array[item].order_number === packages.code
                        ) {

                          data = {
                            logistic_provider: "Lm Translog",
                            shipper: "Livraria Juspodivm",
                            invoice_key:
                            prelist.shipment_order_array[item]
                              .shipment_order_volume_array[i]
                              .shipment_order_volume_invoice_array[0]
                              .invoice_key,
                          invoice_series:
                            prelist.shipment_order_array[item]
                              .shipment_order_volume_array[i]
                              .shipment_order_volume_invoice_array[0]
                              .invoice_series,
                          invoice_number:
                            prelist.shipment_order_array[item]
                              .shipment_order_volume_array[i]
                              .shipment_order_volume_invoice_array[0]
                              .invoice_number,
                          tracking_code: packages.code,
                          order_number:
                            prelist.shipment_order_array[item].order_number,
                          volume_number: "1",
                          events: [
                            {
                              event_date: new Date(),
                              original_code: delivery_code,
                              original_message: delivery_message,
                            },
                          ],
                        };

                        const options = {
                          method: "POST",
                          url: "https://api.intelipost.com.br/api/v1/tracking/add/events",
                          headers: {
                            "Content-Type": "application/json",
                            "logistic-provider-api-key":
                              process.env.INTELIPOST_TOKEN,
                            platform: "intelipost-docs",
                          },
                          data,
                        };
                        await axios
                          .request(options)
                          .then(function (response) {
                            Delivery.updateOne(
                              { barcode: packages.code },
                              { $set: { sync: true } }
                            ).then(() => {
                              console.log(packages.code)
                              console.log("Evento Atualizado (intelipost) - Saiu p/ Entr.");

                            });
                          })
                          .catch(function (error) {
                            console.error(error);
                          });
                      }
                    }
                  }
                });
              }
            }
          });
        }
        });
      }
    }
  };
