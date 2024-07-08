const express = require("express");
const cors = require("cors");
const path = require("path");
const eventRoute = require("./routers/eventRoute");
const accountRoute = require("./routers/accountRoute");
const orginiserRoute = require("./routers/organiserRoute");
const profileRoute = require("./routers/profileRoute");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: "*",
};

// ? Middleware

// app.use((req, res, next) => {
//   console.log(req.headers);
//   next();
// });

app.use(cors(corsOptions));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use("/api/v3/event", eventRoute);
app.use("/api/v3/account", accountRoute);
app.use("/api/v3/organiser", orginiserRoute);
app.use("/api/v3/profile", profileRoute);

module.exports = app;
