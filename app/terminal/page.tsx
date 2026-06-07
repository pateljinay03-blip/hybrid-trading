"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type MarketName = "BTC/USD" | "ETH/USD" | "EUR/USD" | "GBP/USD" | "XAU/USD" | "NASDAQ";
type SignalType = "LONG" | "SHORT" | "WAIT";

type ScannerItem = {
  market: MarketName;
  signal: SignalType;
  grade: string;
  confidence: number;
};

type SignalHistoryItem = {
  market: MarketName;
  signal: SignalType;
  confidence: number;
  grade: string;
  time: string;
};

type MarketResult = {
  signal: SignalType;
  confidence: number;
  grade: string;
  reasons: string[];
  orderFlow: number;
  liquidity: string;
  smartMoney: string;
  marketState: string;
  entryZone: string;
  stopLoss: string;
  takeProfit: string;
  riskReward: string;
  tradeReason: string;
};

const INITIAL_SCANNER: ScannerItem[] = [
  { market: "BTC/USD", signal: "WAIT", grade: "NO TRADE", confidence: 50 },
  { market: "ETH/USD", signal: "WAIT", grade: "NO TRADE", confidence: 50 },
  { market: "EUR/USD", signal: "WAIT", grade: "NO TRADE", confidence: 50 },
  { market: "GBP/USD", signal: "WAIT", grade: "NO TRADE", confidence: 50 },
  { market: "XAU/USD", signal: "WAIT", grade: "NO TRADE", confidence: 50 },
];

const MARKET_TO_CHART: Record<MarketName, string> = {
  "BTC/USD": "BINANCE:BTCUSDT",
  "ETH/USD": "BINANCE:ETHUSDT",
  "EUR/USD": "FX:EURUSD",
  "GBP/USD": "FX:GBPUSD",
  "XAU/USD": "OANDA:XAUUSD",
  NASDAQ: "NASDAQ:QQQ",
};

const MARKET_TO_BINANCE_SYMBOL: Record<string, MarketName> = {
  BTCUSDT: "BTC/USD",
  ETHUSDT: "ETH/USD",
  EURUSDT: "EUR/USD",
  GBPUSDT: "GBP/USD",
  PAXGUSDT: "XAU/USD",
};

const DEFAULT_RESULT: MarketResult = {
  signal: "WAIT",
  confidence: 52,
  grade: "NO TRADE",
  reasons: ["Mixed tick direction", "No clean scalping momentum", "Avoiding low-quality entry"],
  orderFlow: 50,
  liquidity: "Range Bound",
  smartMoney: "Neutral",
  marketState: "NEUTRAL / CHOPPY",
  entryZone: "-",
  stopLoss: "-",
  takeProfit: "-",
  riskReward: "-",
  tradeReason: "No clean scalper entry detected",
};

function gradeSignal(signal: SignalType, confidence: number) {
  if (signal === "WAIT") return "NO TRADE";
  if (confidence >= 90) return "A+ Setup";
  if (confidence >= 80) return "A Setup";
  if (confidence >= 70) return "B Setup";
  return "NO TRADE";
}

function formatPrice(market: MarketName, price: number) {
  if (market === "EUR/USD" || market === "GBP/USD") return price.toFixed(5);
  return price.toLocaleString(undefined, {
    maximumFractionDigits: market === "XAU/USD" ? 2 : 2,
  });
}

function numericPrice(priceText: string) {
  const parsed = Number(priceText.replace(/[$,]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function buildResultFromTicks(market: MarketName, price: number, history: number[]): MarketResult {
  if (history.length < 6) {
    return {
      ...DEFAULT_RESULT,
      confidence: 50,
      reasons: ["Collecting live tick data"],
      liquidity: "Neutral",
      tradeReason: "Waiting for enough live market movement",
    };
  }

  let upTicks = 0;
  let downTicks = 0;

  for (let i = 1; i < history.length; i++) {
    if (history[i] > history[i - 1]) upTicks++;
    if (history[i] < history[i - 1]) downTicks++;
  }

  const first = history[0];
  const last = history[history.length - 1];
  const movePercent = ((last - first) / first) * 100;

  const bullishPressure = upTicks >= 4 && movePercent > 0.001;
  const bearishPressure = downTicks >= 4 && movePercent < -0.001;

  const decimals = market === "EUR/USD" || market === "GBP/USD" ? 5 : 2;

  if (bullishPressure) {
    const confidence = Math.min(95, 70 + upTicks * 3);
    const sl = price * 0.998;
    const tp = price * 1.004;

    return {
      signal: "LONG",
      confidence,
      grade: gradeSignal("LONG", confidence),
      reasons: [
        "Fast bullish tick pressure detected",
        "Recent price movement confirms upside momentum",
        "Scalper mode: buyers controlling micro-trend",
      ],
      orderFlow: Math.min(95, 70 + upTicks * 3),
      liquidity: "Buy-side momentum",
      smartMoney: "Accumulation",
      marketState: "STRONG BULLISH",
      entryZone: `${price.toFixed(decimals)} - ${(price * 1.001).toFixed(decimals)}`,
      stopLoss: sl.toFixed(decimals),
      takeProfit: tp.toFixed(decimals),
      riskReward: "1 : 2.0",
      tradeReason: "Live tick momentum shows aggressive buying pressure",
    };
  }

  if (bearishPressure) {
    const confidence = Math.min(95, 70 + downTicks * 3);
    const sl = price * 1.002;
    const tp = price * 0.996;

    return {
      signal: "SHORT",
      confidence,
      grade: gradeSignal("SHORT", confidence),
      reasons: [
        "Fast bearish tick pressure detected",
        "Recent price movement confirms downside momentum",
        "Scalper mode: sellers controlling micro-trend",
      ],
      orderFlow: Math.max(5, 100 - confidence),
      liquidity: "Sell-side momentum",
      smartMoney: "Distribution",
      marketState: "STRONG BEARISH",
      entryZone: `${(price * 0.999).toFixed(decimals)} - ${price.toFixed(decimals)}`,
      stopLoss: sl.toFixed(decimals),
      takeProfit: tp.toFixed(decimals),
      riskReward: "1 : 2.0",
      tradeReason: "Live tick momentum shows aggressive selling pressure",
    };
  }

  return DEFAULT_RESULT;
}

export default function TerminalPage() {
  const [btcPrice, setBtcPrice] = useState("Loading...");
  const [ethPrice, setEthPrice] = useState("Loading...");
  const [eurUsd, setEurUsd] = useState("Loading...");
  const [xauUsd, setXauUsd] = useState("Loading...");
  const [gbpUsd, setGbpUsd] = useState("1.3450");

  const [signal, setSignal] = useState<SignalType>("WAIT");
  const [confidence, setConfidence] = useState(50);
  const [marketState, setMarketState] = useState("NEUTRAL");
  const [signalReasons, setSignalReasons] = useState<string[]>(["Waiting for market confirmation"]);
  const [signalGrade, setSignalGrade] = useState("NO TRADE");

  const [orderFlowScore, setOrderFlowScore] = useState(50);
  const [liquidityRead, setLiquidityRead] = useState("Neutral");
  const [smartMoneyRead, setSmartMoneyRead] = useState("Neutral");

  const [entryZone, setEntryZone] = useState("-");
  const [stopLoss, setStopLoss] = useState("-");
  const [takeProfit, setTakeProfit] = useState("-");
  const [riskReward, setRiskReward] = useState("-");
  const [tradeReason, setTradeReason] = useState("");

  const [authLoading, setAuthLoading] = useState(true);
  const [chartSymbol, setChartSymbol] = useState("BINANCE:BTCUSDT");
  const [selectedMarket, setSelectedMarket] = useState<MarketName>("BTC/USD");
  const [selectedPrice, setSelectedPrice] = useState("Loading...");

  const [priceHistories, setPriceHistories] = useState<Record<string, number[]>>({});
  const [signalHistory, setSignalHistory] = useState<SignalHistoryItem[]>([]);
  const [scanner, setScanner] = useState<ScannerItem[]>(INITIAL_SCANNER);

  const router = useRouter();

  function applyResultToMainPanel(market: MarketName, priceText: string, result: MarketResult) {
    setSelectedMarket(market);
    setSelectedPrice(priceText);
    setSignal(result.signal);
    setConfidence(result.confidence);
    setSignalGrade(result.grade);
    setSignalReasons(result.reasons);
    setOrderFlowScore(result.orderFlow);
    setLiquidityRead(result.liquidity);
    setSmartMoneyRead(result.smartMoney);
    setMarketState(result.marketState);
    setEntryZone(result.entryZone);
    setStopLoss(result.stopLoss);
    setTakeProfit(result.takeProfit);
    setRiskReward(result.riskReward);
    setTradeReason(result.tradeReason);
  }

  function updateScanner(market: MarketName, result: MarketResult) {
    setScanner((prev) =>
      prev.map((item) =>
        item.market === market
          ? { ...item, signal: result.signal, grade: result.grade, confidence: result.confidence }
          : item
      )
    );
  }

  function addSignalToHistory(market: MarketName, result: MarketResult) {
    if (result.signal === "WAIT") return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setSignalHistory((prev) => {
      const latest = prev[0];
      if (
        latest &&
        latest.market === market &&
        latest.signal === result.signal &&
        latest.confidence === result.confidence
      ) {
        return prev;
      }

      return [
        {
          market,
          signal: result.signal,
          confidence: result.confidence,
          grade: result.grade,
          time,
        },
        ...prev.slice(0, 9),
      ];
    });
  }

  function processMarketTick(market: MarketName, price: number, showOnMainPanel = market === selectedMarket) {
    const priceText = formatPrice(market, price);

    if (market === "BTC/USD") setBtcPrice(priceText);
    if (market === "ETH/USD") setEthPrice(priceText);
    if (market === "EUR/USD") setEurUsd(priceText);
    if (market === "GBP/USD") setGbpUsd(priceText);
    if (market === "XAU/USD") setXauUsd(priceText);

    setPriceHistories((prev) => {
      const nextHistory = [...(prev[market] || []), price].slice(-10);
      const result = buildResultFromTicks(market, price, nextHistory);

      updateScanner(market, result);

      if (showOnMainPanel) {
        if (result.signal === "WAIT" && (signal === "LONG" || signal === "SHORT")) {
          const heldResult: MarketResult = {
            ...result,
            signal,
            confidence: Math.max(confidence - 2, 55),
            grade: gradeSignal(signal, Math.max(confidence - 2, 55)),
            reasons: [
              "Momentum cooling but signal still active",
              "Waiting for confirmation or invalidation",
              "Scalper mode holding last valid setup",
            ],
            marketState,
            smartMoney: smartMoneyRead,
            liquidity: liquidityRead,
            orderFlow: orderFlowScore,
            entryZone,
            stopLoss,
            takeProfit,
            riskReward,
            tradeReason,
          };
          applyResultToMainPanel(market, priceText, heldResult);
        } else {
          applyResultToMainPanel(market, priceText, result);
          addSignalToHistory(market, result);
        }
      } else {
        addSignalToHistory(market, result);
      }

      return { ...prev, [market]: nextHistory };
    });
  }

  function selectMarket(symbol: string, market: MarketName, priceText: string) {
    setChartSymbol(symbol);
    setSelectedMarket(market);
    setSelectedPrice(priceText);

    const price = numericPrice(priceText);
    if (price !== null) {
      const history = priceHistories[market] || [price];
      const result = buildResultFromTicks(market, price, history);
      applyResultToMainPanel(market, priceText, result);
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
      const market = MARKET_TO_BINANCE_SYMBOL[symbol];

      if (market && Number.isFinite(price)) {
        processMarketTick(market, price, market === selectedMarket);
      }
    };

    return () => ws.close();
  }, [
    selectedMarket,
    signal,
    confidence,
    marketState,
    smartMoneyRead,
    liquidityRead,
    orderFlowScore,
    entryZone,
    stopLoss,
    takeProfit,
    riskReward,
    tradeReason,
  ]);

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

      <aside className="relative z-20 hidden lg:block w-64 shrink-0 bg-[#0F172A]/90 border-r border-slate-800 p-6">
        <h1 className="text-4xl font-bold tracking-tight">HYBRID</h1>
        <p className="text-cyan-400 mt-2 text-sm">AI Trading Terminal</p>

        <nav className="mt-12 space-y-4">
          <a href="#dashboard" className="block bg-cyan-500/10 border border-cyan-500/20 px-4 py-3 rounded-2xl">
            Dashboard
          </a>
          <a href="#signals" className="block text-slate-400 px-4 py-3 hover:text-cyan-400">
            Signals
          </a>
          <a href="#scanner" className="block text-slate-400 px-4 py-3 hover:text-cyan-400">
            Scanner
          </a>
          <a href="#performance" className="block text-slate-400 px-4 py-3 hover:text-cyan-400">
            Performance
          </a>
          <a href="#journal" className="block text-slate-400 px-4 py-3 hover:text-cyan-400">
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

      <section id="dashboard" className="relative z-10 flex-1 p-4 lg:p-8 overflow-auto">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Institutional AI Dashboard</h2>
            <p className="text-slate-400 mt-2">
              Smart money concepts • Scalper momentum • Live market scanner
            </p>
          </div>

          <div className="bg-emerald-500/10 text-emerald-400 px-5 py-3 rounded-2xl border border-emerald-500/20">
            {selectedMarket} {signal} • {confidence}% Confidence
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mt-10">
          <MarketCard title="BTC/USD" price={`$${btcPrice}`} label="LIVE" />
          <MarketCard title="ETH/USD" price={`$${ethPrice}`} label="LIVE" />
          <MarketCard title="EUR/USD" price={eurUsd} label="LIVE" accent="text-yellow-400" />
          <MarketCard title="XAU/USD" price={`$${xauUsd}`} label="GOLD" accent="text-amber-400" />

          <div id="signals" className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="text-slate-400 text-sm">Signal Engine</div>
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

            <div className="text-slate-400 mt-2">Confidence: {confidence}%</div>

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

              <div className="mt-3">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs">
                  {signalGrade}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-1 text-xs text-slate-400">
              {signalReasons.map((reason) => (
                <div key={reason}>✓ {reason}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 relative z-10 rounded-3xl overflow-hidden border border-slate-800 h-[500px]">
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
              <WatchlistButton label="BTC/USD" value={`$${btcPrice}`} onClick={() => selectMarket(MARKET_TO_CHART["BTC/USD"], "BTC/USD", btcPrice)} />
              <WatchlistButton label="ETH/USD" value={`$${ethPrice}`} onClick={() => selectMarket(MARKET_TO_CHART["ETH/USD"], "ETH/USD", ethPrice)} />
              <WatchlistButton label="EUR/USD" value={eurUsd} valueClass="text-yellow-400" onClick={() => selectMarket(MARKET_TO_CHART["EUR/USD"], "EUR/USD", eurUsd)} />
              <WatchlistButton label="XAU/USD" value={`$${xauUsd}`} valueClass="text-amber-400" onClick={() => selectMarket(MARKET_TO_CHART["XAU/USD"], "XAU/USD", xauUsd)} />
              <WatchlistButton label="GBP/USD" value={gbpUsd} onClick={() => selectMarket(MARKET_TO_CHART["GBP/USD"], "GBP/USD", gbpUsd)} />
              <WatchlistButton label="NASDAQ" value="Chart" valueClass="text-slate-500" onClick={() => selectMarket(MARKET_TO_CHART.NASDAQ, "NASDAQ", "Chart")} />
            </div>
          </div>
        </div>

        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="text-slate-400 text-sm">AI Trade Setup</div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-6">
            <InfoItem label="Entry Zone" value={entryZone} />
            <InfoItem label="Stop Loss" value={stopLoss} valueClass="text-red-400" />
            <InfoItem label="Take Profit" value={takeProfit} valueClass="text-emerald-400" />
            <InfoItem label="Risk / Reward" value={riskReward} valueClass="text-cyan-400" />
            <InfoItem label="Reason" value={tradeReason} valueClass="text-purple-400" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="text-slate-400 text-sm mb-4">Recent Signals</div>

            <div className="space-y-3 text-sm">
              {signalHistory.length === 0 ? (
                <div className="text-slate-500">No signals yet</div>
              ) : (
                signalHistory.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 border-b border-slate-800 pb-2">
                    <span className="text-slate-400">{item.time}</span>
                    <span>{item.market}</span>
                    <span className={item.signal === "LONG" ? "text-emerald-400" : "text-red-400"}>
                      {item.signal}
                    </span>
                    <span className="text-purple-400">{item.grade}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div id="scanner" className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="text-slate-400 text-sm mb-4">Market Scanner</div>

            <div className="space-y-3 text-sm">
              {scanner.map((item) => (
                <button
                  key={item.market}
                  onClick={() => {
                    const market = item.market;
                    const currentPrice =
                      market === "BTC/USD"
                        ? btcPrice
                        : market === "ETH/USD"
                        ? ethPrice
                        : market === "EUR/USD"
                        ? eurUsd
                        : market === "GBP/USD"
                        ? gbpUsd
                        : market === "XAU/USD"
                        ? xauUsd
                        : "Chart";

                    selectMarket(MARKET_TO_CHART[market], market, currentPrice);
                  }}
                  className="grid grid-cols-4 w-full border-b border-slate-800 pb-2 hover:text-cyan-400 text-left"
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
                  <span className="text-cyan-400 text-right">{item.confidence}%</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Panel title="Economic Calendar">
            <CalendarRow event="US CPI" impact="High Impact" color="text-red-400" />
            <CalendarRow event="FOMC Minutes" impact="High Impact" color="text-red-400" />
            <CalendarRow event="UK GDP" impact="Medium" color="text-yellow-400" />
          </Panel>

          <Panel title="Market News">
            <div>Crypto volatility increases ahead of US data.</div>
            <div>Gold remains sensitive to dollar strength.</div>
            <div>Forex markets await central bank direction.</div>
          </Panel>

          <div id="performance" className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="text-slate-400 text-sm mb-4">Performance</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoMetric label="Win Rate" value="68%" valueClass="text-emerald-400" />
              <InfoMetric label="Avg R:R" value="1:2.4" valueClass="text-cyan-400" />
              <InfoMetric label="Signals" value={String(signalHistory.length)} />
              <InfoMetric label="Mode" value="Scalp" valueClass="text-purple-400" />
            </div>
          </div>
        </div>

        <div id="journal" className="mt-6 bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="text-slate-400 text-sm mb-4">Trading Journal</div>

          <div className="space-y-3 text-sm">
            {signalHistory.length === 0 ? (
              <div className="text-slate-500">
                No trades logged yet. Signals will appear here after entries.
              </div>
            ) : (
              signalHistory.map((item, index) => (
                <div key={index} className="grid grid-cols-5 border-b border-slate-800 pb-2">
                  <span className="text-slate-400">{item.time}</span>
                  <span>{item.market}</span>
                  <span className={item.signal === "LONG" ? "text-emerald-400" : "text-red-400"}>
                    {item.signal}
                  </span>
                  <span className="text-cyan-400">{item.confidence}%</span>
                  <span className="text-purple-400">{item.grade}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-4 gap-6">
          <FlowCard title="CVD Bias" value={signal === "LONG" ? "Bullish" : signal === "SHORT" ? "Bearish" : "Neutral"} tone={signal} subtitle="Buyers absorbing sell pressure" />
          <FlowCard title="Order Flow" value={`${orderFlowScore}%`} valueClass="text-cyan-400" subtitle="Institutional pressure proxy" />
          <FlowCard title="Liquidity Zone" value={liquidityRead} valueClass="text-amber-400" subtitle="Potential stop sweep area" />
          <FlowCard title="Smart Money Read" value={smartMoneyRead} valueClass={smartMoneyRead === "Accumulation" ? "text-emerald-400" : smartMoneyRead === "Distribution" ? "text-red-400" : "text-cyan-400"} subtitle="Current institutional read" />
        </div>
      </section>
    </main>
  );
}

function MarketCard({
  title,
  price,
  label,
  accent = "text-emerald-400",
}: {
  title: string;
  price: string;
  label: string;
  accent?: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
      <div className="text-slate-400 text-sm">{title}</div>
      <div className="text-4xl font-bold mt-4">{price}</div>
      <div className={`${accent} mt-2`}>{label}</div>
    </div>
  );
}

function WatchlistButton({
  label,
  value,
  onClick,
  valueClass = "text-emerald-400",
}: {
  label: string;
  value: string;
  onClick: () => void;
  valueClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="relative z-40 flex justify-between w-full hover:text-cyan-400 cursor-pointer"
    >
      <span>{label}</span>
      <span className={valueClass}>{value}</span>
    </button>
  );
}

function InfoItem({
  label,
  value,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <div className="text-slate-500 text-xs">{label}</div>
      <div className={`${valueClass} mt-1`}>{value}</div>
    </div>
  );
}

function InfoMetric({
  label,
  value,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <div className="text-slate-500">{label}</div>
      <div className={`${valueClass} text-2xl`}>{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
      <div className="text-slate-400 text-sm mb-4">{title}</div>
      <div className="space-y-3 text-sm text-slate-300">{children}</div>
    </div>
  );
}

function CalendarRow({
  event,
  impact,
  color,
}: {
  event: string;
  impact: string;
  color: string;
}) {
  return (
    <div className="flex justify-between">
      <span>{event}</span>
      <span className={color}>{impact}</span>
    </div>
  );
}

function FlowCard({
  title,
  value,
  subtitle,
  tone,
  valueClass,
}: {
  title: string;
  value: string;
  subtitle: string;
  tone?: SignalType;
  valueClass?: string;
}) {
  const computedClass =
    valueClass ||
    (tone === "LONG" ? "text-emerald-400" : tone === "SHORT" ? "text-red-400" : "text-cyan-400");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
      <div className="text-slate-400 text-sm">{title}</div>
      <div className={`text-3xl font-bold mt-3 ${computedClass}`}>{value}</div>
      <div className="text-slate-400 mt-2 text-sm">{subtitle}</div>
    </div>
  );
}
