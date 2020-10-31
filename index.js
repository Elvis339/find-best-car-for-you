// const express = require('express');
// const bodyParser = require('body-parser');
// const logger = require('morgan');

// const app = express();

// app.use(bodyParser.json());
// app.use(
//     bodyParser.urlencoded({
//         extended: true,
//     }),
// );
// app.use(logger('dev'));

// const Scrapper = require('./src/Scrapper/Scrapper');

// app.get('/', (req, res) => {
//     console.log(req.data);
//     res.send('OK')
// })

// app.listen(3000, () => {
//     console.log('Server started: http://localhost:3000');
// })

const Scrapper = require("./src/Scrapper/Scrapper");
const Mobile = require("./src/Mobile.de");
(async function () {
  // const mobile = new Scrapper("https://www.mobile.de/?lang=en");
  // const $ = await mobile.fetchPage();
  // // $("#qsmakeBuy").map((i, el) => {
  // //   console.log($(el).find("option").text());
  // // });
  // const parentDiv = $("#qsmm").children()[0].childNodes;
  // parentDiv.forEach((element) => {
  //   const par = element.children[1];
  //   for (let i in par) {
  //     console.log(par[i]);
  //   }
  // });

  const m = new Mobile("bmw", "330");
  const b = await m.makeRequest();
  console.log(b)
})();
