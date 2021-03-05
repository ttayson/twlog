const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Client = new Schema({
  nome: {
    type: String,
    require: true,
  },
  city: {
    type: String,
    require: true,
  },
  state: {
    type: String,
    require: true,
  },
  address: {
    type: String,
    require: true,
  },
  cep: {
    type: Number,
    require: false,
  },
  cnpj: {
    type: Number,
    require: false,
    unique: true,
  },
});

mongoose.model("client", Client);
