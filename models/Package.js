const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Package = new Schema(
  {
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
      type: String,
      require: false,
    },
    status: {
      type: String,
    },
    Id_client: [
      {
        type: Schema.Types.ObjectId,
        ref: "client",
        require: false,
      },
    ],
  },
  { timestamps: true }
);

mongoose.model("package", Package);
