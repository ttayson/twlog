const mongoose = require("mongoose");
require("../models/Client");
const Client = mongoose.model("client");
const format = require("date-fns/format");

module.exports = {
  tag: async function (data, type) {
    var dd = {
      pageMargins: [5, 20, 5, 20],
    };
    var content = [];
    if (type == "batch") {
      var count = 0;
      for (item in data[0].Package_list) {
        count += 1;

        tag = null;
        await Client.findOne({
          _id: data[0].Package_list[item].Id_client,
        }).then((client) => {
          const receiver = data[0].Package_list[item].receiver;
          const address = data[0].Package_list[item].address;
          const state = data[0].Package_list[item].state;
          const cep = data[0].Package_list[item].cep;
          const city = data[0].Package_list[item].city;
          const code = data[0].Package_list[item].code;
          const date = format(
            new Date(data[0].Package_list[item].createdAt),
            "dd/MM/yyyy"
          );
          const note = data[0].Package_list[item].note_number;
          const clientName = client.name;

          if (count % 4 === 0) {
            var tagEnd = {
              style: "tableExample",
              pageBreak: "after",
              margin: [0, 0, 0, 5],
              table: {
                widths: [170, 395],
                body: [
                  [
                    [
                      {
                        image: "public/logo.png",
                        alignment: "center",
                        width: 100,
                        height: 40,
                        // fit: [80, 80],
                      },
                      [
                        {
                          text: "Entregas de Pequenas encomendas em todo Brasil",
                          fontSize: 8,
                          alignment: "center",
                          bold: false,
                          margin: [10, 3, 10, 5],
                        },
                        {
                          text: "Contato: (84) 99961-0408",
                          margin: [5, 0, 0, 0],
                          fontSize: 10,
                        },
                        {
                          text: "contato@lmlogexpress.com.br",
                          margin: [5, 0, 0, 10],
                          fontSize: 10,
                        },
                        {
                          text: `Nome: ${receiver}`,
                          margin: [5, 0, 0, 0],
                          fontSize: 8,
                          alignment: "left",
                        },
                        {
                          text: `End.: ${address}`,
                          margin: [5, 0, 0, 0],
                          fontSize: 8,
                        },
                        {
                          columns: [
                            {
                              text: `Cidade: ${city}`,
                              margin: [5, 0, 0, 0],
                              fontSize: 8,
                            },
                            {
                              text: `Estado: ${state}`,
                              margin: [5, 0, 0, 0],
                              fontSize: 8,
                            },
                          ],
                        },
                        {
                          text: `CEP: ${cep}`,
                          margin: [5, 0, 0, 0],
                          fontSize: 8,
                        },
                      ],
                    ],

                    [
                      {
                        columns: [
                          {
                            text: "Comprovante de Entrega",
                            margin: [5, 0, 0, 0],
                            fontSize: 16,
                          },
                          {
                            text: clientName,
                            margin: [10, 0, 10, 0],
                            fontSize: 16,
                            alignment: "right",
                          },
                        ],
                      },
                      {
                        columns: [
                          [
                            {
                              text: `Nome: ${receiver}`,
                              margin: [5, 0, 0, 0],
                              fontSize: 8,
                            },
                            {
                              text: `End.: ${address}`,
                              margin: [5, 0, 0, 0],
                              fontSize: 8,
                            },
                            {
                              columns: [
                                {
                                  text: `Cidade: ${city}`,
                                  margin: [5, 0, 0, 0],
                                  fontSize: 8,
                                },
                                {
                                  text: `Estado: ${state}`,
                                  margin: [5, 0, 0, 0],
                                  fontSize: 8,
                                },
                              ],
                            },
                            {
                              text: `CEP: ${cep}`,
                              margin: [5, 0, 0, 5],
                              fontSize: 8,
                            },
                            {
                              columns: [
                                {
                                  width: 250,
                                  margin: [5, 0, 0, 4],
                                  text: [
                                    { text: "|   | Mudou-se", fontSize: 10 },
                                    {
                                      text: "                |   | Ausente  ____/____/______",
                                      margin: [0, 0, 0, 0],
                                      fontSize: 10,
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              columns: [
                                {
                                  width: 250,
                                  margin: [5, 0, 0, 4],
                                  text: [
                                    {
                                      text: "|   | Desconhecido",
                                      fontSize: 10,
                                    },
                                    {
                                      text: "        |   | Ausente  ____/____/______",
                                      margin: [0, 0, 0, 0],
                                      fontSize: 10,
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              columns: [
                                {
                                  width: 250,
                                  margin: [5, 0, 0, 0],
                                  text: [
                                    { text: "|   | Recusou", fontSize: 10 },
                                    {
                                      text: "                  |   | Ausente  ____/____/______",
                                      margin: [0, 0, 0, 0],
                                      fontSize: 10,
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              text: "Assinatura ____________________________________",
                              margin: [5, 15, 0, 0],
                              fontSize: 10,
                            },
                            {
                              text: "Parentesco____________________________________",
                              margin: [5, 5, 0, 0],
                              fontSize: 10,
                            },
                            {
                              text: "Data  ____/____/______",
                              margin: [5, 5, 0, 0],
                              fontSize: 10,
                            },
                          ],
                          [
                            {
                              text: date,
                              margin: [40, 3, 0, 0],
                              fontSize: 10,
                            },
                            {
                              qr: code,
                              fit: "",
                              margin: [40, 10, 0, 0],
                              alignment: "left",
                            },
                            {
                              text: code,
                              margin: [40, 3, 0, 0],
                              fontSize: 10,
                            },
                            {
                              text: note,
                              margin: [40, 3, 0, 0],
                              fontSize: 10,
                            },
                          ],
                        ],
                      },
                    ],
                  ],
                ],
              },
            };
            content.push(tagEnd);
          } else {
            var tag = {
              style: "tableExample",
              margin: [0, 0, 0, 5],
              table: {
                widths: [170, 395],
                body: [
                  [
                    [
                      {
                        image: "public/logo.png",
                        alignment: "center",
                        width: 100,
                        height: 40,
                        // fit: [80, 80],
                      },
                      [
                        {
                          text: "Entregas de Pequenas encomendas em todo Brasil",
                          fontSize: 8,
                          alignment: "center",
                          bold: false,
                          margin: [10, 3, 10, 5],
                        },
                        {
                          text: "Contato: (84) 99961-0408",
                          margin: [5, 0, 0, 0],
                          fontSize: 10,
                        },
                        {
                          text: "contato@lmlogexpress.com.br",
                          margin: [5, 0, 0, 10],
                          fontSize: 10,
                        },
                        {
                          text: `Nome: ${receiver}`,
                          margin: [5, 0, 0, 0],
                          fontSize: 8,
                          alignment: "left",
                        },
                        {
                          text: `End.: ${address}`,
                          margin: [5, 0, 0, 0],
                          fontSize: 8,
                        },
                        {
                          columns: [
                            {
                              text: `Cidade: ${city}`,
                              margin: [5, 0, 0, 0],
                              fontSize: 8,
                            },
                            {
                              text: `Estado: ${state}`,
                              margin: [5, 0, 0, 0],
                              fontSize: 8,
                            },
                          ],
                        },
                        {
                          text: `CEP: ${cep}`,
                          margin: [5, 0, 0, 0],
                          fontSize: 8,
                        },
                      ],
                    ],

                    [
                      {
                        columns: [
                          {
                            text: "Comprovante de Entrega",
                            margin: [5, 0, 0, 0],
                            fontSize: 16,
                          },
                          {
                            text: clientName,
                            margin: [10, 0, 10, 0],
                            fontSize: 16,
                            alignment: "right",
                          },
                        ],
                      },
                      {
                        columns: [
                          [
                            {
                              text: `Nome: ${receiver}`,
                              margin: [5, 0, 0, 0],
                              fontSize: 8,
                            },
                            {
                              text: `End.: ${address}`,
                              margin: [5, 0, 0, 0],
                              fontSize: 8,
                            },
                            {
                              columns: [
                                {
                                  text: `Cidade: ${city}`,
                                  margin: [5, 0, 0, 0],
                                  fontSize: 8,
                                },
                                {
                                  text: `Estado: ${state}`,
                                  margin: [5, 0, 0, 0],
                                  fontSize: 8,
                                },
                              ],
                            },
                            {
                              text: `CEP: ${cep}`,
                              margin: [5, 0, 0, 5],
                              fontSize: 8,
                            },
                            {
                              columns: [
                                {
                                  width: 250,
                                  margin: [5, 0, 0, 4],
                                  text: [
                                    { text: "|   | Mudou-se", fontSize: 10 },
                                    {
                                      text: "                |   | Ausente  ____/____/______",
                                      margin: [0, 0, 0, 0],
                                      fontSize: 10,
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              columns: [
                                {
                                  width: 250,
                                  margin: [5, 0, 0, 4],
                                  text: [
                                    {
                                      text: "|   | Desconhecido",
                                      fontSize: 10,
                                    },
                                    {
                                      text: "        |   | Ausente  ____/____/______",
                                      margin: [0, 0, 0, 0],
                                      fontSize: 10,
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              columns: [
                                {
                                  width: 250,
                                  margin: [5, 0, 0, 0],
                                  text: [
                                    { text: "|   | Recusou", fontSize: 10 },
                                    {
                                      text: "                  |   | Ausente  ____/____/______",
                                      margin: [0, 0, 0, 0],
                                      fontSize: 10,
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              text: "Assinatura ____________________________________",
                              margin: [5, 15, 0, 0],
                              fontSize: 10,
                            },
                            {
                              text: "Parentesco____________________________________",
                              margin: [5, 5, 0, 0],
                              fontSize: 10,
                            },
                            {
                              text: "Data  ____/____/______",
                              margin: [5, 5, 0, 0],
                              fontSize: 10,
                            },
                          ],
                          [
                            {
                              text: date,
                              margin: [40, 3, 0, 0],
                              fontSize: 10,
                            },
                            {
                              qr: code,
                              fit: "",
                              margin: [40, 10, 0, 0],
                              alignment: "left",
                            },
                            {
                              text: code,
                              margin: [40, 3, 0, 0],
                              fontSize: 10,
                            },
                            {
                              text: note,
                              margin: [40, 3, 0, 0],
                              fontSize: 10,
                            },
                          ],
                        ],
                      },
                    ],
                  ],
                ],
              },
            };
            content.push(tag);
          }
        });
      }
      dd = { ...dd, content };
      count = 0;
      return dd;
    } else if (type == "package" || type == "list") {
      var count = 0;
      for (item in data) {
        count += 1;

        tag = null;
        await Client.findOne({
          _id: data[item].Id_client,
        }).then((client) => {
          const receiver = data[item].receiver;
          const address = data[item].address;
          const state = data[item].state;
          const cep = data[item].cep;
          const city = data[item].city;
          const code = data[item].code;
          const date = format(new Date(data[item].createdAt), "dd/MM/yyyy");
          const note = data[item].note_number;
          const clientName = client.name;

          if (count % 4 === 0) {
            var tagEnd = {
              style: "tableExample",
              pageBreak: "after",
              margin: [0, 0, 0, 5],
              table: {
                widths: [170, 395],
                body: [
                  [
                    [
                      {
                        image: "public/logo.png",
                        alignment: "center",
                        width: 100,
                        height: 40,
                        // fit: [80, 80],
                      },
                      [
                        {
                          text: "Entregas de Pequenas encomendas em todo Brasil",
                          fontSize: 8,
                          alignment: "center",
                          bold: false,
                          margin: [10, 3, 10, 5],
                        },
                        {
                          text: "Contato: (84) 99961-0408",
                          margin: [5, 0, 0, 0],
                          fontSize: 10,
                        },
                        {
                          text: "contato@lmlogexpress.com.br",
                          margin: [5, 0, 0, 10],
                          fontSize: 10,
                        },
                        {
                          text: `Nome: ${receiver}`,
                          margin: [5, 0, 0, 0],
                          fontSize: 8,
                          alignment: "left",
                        },
                        {
                          text: `End.: ${address}`,
                          margin: [5, 0, 0, 0],
                          fontSize: 8,
                        },
                        {
                          columns: [
                            {
                              text: `Cidade: ${city}`,
                              margin: [5, 0, 0, 0],
                              fontSize: 8,
                            },
                            {
                              text: `Estado: ${state}`,
                              margin: [5, 0, 0, 0],
                              fontSize: 8,
                            },
                          ],
                        },
                        {
                          text: `CEP: ${cep}`,
                          margin: [5, 0, 0, 0],
                          fontSize: 8,
                        },
                      ],
                    ],

                    [
                      {
                        columns: [
                          {
                            text: "Comprovante de Entrega",
                            margin: [5, 0, 0, 0],
                            fontSize: 16,
                          },
                          {
                            text: clientName,
                            margin: [10, 0, 10, 0],
                            fontSize: 16,
                            alignment: "right",
                          },
                        ],
                      },
                      {
                        columns: [
                          [
                            {
                              text: `Nome: ${receiver}`,
                              margin: [5, 0, 0, 0],
                              fontSize: 8,
                            },
                            {
                              text: `End.: ${address}`,
                              margin: [5, 0, 0, 0],
                              fontSize: 8,
                            },
                            {
                              columns: [
                                {
                                  text: `Cidade: ${city}`,
                                  margin: [5, 0, 0, 0],
                                  fontSize: 8,
                                },
                                {
                                  text: `Estado: ${state}`,
                                  margin: [5, 0, 0, 0],
                                  fontSize: 8,
                                },
                              ],
                            },
                            {
                              text: `CEP: ${cep}`,
                              margin: [5, 0, 0, 5],
                              fontSize: 8,
                            },
                            {
                              columns: [
                                {
                                  width: 250,
                                  margin: [5, 0, 0, 4],
                                  text: [
                                    { text: "|   | Mudou-se", fontSize: 10 },
                                    {
                                      text: "                |   | Ausente  ____/____/______",
                                      margin: [0, 0, 0, 0],
                                      fontSize: 10,
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              columns: [
                                {
                                  width: 250,
                                  margin: [5, 0, 0, 4],
                                  text: [
                                    {
                                      text: "|   | Desconhecido",
                                      fontSize: 10,
                                    },
                                    {
                                      text: "        |   | Ausente  ____/____/______",
                                      margin: [0, 0, 0, 0],
                                      fontSize: 10,
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              columns: [
                                {
                                  width: 250,
                                  margin: [5, 0, 0, 0],
                                  text: [
                                    { text: "|   | Recusou", fontSize: 10 },
                                    {
                                      text: "                  |   | Ausente  ____/____/______",
                                      margin: [0, 0, 0, 0],
                                      fontSize: 10,
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              text: "Assinatura ____________________________________",
                              margin: [5, 15, 0, 0],
                              fontSize: 10,
                            },
                            {
                              text: "Parentesco____________________________________",
                              margin: [5, 5, 0, 0],
                              fontSize: 10,
                            },
                            {
                              text: "Data  ____/____/______",
                              margin: [5, 5, 0, 0],
                              fontSize: 10,
                            },
                          ],
                          [
                            {
                              text: date,
                              margin: [40, 3, 0, 0],
                              fontSize: 10,
                            },
                            {
                              qr: code,
                              fit: "",
                              margin: [40, 10, 0, 0],
                              alignment: "left",
                            },
                            {
                              text: code,
                              margin: [40, 3, 0, 0],
                              fontSize: 10,
                            },
                            {
                              text: note,
                              margin: [40, 3, 0, 0],
                              fontSize: 10,
                            },
                          ],
                        ],
                      },
                    ],
                  ],
                ],
              },
            };
            content.push(tagEnd);
          } else {
            var tag = {
              style: "tableExample",
              margin: [0, 0, 0, 5],
              table: {
                widths: [170, 395],
                body: [
                  [
                    [
                      {
                        image: "public/logo.png",
                        alignment: "center",
                        width: 100,
                        height: 40,
                        // fit: [80, 80],
                      },
                      [
                        {
                          text: "Entregas de Pequenas encomendas em todo Brasil",
                          fontSize: 8,
                          alignment: "center",
                          bold: false,
                          margin: [10, 3, 10, 5],
                        },
                        {
                          text: "Contato: (84) 99961-0408",
                          margin: [5, 0, 0, 0],
                          fontSize: 10,
                        },
                        {
                          text: "contato@lmlogexpress.com.br",
                          margin: [5, 0, 0, 10],
                          fontSize: 10,
                        },
                        {
                          text: `Nome: ${receiver}`,
                          margin: [5, 0, 0, 0],
                          fontSize: 8,
                          alignment: "left",
                        },
                        {
                          text: `End.: ${address}`,
                          margin: [5, 0, 0, 0],
                          fontSize: 8,
                        },
                        {
                          columns: [
                            {
                              text: `Cidade: ${city}`,
                              margin: [5, 0, 0, 0],
                              fontSize: 8,
                            },
                            {
                              text: `Estado: ${state}`,
                              margin: [5, 0, 0, 0],
                              fontSize: 8,
                            },
                          ],
                        },
                        {
                          text: `CEP: ${cep}`,
                          margin: [5, 0, 0, 0],
                          fontSize: 8,
                        },
                      ],
                    ],

                    [
                      {
                        columns: [
                          {
                            text: "Comprovante de Entrega",
                            margin: [5, 0, 0, 0],
                            fontSize: 16,
                          },
                          {
                            text: clientName,
                            margin: [10, 0, 10, 0],
                            fontSize: 16,
                            alignment: "right",
                          },
                        ],
                      },
                      {
                        columns: [
                          [
                            {
                              text: `Nome: ${receiver}`,
                              margin: [5, 0, 0, 0],
                              fontSize: 8,
                            },
                            {
                              text: `End.: ${address}`,
                              margin: [5, 0, 0, 0],
                              fontSize: 8,
                            },
                            {
                              columns: [
                                {
                                  text: `Cidade: ${city}`,
                                  margin: [5, 0, 0, 0],
                                  fontSize: 8,
                                },
                                {
                                  text: `Estado: ${state}`,
                                  margin: [5, 0, 0, 0],
                                  fontSize: 8,
                                },
                              ],
                            },
                            {
                              text: `CEP: ${cep}`,
                              margin: [5, 0, 0, 5],
                              fontSize: 8,
                            },
                            {
                              columns: [
                                {
                                  width: 250,
                                  margin: [5, 0, 0, 4],
                                  text: [
                                    { text: "|   | Mudou-se", fontSize: 10 },
                                    {
                                      text: "                |   | Ausente  ____/____/______",
                                      margin: [0, 0, 0, 0],
                                      fontSize: 10,
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              columns: [
                                {
                                  width: 250,
                                  margin: [5, 0, 0, 4],
                                  text: [
                                    {
                                      text: "|   | Desconhecido",
                                      fontSize: 10,
                                    },
                                    {
                                      text: "        |   | Ausente  ____/____/______",
                                      margin: [0, 0, 0, 0],
                                      fontSize: 10,
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              columns: [
                                {
                                  width: 250,
                                  margin: [5, 0, 0, 0],
                                  text: [
                                    { text: "|   | Recusou", fontSize: 10 },
                                    {
                                      text: "                  |   | Ausente  ____/____/______",
                                      margin: [0, 0, 0, 0],
                                      fontSize: 10,
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              text: "Assinatura ____________________________________",
                              margin: [5, 15, 0, 0],
                              fontSize: 10,
                            },
                            {
                              text: "Parentesco____________________________________",
                              margin: [5, 5, 0, 0],
                              fontSize: 10,
                            },
                            {
                              text: "Data  ____/____/______",
                              margin: [5, 5, 0, 0],
                              fontSize: 10,
                            },
                          ],
                          [
                            {
                              text: date,
                              margin: [40, 3, 0, 0],
                              fontSize: 10,
                            },
                            {
                              qr: code,
                              fit: "",
                              margin: [40, 10, 0, 0],
                              alignment: "left",
                            },
                            {
                              text: code,
                              margin: [40, 3, 0, 0],
                              fontSize: 10,
                            },
                            {
                              text: note,
                              margin: [40, 3, 0, 0],
                              fontSize: 10,
                            },
                          ],
                        ],
                      },
                    ],
                  ],
                ],
              },
            };
            content.push(tag);
          }
        });
      }
      dd = { ...dd, content };
      count = 0;
      return dd;
    }
  },
};
