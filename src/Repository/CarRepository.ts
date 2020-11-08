import { Queries } from "../Database/Queries";
import { Car } from "../Entities/Car";
import { findByOpts, Repository } from "./RepositoryInterface";
const dbx = require("../Database");

export class CarRepository implements Repository {
  constructor() {}

  insert(data: Car[]) {
    let sql = Queries.insertIntoCar;
    dbx.run(sql, data, (err) => {
      if (err) {
        throw new Error(err);
      }
      // console.log("ROW INSERTED...");
    });
  }

  update() {
    return null;
  }

  delete() {
    return null;
  }

  getAll() {
    return null;
  }

  getOneBy() {
    return null;
  }

  getBy({ column, searchBy }: findByOpts, select = "*"): Promise<Car[] | null> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT ${select} FROM cars WHERE ${column}=${searchBy};`;
      dbx.all(sql, function (err: Error, rows: Car[] | null) {
        if (err) reject(err);

        const hasRows = rows.length > 0 ? rows : null;
        resolve(hasRows);
      });
    });
  }

  getSortedByYearAndPrice(
    car_name: string,
    model_name: string
  ): Promise<Car[] | null> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM 'cars' WHERE car_name='${car_name}' AND model_name='${model_name}' ORDER BY first_registration DESC, price ASC;`;
      dbx.all(sql, (err: Error, rows: Car[] | null) => {
        if (err) reject(err);

        const hasRows = rows && rows.length > 0 ? rows : null;
        resolve(hasRows);
      });
    });
  }
}
