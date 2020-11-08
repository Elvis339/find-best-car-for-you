import { findByOpts, Repository } from "./RepositoryInterface";
import { Queries } from "../Database/Queries";
import { History } from "../Entities/History";

const dbx = require("../Database");

export class HistoryRepository implements Repository {
  constructor() {}

  insert(brand_name: string, model_name: string, first_registration?: number) {
    const sql = Queries.insertIntoHistory;
    dbx.run(
      sql,
      [brand_name.toLowerCase(), model_name.toLowerCase(), first_registration],
      (err) => {
        if (err) {
          throw new Error(err);
        }
        console.log("Inserted into history log...");
      }
    );
  }

  delete() {
    return null;
  }

  getAll(): Promise<History[] | null> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM history;`;
      return dbx.all(sql, (err, row: History[] | null) => {
        if (err) {
          reject(err);
        }
        const hasRow = row.length > 0 ? row : null;
        resolve(hasRow);
      });
    });
  }

  getOneBy(
    brand_name: string,
    model_name: string,
    first_registration?: string
  ): Promise<History | null> {
    return new Promise((resolve, reject) => {
      const sql = first_registration
        ? `SELECT * FROM history WHERE brand_name ='${brand_name}' AND model_name ='${model_name}' AND first_registration ='${first_registration}';`
        : `SELECT * FROM history WHERE brand_name ='${brand_name}' AND model_name ='${model_name}';`;
      return dbx.get(sql, (err, row: History | null) => {
        if (err) {
          reject(err);
        }
        const hasRow = row ? row : null;
        resolve(hasRow);
      });
    });
  }

  getBy(
    { column, searchBy }: findByOpts,
    select = "*"
  ): Promise<History[] | null> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT ${select} FROM cars WHERE ${column}=${searchBy};`;
      dbx.all(sql, function (err: Error, rows: History[] | null) {
        if (err) reject(err);

        const hasRows = rows.length > 0 ? rows : null;
        resolve(hasRows);
      });
    });
  }

  update() {
    return null;
  }
}
