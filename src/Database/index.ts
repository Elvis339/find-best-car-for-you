const sqlite3 = require("sqlite3").verbose();
import { Queries } from "./Queries";

let ctx = new sqlite3.Database("./queries.db", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the queries database.");
});

ctx.run(Queries.createCarTable);

module.exports = ctx;
