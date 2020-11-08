import { Request, NextFunction } from "express";
import { CarRepository } from "../Repository/CarRepository";
import { HistoryRepository } from "../Repository/HistoryRepository";

export const hasDataInDatabase = async (
  req: Request,
  _,
  next: NextFunction
) => {
  try {
    const data = req.body;
    const htx = new HistoryRepository();
    const ctx = new CarRepository();

    const hasData = await htx.getOneBy(data.car, data.model, data.yearFrom);

    if (hasData) {
      //@ts-ignore
      req.hasCars = true;
    } else {
      //@ts-ignore
      req.hasCars = false;
    }
    next();
  } catch (error) {
    console.error(error);
  }
};
