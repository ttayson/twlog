const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Package_Types = new Schema({
  description: {
    type: String,
  },
  type: {
    type: String,
  },
});

mongoose.model("package_types", Package_Types);
