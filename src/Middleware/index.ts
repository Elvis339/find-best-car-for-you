import { Request, Response, NextFunction } from "express";
import { Car } from "../Entities/Car";
import { CarRepository } from "../Repository/CarRepository";

export const queryBeforeRequest = (req, _, next: NextFunction) => {
  try {
    console.log(req.body);
    // const cars: Car[] | null = CarRepository.findBy(``);
    // if (!cars) {
    //   return;
    // }
    // req.cars = cars;
    next();
  } catch (error) {
    console.error(error);
  }
};
