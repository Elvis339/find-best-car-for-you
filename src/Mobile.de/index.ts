const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

import { saveMobileDeSync } from "../Utils";
import { MobileDEInterface } from "./MobileDEInterface";

export interface MobileDEAdditionalProps {
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  fuelType?:
    | "CNG"
    | "DIESEL"
    | "ELECTRICITY"
    | "ETHANOL"
    | "HYBRID"
    | "HYBRID_DIESEL"
    | "HYDROGENIUM"
    | "LPG"
    | "PETROL";
  vehicleType?:
    | "Limousine"
    | "Cabrio"
    | "EstateCar"
    | "OffRoad"
    | "SmallCar"
    | "SportsCar"
    | "Van";
  transmission?: "AUTOMATIC_GEAR" | "MANUAL_GEAR" | "SEMIAUTOMATIC_GEAR";
}

export type CarMetadata = {
  id: number;
  name: string;
};

export type ModelMetadata = {
  i: number;
  n: string;
  p?: number;
};

export type UrlType = {
  damageUnrepaired?: "NO_DAMAGE_UNREPAIRED";
  grossPrice?: boolean;
  isSearchRequest?: boolean; // By default it's true
  "makeModelVariant1.makeId"?: number; // carId
  "makeModelVariant1.modelId"?: number; // modelId
  maxFirstRegistrationDate?: string;
  minFirstRegistrationDate?: string;
  minPrice?: string;
  maxPrice?: string;
  scopeId?: "C";
  "sortOption.sortBy"?: "searchNetGrossPrice";
  "sortOption.sortOrder"?: "ASCENDING";
  categories?:
    | "Limousine"
    | "Cabrio"
    | "EstateCar"
    | "OffRoad"
    | "SmallCar"
    | "SportsCar"
    | "Van"; // Category of the car
  tr?: "AUTOMATIC_GEAR" | "MANUAL_GEAR" | "SEMIAUTOMATIC_GEAR" | string; // Transmision
  ft?:
    | "CNG"
    | "DIESEL"
    | "ELECTRICITY"
    | "ETHANOL"
    | "HYBRID"
    | "HYBRID_DIESEL"
    | "HYDROGENIUM"
    | "LPG"
    | "PETROL"; // Fuel Type
};

class MobileDE implements MobileDEInterface {
  private fileName: string = `${__dirname}/metadata.json`;

  constructor(
    public car: string,
    public model: string,
    public additional: MobileDEAdditionalProps = {}
  ) {
    this.car = car;
    this.model = model;
    this.additional = additional;
  }

  buildUrl(carId: number, modelId: number): string {
    let url = `https://suchen.mobile.de/fahrzeuge/search.html?`;
    let urlType: UrlType = {
      "makeModelVariant1.makeId": carId,
      "makeModelVariant1.modelId": modelId,
      damageUnrepaired: "NO_DAMAGE_UNREPAIRED",
      grossPrice: true,
      isSearchRequest: true,
    };

    const additional = this.additional;
    for (const key in additional) {
      if (key === "vehicleType") {
        urlType = {
          ...urlType,
          categories: additional.vehicleType,
        };
      } else if (key === "yearFrom") {
        urlType = {
          ...urlType,
          minFirstRegistrationDate: `${additional.yearFrom}-01-01`,
        };
      } else if (key === "yearTo") {
        urlType = {
          ...urlType,
          maxFirstRegistrationDate: `${additional.yearTo}-12-31`,
        };
      } else if (key === "fuelType") {
        urlType = {
          ...urlType,
          ft: additional.fuelType,
        };
      } else if (key === "priceFrom") {
        urlType = {
          ...urlType,
          minPrice: `${additional.priceFrom}`,
        };
      } else if (key === "priceTo") {
        urlType = {
          ...urlType,
          maxPrice: `${additional.priceTo}`,
        };
      } else if (key === "transmission") {
        urlType = {
          ...urlType,
          tr: `${additional.transmission}`,
        };
      }
    }

    urlType = {
      ...urlType,
      scopeId: "C",
      "sortOption.sortBy": "searchNetGrossPrice",
      "sortOption.sortOrder": "ASCENDING",
    };

    const keys = Object.keys(urlType);

    keys.forEach((type, index) => {
      if (keys.length === index + 1) {
        // @ts-ignore
        url += `${type}=${urlType[type]}&s=Car&vc=Car`;
      } else {
        // @ts-ignore
        url += `${type}=${urlType[type]}&`;
      }
    });
    return url;
  }

  santizeAndSortPrices(prices: string): number[] {
    let arrayOfPrices: string[] = [];
    prices.split("€").forEach((price) => {
      const sant = price.match(/[0-9]+/g);
      if (sant) {
        arrayOfPrices.push(sant.join(","));
      }
    });
    return arrayOfPrices
      .map((price) => {
        const realNumber = price.replace(/,/g, "");
        return parseInt(realNumber, 10);
      })
      .sort((a, b) => a - b);
  }

  getCarId(): number {
    const carsFromFile: string = fs.readFileSync(this.fileName, "utf-8");
    const carsArray: CarMetadata[] = JSON.parse(carsFromFile);
    for (const car of carsArray) {
      if (this.car.toLowerCase() === car.name.toLowerCase()) {
        return car.id;
      }
    }
    throw new TypeError(
      "Cound't find the car you were looking for, please check the spelling."
    );
  }

  async getModelId(): Promise<number> {
    const carId: number = this.getCarId();
    const { data } = await axios.get(`https://mobile.de/svc/r/models/${carId}`);
    const model: ModelMetadata = data.models.find((car: ModelMetadata) => {
      if (car.n.toLowerCase() === this.model.toLowerCase()) {
        return car.i;
      }
    });
    return model.i;
  }

  getCarUrls(urls: typeof cheerio): string[] {
    let arr: string[] = [];
    urls.map((_, element: typeof cheerio) => {
      const attributes = element.attribs;
      for (const _ in attributes) {
        if (attributes["href"] !== undefined) {
          arr.push(attributes["href"]);
        }
      }
    });
    return [...new Set(arr)];
  }

  async makeRequest(): Promise<void> {
    try {
      const carId: number = this.getCarId();
      const modelId: number = await this.getModelId();
      const url = this.buildUrl(carId, modelId);
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      const currentCarUrlText = $(
        "a.link--muted.no--text--decoration.result-item"
      );
      const carUrls = this.getCarUrls(currentCarUrlText);
      for await (const car of saveMobileDeSync(carUrls, carId, modelId)) {
        car;
      }
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = MobileDE;
