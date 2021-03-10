const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Delivery = new Schema({
  barcode: {
    type: String,
    require: true,
  },
  location: {
    type: String,
    require: true,
  },
  img_packge: {
    type: String,
    require: true,
  },
  img_received: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    require: true,
  },
  reason: {
    type: String,
    require: false,
  },
  reason_description: {
    type: String,
  },
  Id_deliveryman: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
      require: false,
    },
  ],
});

mongoose.model("delivery", Delivery);
