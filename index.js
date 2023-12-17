const moment = require('moment');
const { createHmac } = require('crypto');
require('dotenv').config();
const axios = require("axios")

const BASE_URL = 'https://api.binance.com';

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

const buy = async () => {
    const options = {
        symbol: "ACEUSDT",
        side: "BUY",
        type:"MARKET",
        quoteOrderQty: "40"
    }

    try {
        const result = await privateBinanceRequest(
            "POST", 
            "/api/v3/order", 
            process.env.BINANCE_API_KEY, 
            process.env.BINANCE_API_SECRET,
            options
        )
        return result
    } catch (error) {
        console.log("ERRR::", error)
    }
} 

const ACE_TIME = 1702843740000; // FIXMEEE
const TEST_TIME = 1702844700000;
let alreadyBought = false;
let buyResult;
const main = async () => {
    if(alreadyBought) return
    const currentTime = moment.utc(new Date().getTime()).toDate().getTime()
    if(currentTime > TEST_TIME){
        buyResult = await buy()
        if(buyResult?.code !== -1121){
            alreadyBought = true;
            console.log("BUY result: ", buyResult)
            return buyResult
        }else {
            console.log("FAILED ERRR:", buyResult)
        }
    }else{
        console.log("Currennt time::", new Date(currentTime).toString())
    }
}


let interval = setInterval( async () => {
    const finalTrade = await main()
    if(finalTrade){
        clearInterval(interval)
    }
}, 200);
