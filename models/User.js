const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: false,
  },
  login: {
    type: String,
    require: true,
    unique: true,
  },
  type: [
    {
      type: Schema.Types.ObjectId,
      ref: "user_type",
      require: false,
    },
  ],
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
  date_create: {
    type: Date,
    default: Date.now(),
  },
});

mongoose.model("user", User);
