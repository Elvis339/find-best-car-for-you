const cheerio = require("cheerio");

import axios, { AxiosResponse } from "axios";
import { CarRepository } from "../Repository/CarRepository";

const dbx = new CarRepository();
export const santizeMobileDeData = async (
  urls: string[],
  carId: number,
  modelId: number,
  car_name: string,
  model_name: string
) => {
  urls.forEach(async (url: string, index: number) => {
    const { data }: AxiosResponse = await axios.get(url);
    const $ = cheerio.load(data);
    const name = $("h1#rbt-ad-title").text();
    const price = $("span.h3.rbt-prime-price").text().split("€")[0];
    const firstRegistration = $("div#rbt-firstRegistration-v")
      .text()
      .split("/")[1];
    const description = $("div.g-col-12.description").text();
    const transmission = $("div#rbt-transmission-v").text();
    const fuelType = $("div#rbt-fuel-v").text();
    const vehicleType = $("div#rbt-category-v").text();

    dbx.insert([
      name,
      carId,
      modelId,
      car_name,
      model_name,
      firstRegistration,
      url,
      "NOT_SUPPOERTED YET!",
      price,
      description,
      transmission,
      fuelType,
      vehicleType,
    ]);
  });
};

export const santizePolovniAutomobiliData = async (
  urls: string[],
  carId: number,
  modelId: number,
  car_name: string,
  model_name: string
) => {
  urls.forEach(async (url) => {
    const res: AxiosResponse<string> = await axios.get(url);
    const $ = cheerio.load(res.data);
    const name = $("h1.h1-classified-title").text();
    const description = $("div.uk-width-1-1.description-wrapper")
      .text()
      .replace("\n", "");
    const wrapper = $("section.classified-content > div.uk-grid").children();

    const firstRegistrationWrapper = wrapper[9].children;
    const firstRegistration = firstRegistrationWrapper[0].data.split(".")[0];
    const priceWrapper = $("div.price-item.position-relative")
      .text()
      .split("€")[0]
      .replace("\n", "");
    let price = parseInt(priceWrapper.replace(/\./g, ""), 10);

    if (priceWrapper === "" || isNaN(price)) {
      price = 0;
    }

    const transmissionWrapper = $("div.uk-grid.js-hidden").children()[5]
      .children;
    const transmission = transmissionWrapper[0].data;

    const fuelTypeWrapper = wrapper[15].children;
    const fuelType = fuelTypeWrapper[0].data;

    const vehicleTypeWrapper = wrapper[13].children;
    const vehicleType = vehicleTypeWrapper[0].data;

    dbx.insert([
      name,
      carId,
      modelId,
      car_name,
      model_name,
      firstRegistration,
      url,
      "NOT_SUPPOERTED YET!",
      price,
      description,
      transmission,
      fuelType,
      vehicleType,
    ]);
  });
};
