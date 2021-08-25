const http = require('http');
const axios = require('axios');
const moment = require('moment');

const eleringFormatter = function (data) {
  var parsedData = [];
  data.forEach(function(d) {
    var oneLine = {
      t: moment(d.timestamp*1000).format("HH"),
      p: (d.price / 10).toFixed(1)
    }
    parsedData.push(oneLine);
  });

  return parsedData;

}

const requestListener = function (req, res) {

  // from current hour and total of 4
  let startDate = moment().utc().add(-1, 'h').format();
  let endDate = moment().utc().add(3, 'h').format();

  // final URL like: "https://dashboard.elering.ee/api/nps/price?start=2021-08-22T21:00:00.000Z&end=2021-08-23T20:59:59.999Z"
  let dataUrl = "https://dashboard.elering.ee/api/nps/price?start=" + startDate + "&end=" + endDate;

  axios.get(dataUrl)
    .then(function (eleringResponse) {

      let final = {
        updated: moment().format("HH:mmddD")
      }

      if(eleringResponse.data.success != true) {
        final.status = "e1";
      } else {
        final.status = "ok";
      }

      if(eleringResponse.data.data.ee) {
        final.priceData = eleringFormatter(eleringResponse.data.data.ee);
      }

      var len =  (JSON.stringify(final)).length;
      console.log(final);


      res.setHeader('Content-Type', 'application/json; charset=UTF-8');
      res.setHeader('Content-Length', len);

      res.writeHead(200);
      res.end(JSON.stringify(final));

    })
    .catch(function(error) {
      console.log(error);
      res.writeHead(400);
      res.end({ status: "e2" });

    });

}

const server = http.createServer(requestListener);
server.listen(3335);
