import MainLayout from "../../components/MainLayout";
import api from "../../services/api";

function HomePage() {
  const apiBaseUrl = api.defaults.baseURL;

  return (
    <MainLayout>
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-[0_24px_80px_-40px_rgba(22,163,74,0.45)]">
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            Project initialized
          </span>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            JavaScript React frontend ready for development.
          </h2>
          <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            This starter includes Vite, React Router, Tailwind CSS, and a
            reusable API client so you can start building screens and backend
            integration immediately.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-950 p-8 text-slate-50 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)]">
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">
            API
          </p>
          <p className="mt-3 text-sm text-slate-300">Base URL</p>
          <code className="mt-2 block rounded-2xl bg-white/10 px-4 py-3 text-sm text-emerald-200">
            {apiBaseUrl}
          </code>
          <p className="mt-6 text-sm text-slate-300">Primary folders</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            <li>src/assets</li>
            <li>src/components</li>
            <li>src/context</li>
            <li>src/Pages</li>
            <li>src/Routes</li>
            <li>src/services</li>
          </ul>
        </div>
      </section>
    </MainLayout>
  );
}

export default HomePage;
