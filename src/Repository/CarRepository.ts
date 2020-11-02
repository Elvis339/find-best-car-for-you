import { type } from "os";
import { Queries } from "../Database/Queries";
import { Car } from "../Entities/Car";
import { findByOpts, Repository } from "./RepositoryInterface";
const dbx = require("../Database");

export class CarRepository implements Repository {
  constructor(
    private name: string,
    private car_id: number,
    private model_id: number,
    private firstRegistration: string,
    private url: string,
    private img_url: string,
    private price: number,
    private descritpion: string,
    private transmission: string,
    private fuelType: string,
    private vehicleType: string
  ) {
    this.name = name;
    this.car_id = car_id;
    this.model_id = model_id;
    this.firstRegistration = firstRegistration;
    this.url = url;
    this.img_url = img_url;
    this.price = price;
    this.descritpion = descritpion;
    this.transmission = transmission;
    this.fuelType = fuelType;
    this.vehicleType = vehicleType;
  }

  createCar() {
    const values = [
      this.name,
      this.car_id,
      this.model_id,
      this.firstRegistration,
      this.url,
      this.img_url,
      this.price,
      this.descritpion,
      this.transmission,
      this.fuelType,
      this.vehicleType,
    ];

    let sql = Queries.insertIntoCar;
    dbx.run(sql, values, (err) => {
      if (err) {
        throw new Error(err);
      }
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
