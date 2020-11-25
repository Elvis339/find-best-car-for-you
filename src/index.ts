import { getCars } from "./Controller/CarController";
import { hasDataInDatabase } from "./Middleware";
const db = require("./Database/Queries");

const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(logger("dev"));

app.get("/", (req, res) => res.render("index"));
app.post("/find", hasDataInDatabase, getCars);

app.listen(3000, () => {
  console.log("Server started: http://localhost:3000");
});
