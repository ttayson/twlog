const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Client = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    address: {
      type: String,
    },
    cep: {
      type: String,
    },
    cnpj: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

mongoose.model("client", Client);
