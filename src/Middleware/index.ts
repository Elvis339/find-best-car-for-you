import { Request, NextFunction } from "express";
import { CarRepository } from "../Repository/CarRepository";
import { HistoryRepository } from "../Repository/HistoryRepository";
import moment from "moment";

export const hasDataInDatabase = async (
  req: Request,
  _,
  next: NextFunction
) => {
  try {
    const data = req.body;
    const htx = new HistoryRepository();

    const hasData = await htx.getOneBy(data.car, data.model, data.yearFrom);

    console.log(hasData, "hasData");
    if (hasData) {
      const dateInserted = hasData.time;
      const twoDaysFromDateInserted = moment().unix() + 48 * 3600;
      console.log(
        dateInserted < twoDaysFromDateInserted,
        "dateInserted < twoDaysFromDateInserted"
      );
      if (dateInserted < twoDaysFromDateInserted) {
        //@ts-ignore
        req.hasCars = true;
      }
    } else {
      //@ts-ignore
      req.hasCars = false;
    }

    next();
  } catch (error) {
    console.error(error);
  }
};
