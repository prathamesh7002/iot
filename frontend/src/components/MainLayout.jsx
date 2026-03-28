import PageContainer from "../components/common/PageContainer";

function MainLayout({ children, isOnline = true, lastSync = "" }) {
  return (
    <div className="app-shell bg-[f8fafc] text-slate-900 flex flex-col min-h-screen">
      <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur">
        <PageContainer>
          <div className="flex items-center gap-3 py-5 justify-center sm:justify-start">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-cyan-700">
              <path fillRule="evenodd" d="M11.078 2.25c-.218.026-.407.172-.486.377l-.6 1.545c-.235.105-.461.226-.676.363l-1.527-.665a.64.64 0 00-.736.192l-2.004 2.45a.644.644 0 00-.056.744l.872 1.396c-.1.246-.183.501-.247.765L4.06 9.993a.64.64 0 00-.56.634v3.134c0 .324.24.597.56.634l1.554.585c.064.264.147.519.247.765l-.872 1.396a.64.64 0 00.056.744l2.004 2.45c.168.205.441.272.736.192l1.527-.665c.215.137.441.258.676.363l.6 1.545c.079.205.268.351.486.377h3.334c.218-.026.407-.172.486-.377l.6-1.545c.235-.105.461-.226.676-.363l1.527.665c.295.08.568.013.736-.192l2.004-2.45a.64.64 0 00.056-.744l-.872-1.396c.1-.246.183-.501.247-.765l1.554-.585a.64.64 0 00.56-.634v-3.134a.64.64 0 00-.56-.634l-1.554-.585a5.558 5.558 0 00-.247-.765l.872-1.396a.64.64 0 00-.056-.744l-2.004-2.45a.64.64 0 00-.736-.192l-1.527.665a5.558 5.558 0 00-.676-.363l-.6-1.545a.64.64 0 00-.486-.377h-3.334zm-.578 9.75a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0z" clipRule="evenodd" />
            </svg>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Machine Monitoring System
            </h1>
          </div>
        </PageContainer>
      </header>

      <main className="flex-1 py-8 sm:py-10">
        <PageContainer>{children}</PageContainer>
      </main>

      <footer className="mt-auto border-t border-slate-800 bg-[#0f172a] text-slate-400 py-6 text-sm shadow-[inset_0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-colors duration-500">
        <PageContainer>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1 text-center sm:text-left">
              <span className="font-bold text-slate-200 tracking-widest uppercase text-xs">Smart IoT Analytics</span>
              <span>© {new Date().getFullYear()} Developed by Chetan . All rights reserved.</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-xs font-semibold tracking-wider">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    {isOnline && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    System: 
                    <span className={`font-bold uppercase tracking-widest ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </span>
                </div>
                {lastSync && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800/50 border border-slate-700/50 text-[10px]">
                    <span className="text-slate-500">Last Sync:</span>
                    <span className="text-cyan-400 font-mono italic">{lastSync}</span>
                  </div>
                )}
              </div>
              
              <div className="hidden sm:block h-4 w-px bg-slate-700"></div>
              <div>
                Machine ID: <span className="text-slate-200 font-bold ml-1">PT-1042</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-slate-700"></div>
              <div>
                Firmware: <span className="text-cyan-400 font-bold ml-1">v3.0.1</span>
              </div>
            </div>
          </div>
        </PageContainer>
      </footer>
    </div>
  );
}

export default MainLayout;
