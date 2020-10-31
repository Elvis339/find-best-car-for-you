const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

const Scrapper = require("../Scrapper/Scrapper");
const { parse } = require("path");

class MobileDE extends Scrapper {
  fileName = `${__dirname}/metadata.json`;

  /**
   * @param {string} car 
   * @param {string} model 
   */
  constructor(car, model) {
    super("https://www.mobile.de/");
    this.car = car;
    this.model = model;
  }

  /**
   * @param {number} carId 
   * @param {number} modelId 
   * @param {null} additional 
   * @returns {string}
   */
  buildUrl(carId, modelId, additional = null) {
    return `https://suchen.mobile.de/fahrzeuge/search.html?dam=0&isSearchRequest=true&ms=${carId};${modelId}&sfmr=false&vc=Car`
  }

  /**
   * @returns {number}
   */
  getCarId() {
    const carsFromFile = fs.readFileSync(this.fileName, "utf-8");
    const carsArray = JSON.parse(carsFromFile);
    for (const car of carsArray) {
      if (this.car.toLowerCase() === car.name.toLowerCase()) {
        return car.id;
      }
    }
    throw new TypeError("Cound't find the car you were looking for, please check the spelling.")
  }

  /**
   * @returns {number}
   */
  async getModelId() {
    try {
      const carId = this.getCarId();
      const { data } = await axios.get(
        `https://mobile.de/svc/r/models/${carId}`
      );
      return data.models.find(car => {
        if (car.n.toLowerCase() === this.model.toLowerCase()) {
          return car.i
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @param {string} prices 
   * @returns {number[]}
   * @description Applies alcohol to sanitize irrelevant characters from prices
   */
  santizePrices(prices) {
    let arrayOfPrices = [];
    prices.split("€").forEach(price => {
      const sant = price.match(/[0-9]+/g);
      if (sant) {
        arrayOfPrices.push(sant.join(','))
      }
    })
    return arrayOfPrices;
  }

  /**
   * @param {number} carId 
   * @param {number} modelId 
   * @returns {number}
   */
  async currentPage(carId, modelId) {
    const { data } = await axios.get(`https://suchen.mobile.de/fahrzeuge/count.json?&_jsonp=jQuery34104103185243062555_1604089993726&isSearchRequest=true&vc=Car&dam=0&ms=${carId};${modelId}&sfmr=false
    `);
    const count = data.match(/("numResultsTotal")[:]\d+/g)[0].split(":")[1];
    return parseInt(count, 10)
  }

  /**
   * @returns {Promise<string>}
   */
  async makeRequest() {
    try {
      const carId = this.getCarId();
      const modelId = this.getModelId();
      const url = this.buildUrl(carId, modelId);
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      const prices = $('.u-block').text();
      // const lastPageCount = $('ul > .padding-last-button > span[data-touch="link"]')[0]
      const itemsPerPage = $('div.cBox-body--resultitem').length
      return await this.currentPage(carId, modelId) / parseInt(itemsPerPage, 10);
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = MobileDE;
