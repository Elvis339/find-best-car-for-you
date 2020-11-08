const cheerio = require("cheerio");

import axios, { AxiosResponse } from "axios";
import { PAResponse } from "./PolovniAutomobiliInterface";
import { CarAdditionalQueryProps } from "../../Entities/Car";
import { ManagerInterface } from "../ManagerInterface";
import { santizePolovniAutomobiliData } from "../../Utils";
import { CarRepository } from "../../Repository/CarRepository";
import { HistoryRepository } from "../../Repository/HistoryRepository";
interface UrlType {
  brand: string;
  model: string;
  price_from?: string;
  price_to?: string;
  year_from?: string;
  year_to?: string;
  chassis?: string;
  fuel?: string;
  gearbox?: string;
}

export class PolovniAutomobili implements ManagerInterface {
  private API_URL = "https://www.polovniautomobili.com/json/getModels/26";
  public car_id: number;
  public model_id: number;

  constructor(
    public car: string,
    public model: string,
    public additional: CarAdditionalQueryProps = {}
  ) {
    this.car = car;
    this.model = model;
    this.additional = additional;
  }

  async getCarMetadata() {
    try {
      let carId: number, modelId: number, brandName: string, modelName: string;
      const res: AxiosResponse<PAResponse[]> = await axios.get(this.API_URL);
      res.data.find((car: PAResponse) => {
        if (car.brandName.toLowerCase() === this.car.toLowerCase()) {
          carId = car.brandID;
          brandName = car.brandName;
        }

        car.modelList.find((model) => {
          if (model.modelName.toLowerCase() === this.model.toLowerCase()) {
            modelId = parseInt(model.modelID, 10);
            modelName = model.modelName;
          }
        });
      });
      return {
        carId,
        modelId,
        brandName,
        modelName,
      };
    } catch (error) {
      console.error(error);
    }
  }

  buildUrl(brandName: string, modelName: string, currentPage?: number): string {
    let url =
      currentPage > 1
        ? `https://www.polovniautomobili.com/auto-oglasi/pretraga?page=${currentPage}sort=price_asc&`
        : "https://www.polovniautomobili.com/auto-oglasi/pretraga?sort=price_asc&";
    let urlType: UrlType = {
      brand: brandName.toLowerCase(),
      model: modelName.toLowerCase(),
    };
    const additional = this.additional;
    for (const key in additional) {
      if (key === "vehicleType") {
        if (additional[key] === "Limousine") {
          urlType = {
            ...urlType,
            chassis: "277",
          };
        } else if (additional[key] === "Estate") {
          urlType = {
            ...urlType,
            chassis: "278",
          };
        }
      } else if (key === "yearFrom") {
        urlType = {
          ...urlType,
          year_from: `${additional.yearFrom}`,
        };
      } else if (key === "yearTo") {
        urlType = {
          ...urlType,
          year_to: `${additional.yearTo}`,
        };
      } else if (key === "fuelType") {
        urlType = {
          ...urlType,
          fuel: "2309",
        };
      } else if (key === "priceFrom") {
        urlType = {
          ...urlType,
          price_from: `${additional.priceFrom}`,
        };
      } else if (key === "priceTo") {
        urlType = {
          ...urlType,
          price_to: `${additional.priceTo}`,
        };
      } else if (key === "transmission") {
        if (additional[key] === "Automatic") {
          urlType = {
            ...urlType,
            gearbox: "251",
          };
        }
      }
    }

    const keys = Object.keys(urlType);

    keys.forEach((type, index) => {
      if (keys.length === index + 1) {
        // @ts-ignore
        url += `${type}=${urlType[type]}`;
      } else if (type === "model") {
        url += `${type}%5B%5D=${urlType[type]}&`;
      } else {
        // @ts-ignore
        url += `${type}=${urlType[type]}&`;
      }
    });

    return url;
  }

  getCarUrls(urls: typeof cheerio): string[] {
    let arr: string[] = [];
    urls.map((_, element: typeof cheerio) => {
      const attributes = element.attribs;
      for (const _ in attributes) {
        if (attributes["href"] !== undefined) {
          arr.push(`https://www.polovniautomobili.com${attributes["href"]}`);
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

  async makeRequest(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          brandName,
          modelName,
          carId,
          modelId,
        } = await this.getCarMetadata();
        this.car_id = carId;
        this.model_id = modelId;

        const url = this.buildUrl(brandName, modelName);
        // console.log(url);
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const currentCarUrlText = $(
          "span.uk-width-medium-7-10.uk-width-7-10 > a"
        );
        let pagination = $("ul.uk-pagination.uk-pagination-left").find(
          "li > a.js-pagination-numeric"
        ).length;

        let urlArray: string[] = [...this.getCarUrls(currentCarUrlText)];
        if (pagination > 1) {
          for (let i = 2; i < 4; i++) {
            const url = this.buildUrl(brandName, modelName, i);
            // console.log(url);
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            const currentCarUrlText = $(
              "span.uk-width-medium-7-10.uk-width-7-10 > a"
            );
            urlArray.push(...this.getCarUrls(currentCarUrlText));
          }
        }
        await santizePolovniAutomobiliData(
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
