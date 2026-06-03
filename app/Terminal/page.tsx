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
  const [marketState, setMarketState] = useState("NEUTRAL");
  const [signalReasons, setSignalReasons] = useState<string[]>([
  "Waiting for market confirmation",
]);
const [orderFlowScore, setOrderFlowScore] = useState(50);
const [liquidityRead, setLiquidityRead] = useState("Neutral");

  const [authLoading, setAuthLoading] = useState(true);
  const [chartSymbol, setChartSymbol] = useState("BINANCE:BTCUSDT");
  const [selectedMarket, setSelectedMarket] = useState("BTC/USD");
  const [selectedPrice, setSelectedPrice] = useState("Loading..."); 
  const [entryZone, setEntryZone] = useState("-");
const [stopLoss, setStopLoss] = useState("-");
const [takeProfit, setTakeProfit] = useState("-");
const [riskReward, setRiskReward] = useState("-");
const [tradeReason, setTradeReason] = useState("");
const [smartMoneyRead, setSmartMoneyRead] = useState("{smartMoneyRead}");
const [priceHistory, setPriceHistory] = useState<number[]>([]);
const [signalHistory, setSignalHistory] = useState<
  { market: string; signal: string; confidence: number; time: string }[]
>([]);
  const router = useRouter();
const [signalGrade, setSignalGrade] = useState("NO TRADE");
const [scanner, setScanner] = useState([
  { market: "BTC/USD", signal: "WAIT", grade: "NO TRADE" },
  { market: "ETH/USD", signal: "WAIT", grade: "NO TRADE" },
  { market: "EUR/USD", signal: "WAIT", grade: "NO TRADE" },
  { market: "GBP/USD", signal: "WAIT", grade: "NO TRADE" },
  { market: "XAU/USD", signal: "WAIT", grade: "NO TRADE" },
]);


function addSignalToHistory(newSignal: string, newConfidence: number) {
  if (newSignal === "WAIT") return;

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  setSignalHistory((prev) => [
    {
      market: selectedMarket,
      signal: newSignal,
      confidence: newConfidence,
      time,
    },
    ...prev.slice(0, 5),
  ]);
}
function gradeSignal(signalType: string, signalConfidence: number) {
  let grade = "NO TRADE";

  if (signalType !== "WAIT") {
    if (signalConfidence >= 90) {
      grade = "A+ Setup";
    } else if (signalConfidence >= 80) {
      grade = "A Setup";
    } else if (signalConfidence >= 70) {
      grade = "B Setup";
    }
  }

  setSignalGrade(grade);
  updateScanner(selectedMarket, signalType, grade);
}
function updateScanner(market: string, newSignal: string, grade: string) {
  setScanner((prev) =>
    prev.map((item) =>
      item.market === market
        ? { ...item, signal: newSignal, grade }
        : item
    )
  );
}
  function updateSignalForMarket(market: string, price: number) {
  setPriceHistory((prev) => {
    const updated = [...prev, price].slice(-10);

    if (updated.length < 6) {
      setSignal("WAIT");
      setConfidence(50);
      setSignalReasons(["Collecting live tick data"]);
      setEntryZone("-");
      setStopLoss("-");
      setTakeProfit("-");
      setRiskReward("-");
      setTradeReason("Waiting for enough live market movement");
      setOrderFlowScore(50);
      setLiquidityRead("Neutral");
      setSmartMoneyRead("Neutral");
      return updated;
    }

    let upTicks = 0;
    let downTicks = 0;

    for (let i = 1; i < updated.length; i++) {
      if (updated[i] > updated[i - 1]) upTicks++;
      if (updated[i] < updated[i - 1]) downTicks++;
    }

    const first = updated[0];
    const last = updated[updated.length - 1];
    const movePercent = ((last - first) / first) * 100;

    const bullishPressure = upTicks >= 6 && movePercent > 0.005;
    const bearishPressure = downTicks >= 6 && movePercent < -0.005;

    if (bullishPressure) {
      const sl = price * 0.998;
      const tp = price * 1.004;

      setSignal("LONG");
      setConfidence(Math.min(95, 70 + upTicks * 3));
      addSignalToHistory("LONG", Math.min(95, 70 + upTicks * 3));
      const longConfidence = Math.min(95, 70 + upTicks * 3);
setConfidence(longConfidence);
gradeSignal("LONG", longConfidence);
      setSignalReasons([
        "Fast bullish tick pressure detected",
        "Recent price movement confirms upside momentum",
        "Scalper mode: buyers currently controlling micro-trend",
      ]);
      setOrderFlowScore(70 + upTicks * 3);
      setLiquidityRead("Buy-side momentum");
      setSmartMoneyRead("Accumulation");
      setMarketState("STRONG BULLISH");
      setEntryZone(`${price.toFixed(2)} - ${(price * 1.001).toFixed(2)}`);
      setStopLoss(sl.toFixed(2));
      setTakeProfit(tp.toFixed(2));
      setRiskReward("1 : 2.0");
      setTradeReason("Live tick momentum shows aggressive buying pressure");
    } else if (bearishPressure) {
      const sl = price * 1.002;
      const tp = price * 0.996;

      setSignal("SHORT");
      setConfidence(Math.min(95, 70 + downTicks * 3));
      addSignalToHistory("SHORT", Math.min(95, 70 + downTicks * 3));
      const shortConfidence = Math.min(95, 70 + downTicks * 3);
setConfidence(shortConfidence);
gradeSignal("SHORT", shortConfidence);
      setSignalReasons([
        "Fast bearish tick pressure detected",
        "Recent price movement confirms downside momentum",
        "Scalper mode: sellers currently controlling micro-trend",
      ]);
      setOrderFlowScore(100 - (70 + downTicks * 3));
      setLiquidityRead("Sell-side momentum");
      setSmartMoneyRead("Distribution");
      setMarketState("STRONG BEARISH");

      setEntryZone(`${(price * 0.999).toFixed(2)} - ${price.toFixed(2)}`);
      setStopLoss(sl.toFixed(2));
      setTakeProfit(tp.toFixed(2));
      setRiskReward("1 : 2.0");
      setTradeReason("Live tick momentum shows aggressive selling pressure");
        } else {
  if (signal === "LONG" || signal === "SHORT") {
    setSignal(signal);
    setConfidence(Math.max(confidence - 2, 55));
    setSignalReasons([
      "Momentum cooling but signal still active",
      "Waiting for confirmation or invalidation",
      "Scalper mode holding last valid setup",
    ]);
    return updated;
    }

  setSignal("WAIT");
  setConfidence(52);
  gradeSignal("WAIT", 52);
      setSignalReasons([
        "Mixed tick direction",
        "No clean scalping momentum",
        "Avoiding low-quality entry",
      ]);
      setOrderFlowScore(50);
      setLiquidityRead("Range Bound");
      setSmartMoneyRead("Neutral");
      setMarketState("NEUTRAL / CHOPPY");

      setEntryZone("-");
      setStopLoss("-");
      setTakeProfit("-");
      setRiskReward("-");
      setTradeReason("No clean scalper entry detected");
    }

    return updated;
  });

}

  function selectMarket(symbol: string, market: string, priceText: string) {
    setChartSymbol(symbol);
    setSelectedMarket(market);
    setSelectedPrice(priceText);
    setPriceHistory([]);

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
          <a
  href="#journal"
  className="block text-slate-400 px-4 py-3 hover:text-cyan-400"
>
  Journal
</a>

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
<div className="mt-4">
  <div className="flex justify-between text-xs text-slate-500 mb-1">
    <span>Signal Strength</span>
    <span>{confidence}%</span>
  </div>

  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
    <div
      className={`h-full ${
        signal === "LONG"
          ? "bg-emerald-400"
          : signal === "SHORT"
          ? "bg-red-400"
          : "bg-cyan-400"
      }`}
      style={{ width: `${confidence}%` }}
    />
  </div>

  <div className="text-xs text-slate-400 mt-2">
    Market State: <span className="text-white">{marketState}</span>
  </div>
  <div className="text-xs text-slate-400 mt-2">
  Grade: <span className="text-purple-400">{signalGrade}</span>
</div>
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
<div className="mt-6 bg-slate-900 border border-slate-800 rounded-3xl p-6">
  <div className="text-slate-400 text-sm">AI Trade Setup</div>

  <div className="mt-4 grid grid-cols-5 gap-6">
    <div>
      <div className="text-slate-500 text-xs">Entry Zone</div>
      <div className="text-white mt-1">{entryZone}</div>
    </div>

    <div>
      <div className="text-slate-500 text-xs">Stop Loss</div>
      <div className="text-red-400 mt-1">{stopLoss}</div>
    </div>

    <div>
      <div className="text-slate-500 text-xs">Take Profit</div>
      <div className="text-emerald-400 mt-1">{takeProfit}</div>
    </div>

    <div>
      <div className="text-slate-500 text-xs">Risk / Reward</div>
      <div className="text-cyan-400 mt-1">{riskReward}</div>
    </div>

    <div>
      <div className="text-slate-500 text-xs">Reason</div>
      <div className="text-purple-400 mt-1">{tradeReason}</div>
    </div>
  </div>
</div>
<div className="mt-6 grid grid-cols-2 gap-6">
  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
    <div className="text-slate-400 text-sm mb-4">Recent Signals</div>

    <div className="space-y-3 text-sm">
      {signalHistory.length === 0 ? (
        <div className="text-slate-500">No signals yet</div>
      ) : (
        signalHistory.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-slate-800 pb-2"
          >
            <span className="text-slate-400">{item.time}</span>
            <span>{item.market}</span>
            <span
              className={
                item.signal === "LONG" ? "text-emerald-400" : "text-red-400"
              }
            >
              {item.signal}
            </span>
            <span className="text-cyan-400">{item.confidence}%</span>
          </div>
        ))
      )}
    </div>
  </div>

  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
    <div className="text-slate-400 text-sm mb-4">Market Scanner</div>

    <div className="space-y-3 text-sm">
      {scanner.map((item) => (
        <button
          key={item.market}
          onClick={() => {
            if (item.market === "BTC/USD") selectMarket("BINANCE:BTCUSDT", "BTC/USD", btcPrice);
            if (item.market === "ETH/USD") selectMarket("BINANCE:ETHUSDT", "ETH/USD", ethPrice);
            if (item.market === "EUR/USD") selectMarket("FX:EURUSD", "EUR/USD", eurUsd);
            if (item.market === "GBP/USD") selectMarket("FX:GBPUSD", "GBP/USD", gbpUsd);
            if (item.market === "XAU/USD") selectMarket("OANDA:XAUUSD", "XAU/USD", xauUsd);
          }}
          className="flex items-center justify-between w-full border-b border-slate-800 pb-2 hover:text-cyan-400"
        >
          <span>{item.market}</span>
          <span
            className={
              item.signal === "LONG"
                ? "text-emerald-400"
                : item.signal === "SHORT"
                ? "text-red-400"
                : "text-slate-500"
            }
          >
            {item.signal}
          </span>
          <span className="text-purple-400">{item.grade}</span>
        </button>
      ))}
    </div>
  </div>
</div>
<div className="mt-6 grid grid-cols-3 gap-6">
  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
    <div className="text-slate-400 text-sm mb-4">Economic Calendar</div>
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span>US CPI</span>
        <span className="text-red-400">High Impact</span>
      </div>
      <div className="flex justify-between">
        <span>FOMC Minutes</span>
        <span className="text-red-400">High Impact</span>
      </div>
      <div className="flex justify-between">
        <span>UK GDP</span>
        <span className="text-yellow-400">Medium</span>
      </div>
    </div>
  </div>

  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
    <div className="text-slate-400 text-sm mb-4">Market News</div>
    <div className="space-y-3 text-sm text-slate-300">
      <div>Crypto volatility increases ahead of US data.</div>
      <div>Gold remains sensitive to dollar strength.</div>
      <div>Forex markets await central bank direction.</div>
    </div>
  </div>

  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
    <div className="text-slate-400 text-sm mb-4">Performance</div>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <div className="text-slate-500">Win Rate</div>
        <div className="text-emerald-400 text-2xl">68%</div>
      </div>
      <div>
        <div className="text-slate-500">Avg R:R</div>
        <div className="text-cyan-400 text-2xl">1:2.4</div>
      </div>
      <div>
        <div className="text-slate-500">Signals</div>
        <div className="text-white text-2xl">{signalHistory.length}</div>
      </div>
      <div>
        <div className="text-slate-500">Mode</div>
        <div className="text-purple-400 text-2xl">Scalp</div>
      </div>
    </div>
  </div>
</div>

<div
  id="journal"
  className="mt-6 bg-slate-900 border border-slate-800 rounded-3xl p-6"
>
  <div className="text-slate-400 text-sm mb-4">
    Trading Journal
  </div>
  

  <div className="space-y-3 text-sm">
    {signalHistory.length === 0 ? (
      <div className="text-slate-500">
        No trades logged yet. Signals will appear here after entries.
      </div>
    ) : (
      signalHistory.map((item, index) => (
        <div
          key={index}
          className="grid grid-cols-5 border-b border-slate-800 pb-2"
        >
          <span className="text-slate-400">{item.time}</span>
          <span>{item.market}</span>
          <span
            className={
              item.signal === "LONG" ? "text-emerald-400" : "text-red-400"
            }
          >
            {item.signal}
          </span>
          <span className="text-cyan-400">{item.confidence}%</span>
          <span className="text-purple-400">{signalGrade}</span>
        </div>
      ))
    )}
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

