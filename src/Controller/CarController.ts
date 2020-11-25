import { Request, Response } from "express";
import { CarRepository } from "../Repository/CarRepository";
import { HistoryRepository } from "../Repository/HistoryRepository";
import { MobileDE } from "../websites/Mobile.de";
import { PolovniAutomobili } from "../websites/PolovniAutomobili";

export const getCars = async (req: Request, res: Response) => {
  const repository = new CarRepository();
  const htx = new HistoryRepository();
  try {
    const data = req.body;
    console.log(data, "data");
    //@ts-ignore
    const hasCars = req.hasCars;

    console.log(hasCars, "hasCars");
    if (hasCars) {
      const db_data = await repository.getSortedByYearAndPrice(
        data.car,
        data.model
      );
      return res.render("cars", {
        cars: db_data,
      });
    }

    const mobile = await new MobileDE(data.car, data.model, data).makeRequest();
    const polovni = await new PolovniAutomobili(
      data.car,
      data.model,
      data
    ).makeRequest();

    const arrOfFuncs = [mobile, polovni];
    // @ts-ignore
    await Promise.allSettled(arrOfFuncs);

    const query = await repository.getSortedByYearAndPrice(
      data.car,
      data.model
    );

    console.log(query, "query");
    if (query && query.length > 0) {
      htx.insert(data.car, data.model, data.yearFrom);
    }

    return res.render("cars", {
      cars: query,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      error: error.toString(),
    });
  }
};
