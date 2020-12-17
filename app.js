const express = require("express");
const app = express();
const requestIp = require("request-ip");
require("dotenv").config();
const axios = require("axios");

app.get("/api/v1/rate_conversion", async function (req, res) {
  let from = req.query.from;
  let to = req.query.to;

  if (!from || !to) {
    return res
      .status(422)
      .json({ status: "error", message: "Invalid data passed" });
  }

  const clientIp = requestIp.getClientIp(req);

  let validIp = true;
  if (process.env.ENVIRONMENT == "production") {
    validIp = false;
    let ipAcceptedList = process.env.WHITELIST_IP.split(",");
    validIp = ipAcceptedList.find((i) => {
      return i == clientIp;
    });
  }

  if (validIp) {
    try {
      let link = `https://min-api.cryptocompare.com/data/price?fsym=${from}&tsyms=${to}`;
      let response = await axios.get(link);
      if (response.status == 200) {
        return res
          .status(200)
          .json({ status: "success", message: response.data });
      }
      res.status(500).json({ status: "error", message: response });
    } catch (error) {
      throw new Error(error);
    }
  } else {
    res.status(422).json("Requested rejected");
  }
});

app.listen(3300);
