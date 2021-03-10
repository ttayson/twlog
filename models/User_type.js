const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User_Type = new Schema({
  permission: {
    type: String,
  },
  name: {
    type: String,
  },
  code: {
    type: Number,
  },
});

mongoose.model("user_type", User_Type);
