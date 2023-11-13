import { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";

const App = () => {
  const [globalQuote, setGlobalQuote] = useState({
    price: "...",
    open: "...",
    prev_close: "...",
    last_trading_day: "...",
  });
  const [listOfStocks, setListOfStocks] = useState([]);
  const [symbol, setSymbol] = useState("...");
  const [randomPrice, setRandomPrice] = useState("...");
  const [lowPrice, setLowPrice] = useState(0);
  const [highPrice, setHighPrice] = useState(0);

  useEffect(() => {
    const allNSEStocks = [];
    axios
      .get("https://stock-price-tracker-backend-one.vercel.app/api/bse/get_list_of_stocks")
      .then((response) => {
        allNSEStocks.push(
          ...response.data.data.map((stock) => {
            return {
              value: stock.symbol,
              label: stock.symbol,
            };
          })
        );
        setListOfStocks(allNSEStocks);
      })
      .catch((error) => console.log(error));
  }, []);

  let intervalRef;
  const getRandomPrice = () => {
    axios
      .get(`https://stock-price-tracker-backend-one.vercel.app/api/bse/get_random_price?low=${lowPrice}&high=${highPrice}`)
      .then((response) => {
        setRandomPrice(response.data.data);
      })
      .catch((error) => console.log(error));
  }

  useEffect(() => {
    if (highPrice !== 0) {
      getRandomPrice();
      clearInterval(intervalRef);
      intervalRef = setInterval(getRandomPrice, 100000);
    }
  }, [lowPrice, highPrice]);

  const handleChange = (e) => {
    setSymbol(e.value);

    axios
      .get(`https://stock-price-tracker-backend-one.vercel.app/api/bse/get_quote?symbol=${e.value}`)
      .then((response) => {
        setLowPrice(parseFloat(response.data["Global Quote"]["04. low"]));
        setHighPrice(parseFloat(response.data["Global Quote"]["03. high"]));
        setHighPrice(highPrice + 1);

        setGlobalQuote({
          price: `${response.data["Global Quote"]["05. price"]}`,
          open: `${response.data["Global Quote"]["02. open"]}`,
          prev_close: `${response.data["Global Quote"]["08. previous close"]}`,
          last_trading_day: `${response.data["Global Quote"]["07. latest trading day"]}`,
        });
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="bg-slate-100">
      <div className="flex p-3 justify-center">
        <h3 className="text-2xl">Stock Price Tracker</h3>
      </div>
      <div className="flex p-5 justify-center">
        <Select
          className="basic-single"
          classNamePrefix="select"
          isSearchable={true}
          name="stocklist"
          options={listOfStocks}
          onChange={handleChange}
        />
      </div>
      <div className="p-10 flex justify-center">
        <a
          href="#"
          className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <h5 className="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {symbol}
          </h5>
          <div className="text-gray-700 grid grid-cols-2 gap-5">
            <p>Price</p>
            <p className="col-end-7 col-span-2">{globalQuote.price}</p>
            <p>Previous close</p>
            <p className="col-end-7 col-span-2">{globalQuote.prev_close}</p>
            <p>Open</p>
            <p className="col-end-7 col-span-2">{globalQuote.open}</p>
            <p>Last trading day</p>
            <p className="col-end-7 col-span-2">
              {globalQuote.last_trading_day}
            </p>
            <p>Dummy price</p>
            <p className="col-end-7 col-span-2">{randomPrice}</p>
          </div>
          <div className="text-xs text-gray-600 mt-5">
          <p>** Dummy price changes every 1 minute without full page refresh</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default App;
