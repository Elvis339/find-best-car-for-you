import { Queries } from "../Database/Queries";
import { Car } from "../Entities/Car";
import { findByOpts, Repository } from "./RepositoryInterface";
const dbx = require("../Database");

export class CarRepository implements Repository {
  constructor() {}

  createCar(data: Car[]) {
    let sql = Queries.insertIntoCar;
    dbx.run(sql, data, (err) => {
      if (err) {
        throw new Error(err);
      }
      console.log("ROW INSERTED...");
    });
  }

  static findBy({ column, searchBy }: findByOpts): Promise<Car | undefined> {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM cars WHERE ${column}=${searchBy};`;
      dbx.get(sql, function (err: Error, row: Car | null) {
        if (err) reject(err);

        resolve(row);
      });
      dbx.close();
    });
  }
}
