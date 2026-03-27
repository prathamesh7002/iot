import PageContainer from "../components/common/PageContainer";

function MainLayout({ children }) {
  return (
    <div className="app-shell bg-transparent text-slate-900">
      <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur">
        <PageContainer>
          <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700">
                IoT Machine Health Monitoring
              </p>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Operations Dashboard
              </h1>
            </div>
            <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm">
              Live telemetry, faults, and recent device activity
            </div>
          </div>
        </PageContainer>
      </header>

      <main className="py-8 sm:py-10">
        <PageContainer>{children}</PageContainer>
      </main>
    </div>
  );
}

export default MainLayout;
