import { useEffect, useState } from "react";
import MainLayout from "../../components/MainLayout";
import api from "../../services/api";

const POLL_INTERVAL_MS = 5000;

const initialDashboardState = {
  health: null,
  latest: null,
  history: [],
  status: null,
  alerts: [],
};

function HomePage() {
  const [dashboard, setDashboard] = useState(initialDashboardState);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let active = true;

    const loadDashboard = async ({ background = false } = {}) => {
      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const [health, latest, history, status, alerts] = await Promise.all([
          api.get("/api/v1/health"),
          api.get("/api/v1/telemetry/latest").catch((requestError) => {
            if (requestError.response?.status === 404) {
              return { data: null };
            }
            throw requestError;
          }),
          api.get("/api/v1/telemetry/history", { params: { limit: 8 } }),
          api.get("/api/v1/machine/status"),
          api.get("/api/v1/alerts", { params: { limit: 5 } }),
        ]);

        if (!active) {
          return;
        }

        setDashboard({
          health: health.data,
          latest: latest.data,
          history: history.data.items ?? [],
          status: status.data,
          alerts: alerts.data.items ?? [],
        });
        setError("");
        setLastUpdated(new Date());
      } catch (requestError) {
        if (!active) {
          return;
        }
        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Unable to load dashboard data.",
        );
      } finally {
        if (!active) {
          return;
        }
        setLoading(false);
        setRefreshing(false);
      }
    };

    loadDashboard();

    const intervalId = window.setInterval(() => {
      loadDashboard({ background: true });
    }, POLL_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const apiBaseUrl = api.defaults.baseURL;
  const latest = dashboard.latest;
  const machineStatus = dashboard.status;
  const statusTone =
    machineStatus?.machine_state === "fault"
      ? "bg-rose-500/15 text-rose-100 border-rose-400/30"
      : "bg-emerald-500/15 text-emerald-100 border-emerald-400/30";

  return (
    <MainLayout>
      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="panel-glow overflow-hidden rounded-[2rem] border border-cyan-200/60 bg-[linear-gradient(135deg,#082f49_0%,#0f172a_55%,#111827_100%)] p-8 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">
                Plant overview
              </div>
              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                Machine health at a glance.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Monitor live telemetry from the device, inspect recent readings,
                and spot fault conditions before they turn into downtime.
              </p>
            </div>

            <div className="min-w-[260px] rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                Backend link
              </p>
              <code className="mt-3 block rounded-2xl bg-slate-950/40 px-4 py-3 text-xs text-cyan-200 sm:text-sm">
                {apiBaseUrl}
              </code>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-300">Refresh cycle</span>
                <span className="font-semibold text-white">5 seconds</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-300">Last updated</span>
                <span className="font-semibold text-white">
                  {formatLastUpdated(lastUpdated)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <HeroMetric
              label="System health"
              value={dashboard.health?.status ?? "loading"}
              tone={dashboard.health?.status === "ok" ? "cyan" : "slate"}
              detail={dashboard.health?.message ?? "Checking backend connectivity"}
            />
            <HeroMetric
              label="Machine state"
              value={machineStatus?.machine_state ?? "unknown"}
              tone={machineStatus?.machine_state === "fault" ? "rose" : "emerald"}
              detail={
                machineStatus?.faults?.length
                  ? `Active faults: ${machineStatus.faults.join(", ")}`
                  : "No active fault flags"
              }
            />
            <HeroMetric
              label="Alerts"
              value={String(dashboard.alerts.length)}
              tone={dashboard.alerts.length ? "amber" : "emerald"}
              detail={
                dashboard.alerts.length
                  ? "Recent fault events detected"
                  : "No recent alert events"
              }
            />
            <HeroMetric
              label="Latest reading"
              value={latest ? formatTimestamp(latest.timestamp) : "No data"}
              tone="slate"
              detail="Newest telemetry stored in SQLite"
            />
          </div>
        </div>

        <div className="panel-glow rounded-[2rem] border border-slate-200 bg-white/80 p-6 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Current state
              </p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                {machineStatus?.machine_state === "fault"
                  ? "Immediate attention needed"
                  : "System operating normally"}
              </h3>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] ${statusTone}`}
            >
              {machineStatus?.machine_state ?? "unknown"}
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            <StatusFlag
              label="Temperature fault"
              value={machineStatus?.temperature_fault}
            />
            <StatusFlag
              label="Current fault"
              value={machineStatus?.current_fault}
            />
            <StatusFlag
              label="Vibration fault"
              value={machineStatus?.vibration_fault}
            />
            <div className="rounded-3xl bg-slate-900 px-4 py-4 text-sm text-slate-200">
              <div className="flex items-center justify-between">
                <span>Relay expected</span>
                <span className="font-semibold text-white">
                  {machineStatus?.relay_expected ?? "off"}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span>Buzzer expected</span>
                <span className="font-semibold text-white">
                  {machineStatus?.buzzer_expected ?? "off"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <SensorCard
          title="Temperature"
          value={latest ? `${latest.temperature.toFixed(1)} °C` : "--"}
          helper="Threshold: > 50 °C"
          fault={latest?.temperature_fault}
          accent="from-cyan-500/20 to-cyan-100"
        />
        <SensorCard
          title="Current"
          value={latest ? `${latest.current} mA` : "--"}
          helper="Threshold: > 600 mA"
          fault={latest?.current_fault}
          accent="from-amber-500/20 to-amber-100"
        />
        <SensorCard
          title="Vibration"
          value={latest ? String(latest.vibration) : "--"}
          helper="Fault when value equals 1"
          fault={latest?.vibration_fault}
          accent="from-rose-500/20 to-rose-100"
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="panel-glow rounded-[2rem] border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Recent telemetry
              </p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                Latest readings history
              </h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">
              {dashboard.history.length} rows
            </span>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
            <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] bg-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              <span>Time</span>
              <span>Temp</span>
              <span>Current</span>
              <span>Vibration</span>
              <span>Status</span>
            </div>
            <div className="divide-y divide-slate-100 bg-white">
              {dashboard.history.length ? (
                dashboard.history.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] items-center px-4 py-3 text-sm text-slate-700"
                  >
                    <span>{formatTimestamp(item.timestamp)}</span>
                    <span>{item.temperature.toFixed(1)} °C</span>
                    <span>{item.current} mA</span>
                    <span>{item.vibration}</span>
                    <span>
                      <StatusPill status={item.status} />
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-sm text-slate-500">
                  No telemetry available yet. Send data from the device to
                  populate the dashboard.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="panel-glow rounded-[2rem] border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Alerts
              </p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                Fault event stream
              </h3>
            </div>
            <div className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-rose-600">
              {dashboard.alerts.length || 0} active
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {dashboard.alerts.length ? (
              dashboard.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-[1.5rem] border border-rose-100 bg-rose-50/70 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {alert.message}
                    </p>
                    <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {formatTimestamp(alert.timestamp)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-800">
                No alerts recorded. The machine is currently reporting healthy
                operating conditions.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white/80 px-5 py-4 text-sm text-slate-600 backdrop-blur-sm">
          {error ? (
            <span className="font-medium text-rose-600">{error}</span>
          ) : loading ? (
            <span>Loading dashboard data from the backend...</span>
          ) : refreshing ? (
            <span>Refreshing live telemetry...</span>
          ) : (
            <span>Dashboard connected and polling successfully.</span>
          )}
        </div>
        <MetricChip label="Backend" value={dashboard.health?.status ?? "unknown"} />
        <MetricChip
          label="Fault flags"
          value={machineStatus?.faults?.length ? machineStatus.faults.join(", ") : "none"}
        />
      </section>
    </MainLayout>
  );
}

function HeroMetric({ label, value, detail, tone }) {
  const tones = {
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
    rose: "border-rose-400/20 bg-rose-400/10 text-rose-100",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-100",
    slate: "border-white/10 bg-white/5 text-white",
  };

  return (
    <div className={`rounded-[1.5rem] border p-4 ${tones[tone] ?? tones.slate}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.25em]">{label}</p>
      <p className="mt-3 text-2xl font-black capitalize">{value}</p>
      <p className="mt-2 text-sm text-white/75">{detail}</p>
    </div>
  );
}

function SensorCard({ title, value, helper, fault, accent }) {
  return (
    <div
      className={`panel-glow rounded-[2rem] border border-slate-200 bg-gradient-to-br ${accent} p-6`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Sensor
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {title}
          </h3>
        </div>
        <StatusPill status={fault ? "fault" : "normal"} />
      </div>
      <p className="mt-8 text-4xl font-black text-slate-950">{value}</p>
      <p className="mt-3 text-sm text-slate-600">{helper}</p>
    </div>
  );
}

function StatusFlag({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${
          value
            ? "bg-rose-500 text-white"
            : "bg-emerald-500 text-white"
        }`}
      >
        {value ? "active" : "clear"}
      </span>
    </div>
  );
}

function StatusPill({ status }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${
        status === "fault"
          ? "bg-rose-500 text-white"
          : "bg-emerald-500 text-white"
      }`}
    >
      {status}
    </span>
  );
}

function MetricChip({ label, value }) {
  return (
    <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600 backdrop-blur-sm">
      <span className="font-semibold text-slate-900">{label}:</span> {value}
    </div>
  );
}

function formatTimestamp(value) {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatLastUpdated(value) {
  if (!value) {
    return "Waiting";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);
}

export default HomePage;
