const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Batch = new Schema({
  Package_list: [
    {
      type: Schema.Types.ObjectId,
      ref: "package",
      require: false,
    },
  ],
  Id_deliveryman: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
      require: false,
    },
  ],
  status: {
    type: String,
  },
  received: {
    type: Boolean,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

mongoose.model("batch", Batch);
