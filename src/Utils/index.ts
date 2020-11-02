const axios = require("axios");
const cheerio = require("cheerio");
const CarRepository = require("../Repository/CarRepository");

export async function* saveMobileDeSync(
  urls: string[],
  carId: number,
  modelId: number
): AsyncIterableIterator<any> {
  for (const url of urls) {
    const res: any = await axios.get(url);
    const $ = cheerio.load(res.data);
    const name = $("h1#rbt-ad-title").text();
    const price = $("span.h3.rbt-prime-price").text().split("€")[0];
    const firstRegistration = $("div#rbt-firstRegistration-v").text();
    const description = $("div.g-col-12.description").text();
    const transmission = $("div#rbt-transmission-v").text();
    const fuelType = $("div#rbt-fuel-v").text();
    const vehicleType = $("div#rbt-category-v").text();
    yield new CarRepository(
      name,
      carId,
      modelId,
      firstRegistration,
      url,
      "NOT_SUPPOERTED YET!",
      price,
      description,
      transmission,
      fuelType,
      vehicleType
    ).createCar();
  }
}
