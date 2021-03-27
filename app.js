//MOdulos
const express = require("express");
const handlebars = require("express-handlebars");
const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");

const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

const passport = require("passport");
require("./config/Auth")(passport);

const admin = require("./routes/admin");
const client = require("./routes/client");
const guest = require("./routes/guest");
const api = require("./routes/api");

// Banco de Dados
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

//Configurações
//session
app.use(
  session({
    secret: "aplicativovotta",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//middleware

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

//body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Handlebars

const hbs = handlebars.create({
  defaultLayout: "main",
  extname: "hbs",
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: {
    dateDelivery: (timestamp) => {
      return new Date(timestamp).toLocaleDateString("pt-BR");
    },
    timeDelivery: (timestamp) => {
      return new Date(timestamp).toLocaleTimeString("pt-BR");
    },
    statusColor: (status) => {
      switch (status) {
        case "Pendente":
          return new Handlebars.SafeString(
            '<span class="badge bg-warning">' + status + "</span>"
          );
          break;
        case "Em lote":
          return new Handlebars.SafeString(
            '<span class="badge bg-info">' + status + "</span>"
          );
          reak;
        case "Em rota":
          return new Handlebars.SafeString(
            '<span class="badge bg-primary">' + status + "</span>"
          );
          break;
        case "Entregue":
          return new Handlebars.SafeString(
            '<span class="badge bg-success">' + status + "</span>"
          );
          break;
        case "Falha na Entrega":
          return new Handlebars.SafeString(
            '<span class="badge bg-danger">' + status + "</span>"
          );
          break;
        case "Fora do sistema":
          return new Handlebars.SafeString(
            '<span class="badge bg-secondary"> ' + status + " </span>"
          );
          break;
        case "Concluído":
          return new Handlebars.SafeString(
            '<span class="badge bg-success"> ' + status + " </span>"
          );
          break;
        default:
          return new Handlebars.SafeString(
            '<span class="badge bg-warning"> Sem Status </span>'
          );
      }
    },
  },
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");
// app.engine('handlebars', handlebars({defaultLayout: 'main'}))
// app.set('view engine', 'handlebars');

//mongoose
// mongoose
//   .connect("mongodb://localhost/twlog", {
mongoose.Promise = global.Promise;
mongoose
  .connect(
    "mongodb://" +
      process.env.DB_USER +
      ":" +
      process.env.DB_PASS +
      "@" +
      process.env.DOMAIN +
      ":" +
      process.env.DB_PORT +
      "/" +
      process.env.DB_NAME +
      "?authSource=admin",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    }
  )
  .then(() => {
    console.log("Mongo Conectado");
  })
  .catch((err) => {
    console.log("Erro ao se conectar ao banco:" + err);
  });
//Public
app.use(express.static("images"));
app.use(express.static(path.join(__dirname, "public")));

// Rotas

app.use("/admin", admin);
app.use("/client", client);
app.use("/", guest);
app.use("/api", api);

const PORT = process.env.APP_PORT;
app.listen(PORT, () => {
  console.log("Servidor Rodando na porta: " + PORT);
});
