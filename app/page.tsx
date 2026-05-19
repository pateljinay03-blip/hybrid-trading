export default function Home() {
  return (
    <main className="min-h-screen bg-[#070711] text-white overflow-hidden">
      <section className="relative min-h-screen flex items-center justify-center px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(124,58,237,0.25),_transparent_45%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-purple-950/40 to-transparent" />

        <nav className="absolute top-8 left-1/2 -translate-x-1/2 w-[85%] max-w-6xl flex items-center justify-between bg-black/40 border border-white/10 rounded-3xl px-8 py-5 backdrop-blur-xl">
          <div className="text-2xl font-bold tracking-tight">HYBRID</div>

          <div className="hidden md:flex gap-8 text-sm text-slate-300">
            <a href="#features">Features</a>
            <a href="#markets">Markets</a>
            <a href="/terminal">Terminal</a>
          </div>

          <div className="flex gap-3">
            <a href="/login" className="px-5 py-2 rounded-full bg-white/10 text-sm">
              Login
            </a>
            <a href="/terminal" className="px-5 py-2 rounded-full bg-purple-500 text-sm">
              Enter Terminal
            </a>
          </div>
        </nav>

        <div className="relative z-10 text-center max-w-4xl pt-20">
          <p className="text-purple-300 mb-6 tracking-[0.3em] text-xs uppercase">
            AI Crypto & Forex Intelligence
          </p>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-tight">
            Elevate Your
            <br />
            Trading Experience
          </h1>

          <p className="mt-8 text-slate-400 max-w-2xl mx-auto text-lg">
            Institutional-grade market intelligence powered by CVD divergence,
            smart money flow, and AI signal routing.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <a
              href="/terminal"
              className="px-8 py-4 rounded-full bg-white text-black font-semibold"
            >
              Launch Terminal
            </a>

            <a
              href="#markets"
              className="px-8 py-4 rounded-full border border-white/20 text-white"
            >
              View Markets
            </a>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6" id="markets">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
              <div className="text-slate-400 text-sm">BTC/USD</div>
              <div className="text-3xl font-bold mt-3">$78,279</div>
              <div className="text-emerald-400 mt-2">LONG • 79%</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
              <div className="text-slate-400 text-sm">EUR/USD</div>
              <div className="text-3xl font-bold mt-3">1.0842</div>
              <div className="text-yellow-400 mt-2">WAIT</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
              <div className="text-slate-400 text-sm">XAU/USD</div>
              <div className="text-3xl font-bold mt-3">$2,391</div>
              <div className="text-red-400 mt-2">SHORT • 72%</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-8 py-24 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center">
          Built for Serious Traders
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-xl font-semibold">CVD Divergence</h3>
            <p className="text-slate-400 mt-4">
              Detect hidden accumulation and distribution before price confirms.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-xl font-semibold">Institutional Orders</h3>
            <p className="text-slate-400 mt-4">
              Track high-impact order flow and smart money pressure.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h3 className="text-xl font-semibold">AI Signal Engine</h3>
            <p className="text-slate-400 mt-4">
              Combine market structure, volume, and volatility into actionable bias.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}