const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

import { santizeMobileDeData } from "../../Utils";
import { MobileDEInterface } from "./MobileDEInterface";
import { CarAdditionalQueryProps } from "../../Entities/Car";
import { HistoryRepository } from "../../Repository/HistoryRepository";
import { CarRepository } from "../../Repository/CarRepository";

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
  categories?: string; // Category of the car
  tr?: string; // Transmision
  ft?: string;
};

export class MobileDE implements MobileDEInterface {
  private fileName: string = `${__dirname}/metadata.json`;

  constructor(
    public car: string,
    public model: string,
    public additional: CarAdditionalQueryProps = {}
  ) {
    this.car = car;
    this.model = model;
    this.additional = additional;
  }

  buildUrl(carId: number, modelId: number, currentPage?: number): string {
    let url =
      currentPage > 1
        ? `https://suchen.mobile.de/fahrzeuge/search.html?pageNumber=${currentPage}&`
        : `https://suchen.mobile.de/fahrzeuge/search.html?`;
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
        if (additional[key] === "Diesel") {
          urlType = {
            ...urlType,
            ft: "DIESEL",
          };
        } else {
          urlType = {
            ...urlType,
            ft: "PETROL",
          };
        }
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
        if (additional[key] === "Automatic") {
          urlType = {
            ...urlType,
            tr: "AUTOMATIC_GEAR",
          };
        } else {
          urlType = {
            ...urlType,
            tr: "MANUAL_GEAR",
          };
        }
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

  getYears() {
    if (this.additional) {
      if (this.additional.yearFrom) {
        return this.additional.yearFrom;
      } else if (this.additional.yearTo) {
        return this.additional.yearTo;
      }
    }
    return 0;
  }

  async hasDataInDatabase(): Promise<boolean> {
    const htx = new HistoryRepository();
    const data = await htx.getOneBy(
      this.car,
      this.model,
      this.getYears().toString()
    );
    return data ? true : false;
  }

  async makeRequest(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const carId: number = this.getCarId();
        const modelId: number = await this.getModelId();

        const url = this.buildUrl(carId, modelId);
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const currentCarUrlText = $(
          "a.link--muted.no--text--decoration.result-item"
        );
        const pagination =
          $("div.cBox-body.u-text-center.u-margin-top-18 > ul.pagination").find(
            "li"
          ).length - 1;

        let urlArray: string[] = [...this.getCarUrls(currentCarUrlText)];
        if (pagination > 1) {
          for (let i = 2; i <= 3; i++) {
            const url = this.buildUrl(carId, modelId, i);
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            const currentCarUrlText = $(
              "a.link--muted.no--text--decoration.result-item"
            );
            urlArray.push(...this.getCarUrls(currentCarUrlText));
          }
        }

        await santizeMobileDeData(
          urlArray,
          carId,
          modelId,
          this.car.toLowerCase(),
          this.model.toLowerCase()
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}
