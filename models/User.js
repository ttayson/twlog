const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
  nome: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  login: {
    type: String,
    require: true,
    unique: true,
  },
  type: {
    type: Number,
    default: 0,
    require: true,
  },
  userpass: {
    type: String,
    require: true,
  },
  token: {
    type: String,
    require: false,
  },
  Id_client: [
    {
      type: Schema.Types.ObjectId,
      ref: "client",
      require: false,
    },
  ],
});

mongoose.model("user", User);
