import PageContainer from "../components/common/PageContainer";

function MainLayout({ children }) {
  return (
    <div className="app-shell bg-transparent text-slate-900">
      <header className="border-b border-emerald-100/80 bg-white/70 backdrop-blur">
        <PageContainer>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
                React + Tailwind
              </p>
              <h1 className="text-xl font-bold text-slate-900">
                Frontend Starter
              </h1>
            </div>
          </div>
        </PageContainer>
      </header>

      <main className="py-10">
        <PageContainer>{children}</PageContainer>
      </main>
    </div>
  );
}

export default MainLayout;
