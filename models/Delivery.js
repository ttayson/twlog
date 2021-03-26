const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Delivery = new Schema(
  {
    barcode: {
      type: String,
      require: true,
    },
    location: {
      type: String,
    },
    img_package: {
      type: String,
    },
    img_received: {
      type: String,
    },
    status: {
      type: String,
      require: true,
    },
    reason: {
      type: String,
    },
    reason_description: {
      type: String,
    },
    delivery_date: {
      type: Date,
    },
    Id_deliveryman: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
        require: false,
      },
    ],
  },
  { timestamps: true }
);

mongoose.model("delivery", Delivery);
