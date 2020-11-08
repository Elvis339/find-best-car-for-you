import { getCars } from "./Controller/CarController";
import { hasDataInDatabase } from "./Middleware";
const db = require("./Database/Queries");

const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");

const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(logger("dev"));
// app.use(queryBeforeRequest);

app.post("/", hasDataInDatabase, getCars);

app.listen(3000, () => {
  console.log("Server started: http://localhost:3000");
});
