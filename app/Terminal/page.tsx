"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TerminalPage() {
  const [btcPrice, setBtcPrice] = useState("Loading...");
  const [ethPrice, setEthPrice] = useState("Loading...");
  const [eurUsd, setEurUsd] = useState("Loading...");
  const [xauUsd, setXauUsd] = useState("Loading...");
  const [gbpUsd, setGbpUsd] = useState("1.3450");

  const [signal, setSignal] = useState("WAIT");
  const [confidence, setConfidence] = useState(50);
  const [signalReasons, setSignalReasons] = useState<string[]>([
  "Waiting for market confirmation",
]);
const [orderFlowScore, setOrderFlowScore] = useState(50);
const [liquidityRead, setLiquidityRead] = useState("Neutral");

  const [authLoading, setAuthLoading] = useState(true);
  const [chartSymbol, setChartSymbol] = useState("BINANCE:BTCUSDT");
  const [selectedMarket, setSelectedMarket] = useState("BTC/USD");
  const [selectedPrice, setSelectedPrice] = useState("Loading..."); 
  const [orderflowScore, setorderFlowScore] = useState(62);
const [liquidityread, setLiquidityread] = useState("Above Highs");
const [smartMoneyRead, setSmartMoneyRead] = useState("Accumulation");

  const router = useRouter();

  function updateSignalForMarket(market: string, price: number) {
  let newSignal = "WAIT";
  let newConfidence = 55;
  let reasons = ["No clear institutional edge"];
  let Flow = 50;
  let liquidity = "Neutral";let flow = 50;
let Liquidity = "Neutral";

  if (market === "BTC/USD") {
    if (price > 78000) {
      newSignal = "LONG";
      newConfidence = 84;
      setOrderFlowScore(78);
setLiquidityRead("Above Highs");
setSmartMoneyRead("Accumulation");
      reasons = [
        "Price trading above key bullish threshold",
        "Momentum aligned with buyers",
        "Institutional accumulation bias",
      ];
      flow = 68;
      liquidity = "Liquidity {liquidityRead}";
    } else if (price < 76000) {
      newSignal = "SHORT";
      newConfidence = 76;
      setOrderFlowScore(28);
setLiquidityRead("Below Lows");
setSmartMoneyRead("Distribution");
      reasons = [
        "Price rejected below support threshold",
        "Seller pressure increasing",
        "Potential distribution phase",
      ];
      flow = 38;
      liquidity = "Liquidity below lows";
    }
  }

  if (market === "ETH/USD") {
    if (price > 2200) {
      newSignal = "LONG";
      newConfidence = 79;
      setOrderFlowScore(78);
setLiquidityRead("Above Highs");
setSmartMoneyRead("Accumulation");
      reasons = [
        "ETH momentum improving",
        "Buyer pressure holding structure",
        "Risk-on crypto conditions",
      ];
      flow = 63;
      liquidity = "Upside liquidity target";
    } else if (price < 2050) {
      newSignal = "SHORT";
      newConfidence = 73;
      setOrderFlowScore(28);
setLiquidityRead("Below Lows");
setSmartMoneyRead("Distribution");
      reasons = [
        "ETH below bearish threshold",
        "Momentum fading",
        "Downside liquidity risk",
      ];
      flow = 41;
      liquidity = "Liquidity below range";
    }
  }

  if (market === "EUR/USD") {
    if (price > 1.17) {
      newSignal = "LONG";
      newConfidence = 71;
      setOrderFlowScore(78);
setLiquidityRead("Above Highs");
setSmartMoneyRead("Accumulation");
      reasons = [
        "EUR strength above macro threshold",
        "Dollar weakness implied",
        "Trend bias turning bullish",
      ];
      flow = 59;
      liquidity = "Buy-side liquidity";
    } else if (price < 1.15) {
      newSignal = "SHORT";
      newConfidence = 70;
      setOrderFlowScore(28);
setLiquidityRead("Below Lows");
setSmartMoneyRead("Distribution");
      reasons = [
        "EUR below support threshold",
        "Dollar strength pressure",
        "Bearish continuation risk",
      ];
      flow = 43;
      liquidity = "Sell-side liquidity";
    }
  }

  if (market === "GBP/USD") {
    if (price > 1.29) {
      newSignal = "LONG";
      newConfidence = 72;
      setOrderFlowScore(78);
setLiquidityRead("Above Highs");
setSmartMoneyRead("{smartMoneyRead}");
      reasons = [
        "GBP strength confirmed",
        "Momentum above key level",
        "Buy-side continuation bias",
      ];
      flow = 60;
      liquidity = "Liquidity above range";
    } else if (price < 1.25) {
      newSignal = "SHORT";
      newConfidence = 69;
      setOrderFlowScore(28);
setLiquidityRead("Below Lows");
setSmartMoneyRead("Distribution");
      reasons = [
        "GBP weakness confirmed",
        "Price below key level",
        "Downside continuation risk",
      ];
      flow = 44;
      liquidity = "Liquidity below range";
    }
  }

  if (market === "XAU/USD") {
    if (price > 4500) {
      newSignal = "LONG";
      newConfidence = 77;
      setOrderFlowScore(78);
setLiquidityRead("Above Highs");
setSmartMoneyRead("Accumulation");
      reasons = [
        "Gold proxy showing bullish pressure",
        "Safe-haven demand bias",
        "Momentum above threshold",
      ];
      flow = 64;
      liquidity = "Upside liquidity pool";
    } else if (price < 4300) {
      newSignal = "SHORT";
      newConfidence = 74;
      setOrderFlowScore(28);
setLiquidityRead("Below Lows");
setSmartMoneyRead("Distribution");
      reasons = [
        "Gold proxy below bearish threshold",
        "Seller imbalance forming",
        "Potential liquidation sweep",
      ];
      flow = 40;
      liquidity = "Downside liquidity pool";
    }
  }

  setSignal(newSignal);
  setConfidence(newConfidence);
  setSignalReasons(reasons);
  setOrderFlowScore(flow);
  setLiquidityRead(liquidity);
}

  function selectMarket(symbol: string, market: string, priceText: string) {
    setChartSymbol(symbol);
    setSelectedMarket(market);
    setSelectedPrice(priceText);

    const numberPrice = Number(priceText.replace(/,/g, ""));
    if (!Number.isNaN(numberPrice)) {
      updateSignalForMarket(market, numberPrice);
    }
  }

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
        return;
      }

      setAuthLoading(false);
    }

    checkAuth();
  }, [router]);

  useEffect(() => {
    const streams =
      "btcusdt@ticker/ethusdt@ticker/eurusdt@ticker/gbpusdt@ticker/paxgusdt@ticker";

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/stream?streams=${streams}`
    );

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const symbol = message.data.s;
      const price = Number(message.data.c);

      if (symbol === "BTCUSDT") {
        const formatted = price.toLocaleString();
        setBtcPrice(formatted);

        if (selectedMarket === "BTC/USD") {
          setSelectedPrice(formatted);
          updateSignalForMarket("BTC/USD", price);
        }
      }

      if (symbol === "ETHUSDT") {
        const formatted = price.toLocaleString();
        setEthPrice(formatted);

        if (selectedMarket === "ETH/USD") {
          setSelectedPrice(formatted);
          updateSignalForMarket("ETH/USD", price);
        }
      }

      if (symbol === "EURUSDT") {
        const formatted = price.toFixed(5);
        setEurUsd(formatted);

        if (selectedMarket === "EUR/USD") {
          setSelectedPrice(formatted);
          updateSignalForMarket("EUR/USD", price);
        }
      }

      if (symbol === "GBPUSDT") {
        const formatted = price.toFixed(5);
        setGbpUsd(formatted);

        if (selectedMarket === "GBP/USD") {
          setSelectedPrice(formatted);
          updateSignalForMarket("GBP/USD", price);
        }
      }

      if (symbol === "PAXGUSDT") {
        const formatted = price.toLocaleString();
        setXauUsd(formatted);

        if (selectedMarket === "XAU/USD") {
          setSelectedPrice(formatted);
          updateSignalForMarket("XAU/USD", price);
        }
      }
    };

    return () => ws.close();
  }, [selectedMarket]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading HYBRID Terminal...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070711] text-white flex overflow-hidden relative">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(124,58,237,0.22),_transparent_35%)]" />
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(34,211,238,0.12),_transparent_30%)]" />
      <aside className="w-64 bg-[#0F172A] border-r border-slate-800 p-6">
        <h1 className="text-4xl font-bold tracking-tight">HYBRID</h1>

        <p className="text-cyan-400 mt-2 text-sm">AI Trading Terminal</p>

        <nav className="mt-12 space-y-4">
          <div className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-3 rounded-2xl">
            Dashboard
          </div>

          <div className="text-slate-400 px-4 py-3">Signals</div>
          <div className="text-slate-400 px-4 py-3">Bots</div>
          <div className="text-slate-400 px-4 py-3">Performance</div>
          <div className="text-slate-400 px-4 py-3">Journal</div>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="text-red-400 px-4 py-3 text-left mt-6 block"
          >
            Logout
          </button>
        </nav>
      </aside>

      <section className="flex-1 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold">
              Institutional AI Dashboard
            </h2>

            <p className="text-slate-400 mt-2">
              Smart money concepts • CVD divergence • Order flow
            </p>
          </div>

          <div className="bg-emerald-500/10 text-emerald-400 px-5 py-3 rounded-2xl border border-emerald-500/20">
            {selectedMarket} {signal} • {confidence}% Confidence
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6 mt-10">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="text-slate-400 text-sm">BTC/USD</div>
            <div className="text-4xl font-bold mt-4">${btcPrice}</div>
            <div className="text-emerald-400 mt-2">LIVE</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="text-slate-400 text-sm">ETH/USD</div>
            <div className="text-4xl font-bold mt-4">${ethPrice}</div>
            <div className="text-emerald-400 mt-2">LIVE</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="text-slate-400 text-sm">EUR/USD</div>
            <div className="text-4xl font-bold mt-4">{eurUsd}</div>
            <div className="text-yellow-400 mt-2">LIVE</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="text-slate-400 text-sm">XAU/USD</div>
            <div className="text-4xl font-bold mt-4">${xauUsd}</div>
            <div className="text-amber-400 mt-2">GOLD</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
  <div className="text-slate-400 text-sm">
    Signal Engine
  </div>

  <div className="text-xs text-slate-500 mt-1">
    {selectedMarket} • {selectedPrice}
  </div>

  <div
    className={`text-4xl font-bold mt-4 ${
      signal === "LONG"
        ? "text-emerald-400"
        : signal === "SHORT"
        ? "text-red-400"
        : "text-cyan-400"
    }`}
  >
    {signal}
  </div>

  <div className="text-slate-400 mt-2">
    Confidence: {confidence}%
  </div>

  <div className="mt-4 space-y-1 text-xs text-slate-400">
    {signalReasons.map((reason) => (
      <div key={reason}>
        ✓ {reason}
      </div>
    ))}
  </div>
</div>
        </div>

        <div className="mt-10 grid grid-cols-4 gap-6">
          <div className="col-span-3 relative z-10 rounded-3xl overflow-hidden border border-slate-800 h-[500px]">
            <iframe
            key={chartSymbol}
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${chartSymbol}&interval=60&theme=dark&style=1&toolbarbg=0A0F1C&hide_top_toolbar=false&saveimage=false&studies=%5B%22RSI%40tv-basicstudies%22%2C%22MACD%40tv-basicstudies%22%5D`}
            width="100%"
            height="100%"
            />
          </div>

          <div className="relative z-30 bg-slate-900 border border-slate-800 rounded-3xl p-5 h-[500px]">
            <h3 className="text-sm text-slate-400 mb-5">Watchlist</h3>

            <div className="space-y-4 text-sm">
              <button
                onClick={() =>
                  selectMarket("BINANCE:BTCUSDT", "BTC/USD", btcPrice)
                }
                className="relative z-40 flex justify-between w-full hover:text-cyan-400 cursor-pointer"
              >
                <span>BTC/USD</span>
                <span className="text-emerald-400">${btcPrice}</span>
              </button>

              <button
                onClick={() =>
                  selectMarket("BINANCE:ETHUSDT", "ETH/USD", ethPrice)
                }
                className="relative z-40 flex justify-between w-full hover:text-cyan-400 cursor-pointer"
              >
                <span>ETH/USD</span>
                <span className="text-emerald-400">${ethPrice}</span>
              </button>

              <button
                onClick={() =>
                  selectMarket("FX:EURUSD", "EUR/USD", eurUsd)
                }
                className="relative z-40 flex justify-between w-full hover:text-cyan-400 cursor-pointer"
              >
                <span>EUR/USD</span>
                <span className="text-yellow-400">{eurUsd}</span>
              </button>

              <button
                onClick={() =>
                  selectMarket("OANDA:XAUUSD", "XAU/USD", xauUsd)
                }
                className="relative z-40 flex justify-between w-full hover:text-cyan-400 cursor-pointer"
              >
                <span>XAU/USD</span>
                <span className="text-amber-400">${xauUsd}</span>
              </button>

              <button
                onClick={() =>
                  selectMarket("FX:GBPUSD", "GBP/USD", gbpUsd)
                }
                className="relative z-40 flex justify-between w-full hover:text-cyan-400 cursor-pointer"
              >
                <span>GBP/USD</span>
                <span className="text-emerald-400">{gbpUsd}</span>
              </button>

              <button
                onClick={() =>
                  selectMarket("NASDAQ:QQQ", "NASDAQ", "Chart")
                }
                className="relative z-40 flex justify-between w-full hover:text-cyan-400 cursor-pointer"
              >
                <span>NASDAQ</span>
                <span className="text-slate-500">Chart</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="text-slate-400 text-sm">CVD Bias</div>
            <div
  className={`text-3xl font-bold mt-3 ${
    signal === "LONG"
      ? "text-emerald-400"
      : signal === "SHORT"
      ? "text-red-400"
      : "text-cyan-400"
  }`}
>
              {signal === "LONG"
  ? "Bullish"
  : signal === "SHORT"
  ? "Bearish"
  : "Neutral"}
            </div>
            <div className="text-slate-400 mt-2 text-sm">
              Buyers absorbing sell pressure
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="text-slate-400 text-sm">Order Flow</div>
            <div className="text-3xl font-bold mt-3 text-cyan-400">{orderFlowScore}%</div>
            <div className="text-slate-400 mt-2 text-sm">
              Institutional buy pressure
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="text-slate-400 text-sm">Liquidity Zone</div>
            <div className="text-3xl font-bold mt-3 text-amber-400">
              {liquidityRead}
            </div>
            <div className="text-slate-400 mt-2 text-sm">
              Potential stop sweep area
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="text-slate-400 text-sm">Smart Money Read</div>
            <div className={`text-3xl font-bold mt-3 ${
  smartMoneyRead === "Accumulation"
    ? "text-emerald-400"
    : smartMoneyRead === "Distribution"
    ? "text-red-400"
    : "text-cyan-400"
}`}>
              Accumulation
            </div>
            <div className="text-slate-400 mt-2 text-sm">
              Bias aligned with long setups
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}