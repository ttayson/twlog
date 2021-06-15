const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const List_Import = new Schema(
  {
    Id_List: {
      type: String,
      require: true,
    },
    Qt_Sucess: {
      type: Number,
    },
    Qt_error: {
      type: String,
    },
    status: {
      type: String,
      default: "Não Iniciada",
    },
    note_number: {
      type: Number,
    },
    User_add: {
      type: String,
    },
    type: {
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

mongoose.model("list_import", List_Import);
