const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Batch = new Schema({
  Package_list: {
    type: Array,
    require: false,
  },
  Id_motorista: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
      require: false,
    },
  ],
  status: {
    type: String,
  },
});

mongoose.model("batch", Batch);
