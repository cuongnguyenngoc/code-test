import { useEffect, useMemo, useState } from "react";
/**
 * determine token icon component, if image found in /public/tokens folder for symbol,
 * then display the image, otherwhile display first letter of the symbol
 * @param {symbol: string}  
 * @returns token icon component
 */
function TokenIcon({ symbol }) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div className="w-6 h-6 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-xs font-semibold">
        {symbol[0]}
      </div>
    );
  }

  return (
    <img
      src={`/tokens/${symbol.toUpperCase()}.svg`}
      alt={symbol}
      className="w-6 h-6"
      onError={() => setErrored(true)}
    />
  );
}

/**
 * Allow user to select coin from dropdown
 * @param {value: string, onChange: setter, coins: list of coins} param0 
 * @returns CoinSelector component showing coin icon, coins dropdown list and selected coin
 */
function CoinSelector({ value, onChange, coins }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative w-full">
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          w-full flex items-center justify-between 
          p-3 rounded-xl
          backdrop-blur-md 
          bg-white/10 
          border border-white/20 
          shadow-md
          cursor-pointer
        "
      >
        <div className="flex items-center gap-2">
          <TokenIcon symbol={value} />
          <span className="font-medium">{value}</span>
        </div>
        <span className="opacity-70">▼</span>
      </button>

      {/* Dropdown Content */}
      {open && (
        <div
          className="
            absolute mt-2 w-full z-20
            rounded-xl
            backdrop-blur-xl
            bg-white/10
            border border-white/20
            shadow-xl
            max-h-64
            overflow-y-auto
          "
        >
          {coins.map((c) => (
            <div
              key={c}
              className="
                p-3 flex items-center gap-3 
                hover:bg-white/20 
                cursor-pointer 
                transition
              "
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
            >
              <TokenIcon symbol={c} />
              <span className="font-medium">{c}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
};

export default function App() {
  const [pricesMap, setPricesMap] = useState({});
  const [inputCoin, setInputCoin] = useState("USD");
  const [outputCoin, setOutputCoin] = useState("ETH");
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const [editingSide, setEditingSide] = useState(null);
  const [swapResponse, setSwapResponse] = useState(null);
  const [swapError, setSwapError] = useState(null);
  const [swapLoading, setSwapLoading] = useState(false);

  // fetch prices from url on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("https://interview.switcheo.com/prices.json");
        const data = await res.json();
        const map = Object.fromEntries(data.map((p) => [p.currency, p.price]));
        setPricesMap(map);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }
    fetchData();
  }, []);

  // conversion logic
  function convertCoinAmt(coin, amount, targetCoin, setter) {
    if (!amount) {
      setter("");
      return;
    }
    const usdValue = Number(amount) * pricesMap[coin];
    const targetAmount = usdValue / pricesMap[targetCoin];
    setter(targetAmount.toFixed(6));
  }

  // sync amounts depending on which field was edited
  useEffect(() => {
    if (!pricesMap) return;

    // if amount to send is edited, the amount to receive will be updated accordingly
    if (editingSide === "input") {
      convertCoinAmt(inputCoin, inputAmount, outputCoin, setOutputAmount);
    }

    // if amount to receive is edited, the amount to send will be updated accordingly
    if (editingSide === "output") {
      convertCoinAmt(outputCoin, outputAmount, inputCoin, setInputAmount);
    }
  }, [inputAmount, outputAmount, inputCoin, outputCoin, pricesMap]);

  // useMemo to avoid re-update if no change in pricesMap
  const coins = useMemo(() => {
    return Object.keys(pricesMap).sort();
  }, [pricesMap]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page loading
    setSwapResponse(null);
    setSwapError(null);

    // convert values to numbers for validation
    const inputVal = Number(inputAmount);
    const outputVal = Number(outputAmount);

    // --- validation ---
    if (!inputAmount) {
      setSwapError("Amount to send is empty");
      return;
    }
    if (!outputAmount) {
      setSwapError("Amount to receive is empty");
      return;
    }
    // amounts must be positive
    if (isNaN(inputVal) || inputVal <= 0) {
      setSwapError("Amount to send must be greater than 0");
      return;
    }
    if (isNaN(outputVal) || outputVal <= 0) {
      setSwapError("Amount to receive must be greater than 0");
      return;
    }
    
    setSwapLoading(true);
    await sleep(1000); // sleep 1s as fake waiting response from backend
    setSwapLoading(false);
    setSwapResponse(`Swap done:\n${inputAmount} ${inputCoin} → ${outputAmount} ${outputCoin}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6 space-y-6"
      >
        <h5 className="text-xl font-semibold text-gray-800">Swap</h5>

        {/* input amount */}
        <div className="flex flex-col space-y-2">
          <label className="text-gray-600">Amount to send</label>

          <input
            type="number"
            value={inputAmount}
            onChange={(e) => {
              setEditingSide("input");
              setInputAmount(e.target.value);
            }}
            placeholder="0.00"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          <CoinSelector
            value={inputCoin}
            onChange={setInputCoin}
            coins={coins}
          />
        </div>

        {/* output amount */}
        <div className="flex flex-col space-y-2">
          <label className="text-gray-600">Amount to receive</label>

          <input
            type="number"
            value={outputAmount}
            onChange={(e) => {
              setEditingSide("output");
              setOutputAmount(e.target.value);
            }}
            placeholder="0.00"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          <CoinSelector
            value={outputCoin}
            onChange={setOutputCoin}
            coins={coins}
          />
        </div>

        <button
          type="submit"
          disabled={swapLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition cursor-pointer"
        >
          {!swapLoading ? (
            "CONFIRM SWAP"
          ) : (
            <div className="flex items-center gap-2 justify-center">
              SWAPPING
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>
        {swapResponse && (
          <div className="mt-4 p-4 bg-green-100 text-green-900 border border-green-300 rounded-xl whitespace-pre-line shadow">
            {swapResponse}
          </div>
        )}
        {swapError && (
          <div className="mt-4 p-4 bg-red-100 text-red-900 border border-red-300 rounded-xl whitespace-pre-line shadow">
            {swapError}
          </div>
        )}
      </form>
    </div>
  );
}
