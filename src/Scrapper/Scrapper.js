const axios = require("axios");
const cheerio = require("cheerio");

class Scrapper {
  /**
   * @param {string} url
   */
  constructor(url) {
    this.url = url;
  }

  /**
   * @param {string|null|undefined} currUrl
   * @returns {Promise<cheerio.CheerioAPI>}
   */
  async fetchPage(currUrl = null) {
    try {
      const { data } = await axios.get(currUrl === null ? this.url : currUrl);
      return cheerio.load(data);
    } catch (error) {
      console.error(error);
    }
  }

  async readData() {
    throw new Error("Not implemented!");
  }
}

module.exports = Scrapper;
