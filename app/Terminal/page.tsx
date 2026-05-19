export default function TerminalPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1C] text-white flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] border-r border-slate-800 p-6">
        <h1 className="text-4xl font-bold tracking-tight">
          HYBRID
        </h1>

        <p className="text-cyan-400 mt-2 text-sm">
          AI Trading Terminal
        </p>

        <nav className="mt-12 space-y-4">
          <div className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-3 rounded-2xl">
            Dashboard
          </div>

          <div className="text-slate-400 px-4 py-3">
            Signals
          </div>

          <div className="text-slate-400 px-4 py-3">
            Bots
          </div>

          <div className="text-slate-400 px-4 py-3">
            Performance
          </div>

          <div className="text-slate-400 px-4 py-3">
            Journal
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <section className="flex-1 p-8">

        {/* Top Bar */}
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
            BTC LONG • 79% Confidence
          </div>
        </div>

        {/* Market Cards */}
        <div className="grid grid-cols-3 gap-6 mt-10">

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="text-slate-400 text-sm">
              BTC/USD
            </div>

            <div className="text-4xl font-bold mt-4">
              78,279.86
            </div>

            <div className="text-emerald-400 mt-2">
              +0.50%
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="text-slate-400 text-sm">
              ETH/USD
            </div>

            <div className="text-4xl font-bold mt-4">
              2,191.40
            </div>

            <div className="text-emerald-400 mt-2">
              +0.74%
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="text-slate-400 text-sm">
              Signal Engine
            </div>

            <div className="text-4xl font-bold mt-4 text-cyan-400">
              LONG
            </div>

            <div className="text-slate-400 mt-2">
              Institutional order flow aligned
            </div>
          </div>

        </div>

        {/* Chart Area */}
        <div className="mt-10 rounded-3xl overflow-hidden border border-slate-800 h-[500px]">
  <iframe
    src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=BINANCE:BTCUSDT&interval=60&theme=dark&style=1&toolbarbg=0A0F1C&hide_top_toolbar=false&saveimage=false&studies=%5B%22RSI%40tv-basicstudies%22%2C%22MACD%40tv-basicstudies%22%5D"
    width="100%"
    height="100%"
    allowTransparency={true}
  />
</div>

      </section>
    </main>
  );
}