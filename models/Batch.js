const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Batch = new Schema({
  Package_list: {
    type: Array,
    require: false,
  },
  status: {
    type: String,
  },
});

mongoose.model("batch", Batch);
