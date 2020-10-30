const Scrapper = require("../Scrapper/Scrapper");
const fs = require("fs");
const axios = require("axios");

class MobileDE extends Scrapper {
  URL = "https://www.mobile.de/";
  fileName = `${__dirname}/metadata.json`;

  constructor() {
    super("https://www.mobile.de/");
  }

  async getCarModels(carId) {
    try {
      const { data } = await axios.get(
        `https://mobile.de/svc/r/models/${carId}`
      );
      return data.models;
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = MobileDE;
