const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Package = new Schema({
  code: {
    type: String,
    require: true,
  },
  receiver: {
    type: String,
    require: true,
  },
  city: {
    type: String,
    require: true,
  },
  address: {
    type: String,
    require: true,
  },
  state: {
    type: String,
    require: true,
  },
  cep: {
    type: Number,
    require: false,
  },
  status: {
    type: String,
  },
});

mongoose.model("package", Package);
