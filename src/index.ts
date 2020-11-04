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

// app.get('/', (req, res) => {
//     console.log(req.data);
//     res.send('OK')
// })

// app.listen(3000, () => {
//     console.log('Server started: http://localhost:3000');
// })

import { PolovniAutomobili } from "./websites/PolovniAutomobili";
import { CarRepository } from "./Repository/CarRepository";
(async function () {
  const m = new PolovniAutomobili("bmw", "320", {
    yearFrom: 2010,
    yearTo: 2014,
    priceTo: 8000,
    // vehicleType: "Estate",
    // transmission: "AUTOMATIC_GEAR",
  });
  await m.makeRequest();
})();
