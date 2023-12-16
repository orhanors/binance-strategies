const moment = require('moment');
const { createHmac } = require('crypto');
require('dotenv').config();
const axios = require("axios")

const BASE_URL = 'https://api.binance.com';
// Define the trade parameters
const symbol = 'SOLUSDT';
const quantity = 1; // The quantity of SOL you want to buy
const tradeTime = '2023-01-01T10:00:00Z'; // Set your desired time in UTC

const queryString = (obj) => {
    let str = '';
    for (const key in obj) {
      str += key + '=' + obj[key] + '&';
    }
    return str.slice(0, -1);
  };

 const  _buildSign = (data, apiSecret) =>  {
    return createHmac('sha256', apiSecret).update(data).digest('hex');
  }

const privateBinanceRequest = async (
    method,
    url,
    apiKey,
    apiSecret,
    options,
  ) => {
    const dataQueryString = queryString({ ...options, timestamp: Date.now() });
    const signature = _buildSign(dataQueryString, apiSecret);
    const requestConfig = {
      method: method,
      url:
        BASE_URL + url + '?' + dataQueryString + '&signature=' + signature,
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
      validateStatus: () => true,
    };
    try {
      const { data, status } = await axios(requestConfig);
      if (status === 429) {
        throw new Error(
          "Fucked up"
        );
      }
      return data;
    } catch (e) {
        console.log("ERR:", e)
      if (e?.status === 429 || e?.response?.status === 429) {
        throw new Error(
          "Fucked up"
        );
      } else {
        throw new Error(
            "Internal server err"
        );
      }
    }
  }

// Schedule the trade
const currentTime = moment.utc();
const targetTime = moment.utc(tradeTime);

if (true) {
  setTimeout(() => {
    privateBinanceRequest("GET", "/api/v3/account", process.env.BINANCE_API_KEY, process.env.BINANCE_API_SECRET).then(res => console.log(res))
  }, 1000);
} else {
  console.log('The specified trade time has already passed.');
}
