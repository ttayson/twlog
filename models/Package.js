const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Package = new Schema(
  {
    code: {
      type: String,
      require: true,
    },
    note_number: {
      type: Number,
    },
    receiver: {
      type: String,
    },
    city: {
      type: String,
    },
    address: {
      type: String,
    },
    district: {
      type: String,
    },
    state: {
      type: String,
    },
    cep: {
      type: String,
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
    Id_type: [
      {
        type: Schema.Types.ObjectId,
        ref: "package_types",
        require: false,
      },
    ],
  },
  { timestamps: true }
);

mongoose.model("package", Package);
