import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import MainLayout from "../../components/MainLayout";
import api from "../../services/api";

const POLL_INTERVAL_MS = 2000;

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
  const [modalDismissed, setModalDismissed] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState("");
  const navigate = useNavigate();

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
          api.get("/api/v1/telemetry/history", { params: { limit: 20 } }),
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
        
        // Auto-reset modal dismissal if system is normal
        if (status.data?.machine_state !== "fault") {
          setModalDismissed(false);
        }

        setError("");
        setLastUpdated(new Date());
        setIsOnline(true);
        setLastSync(new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (requestError) {
        if (!active) {
          return;
        }
        console.error("Dashboard poll failed:", requestError);
        setIsOnline(false);
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


  // Calculate how long since the last data point arrived
  const heartbeatStale = !latest || (new Date() - new Date(latest.timestamp)) > 20000;
  
  // CRITICAL: Aggressive modal trigger logic
  const hasActiveThresholdBreach = (latest?.temperature > 60) || (latest?.current > 600) || (latest?.vibration === 1);
  const showFullAlert = (machineStatus?.machine_state === "fault" || hasActiveThresholdBreach) && !modalDismissed && !heartbeatStale;
  
  const secondsSinceUpdate = lastUpdated ? Math.floor((new Date() - lastUpdated) / 1000) : null;
  const isDataStale = secondsSinceUpdate !== null && secondsSinceUpdate > 10;

  const statusTone =
    machineStatus?.machine_state === "fault"
      ? "bg-rose-500/15 text-rose-100 border-rose-400/30"
      : "bg-emerald-500/15 text-emerald-100 border-emerald-400/30";

  // Process history for Recharts (reverse to chronological order)
  const chartData = [...dashboard.history].reverse().map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    Temperature: item.temperature,
    Current: item.current,
    Vibration: item.vibration
  }));

  return (
    <MainLayout isOnline={isOnline} lastSync={lastSync}>

      {/* EMERGENCY FAULT MODAL */}
      {showFullAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Intense Blinking Red Overlay */}
          <style>{`
            @keyframes aggressiveBlink {
              0%, 100% { background-color: rgba(220, 38, 38, 0.2); }
              50% { background-color: rgba(220, 38, 38, 0.7); }
            }
            .bg-blink {
              animation: aggressiveBlink 1.5s ease-in-out infinite;
            }
          `}</style>
          <div className="absolute inset-0 bg-blink pointer-events-auto backdrop-blur-[2px]" />

          {/* Modal Content */}
          <div className="relative w-[90%] max-w-xl rounded-xl bg-gradient-to-b from-[#b91c1c] to-[#881313] shadow-2xl overflow-hidden">
            <div className="flex flex-col items-center justify-center px-8 py-10 text-center">
              <div className="flex items-center justify-center gap-6 sm:gap-8">
                <span className="text-5xl sm:text-5xl text-amber-400 drop-shadow-md pb-1">⚠️</span>
                <h2 className="flex flex-col text-left text-2xl sm:text-4xl font-black text-white uppercase tracking-wider drop-shadow-lg leading-none">
                  <span>FAULT</span>
                  <span>DETECTED</span>
                </h2>
              </div>

              <div className="mt-6 w-full border-t border-red-500/50 pt-6">
                {/* Problem Text */}
                <h3 className="text-2xl sm:text-4xl font-bold text-[#facc15] drop-shadow-md">
                  {(() => {
                    const faults = machineStatus?.faults || [];
                    const messages = [];
                    if (faults.includes("temperature")) messages.push("Motor Overheating");
                    if (faults.includes("current")) messages.push("High Current/Load");
                    if (faults.includes("vibration")) messages.push("Vibration Anomaly");
                    
                    if (messages.length === 0) return "Machine Fault Detected!";
                    return messages.join(" & ") + "!";
                  })()}
                </h3>

                {/* Remedies Text */}
                <p className="mt-6 text-lg sm:text-2xl font-semibold text-white drop-shadow-sm leading-snug max-w-lg mx-auto">
                  {(() => {
                    const faults = machineStatus?.faults || [];
                    const remedies = [];
                    if (faults.includes("temperature")) remedies.push("Check cooling fan/improve ventilation");
                    if (faults.includes("current")) remedies.push("Disconnect power, check for jams, inspect wiring");
                    if (faults.includes("vibration")) remedies.push("Inspect mounts, bearings, and alignment");
                    
                    if (remedies.length === 0) return "Inspect machine immediately to resolve the issue";
                    return remedies.join(" | ");
                  })()}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setModalDismissed(true)}
                className="mt-10 rounded shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.5)] bg-gradient-to-b from-[#1e293b] to-[#0f172a] px-12 py-3 text-2xl font-bold text-white transition hover:from-[#334155] hover:to-[#1e293b] active:scale-95 border border-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="mt-6 grid grid-cols-3 gap-4">
        <SensorCard
          title="Temperature"
          value={latest && !heartbeatStale ? `${latest.temperature.toFixed(1)} °C` : "--"}
          helper="Threshold: > 60 °C"
          fault={latest?.temperature_fault && !heartbeatStale}
          accent="from-cyan-500/20 to-cyan-100"
        />
        <SensorCard
          title="Current"
          value={latest && !heartbeatStale ? `${latest.current} mA` : "--"}
          helper="Threshold: > 600 mA"
          fault={latest?.current_fault && !heartbeatStale}
          accent="from-amber-500/20 to-amber-100"
        />
        <SensorCard
          title="Vibration"
          value={latest && !heartbeatStale ? String(latest.vibration) : "--"}
          helper="Fault when value equals 1"
          fault={latest?.vibration_fault && !heartbeatStale}
          accent="from-rose-500/20 to-rose-100"
        />
        <div className="lg:col-span-3 mt-2 flex items-center justify-center gap-2">
          <div className={`h-2 w-2 rounded-full ${heartbeatStale ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {heartbeatStale 
              ? "Hardware System OFFLINE (Waiting for data...)" 
              : `Last Hardware Heartbeat: ${Math.floor((new Date() - new Date(latest.timestamp)) / 1000)}s ago`}
          </p>
        </div>
      </section>

      {/* Large Status Banner */}
      <section className="mt-6">
        <div className={`rounded-[2rem] border px-6 py-6 text-center shadow-sm backdrop-blur-sm relative overflow-hidden transition-all duration-500 ${machineStatus?.machine_state === "fault" ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`}>
          <div className="flex items-center justify-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${machineStatus?.machine_state === "fault" ? "bg-rose-400" : "bg-emerald-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${machineStatus?.machine_state === "fault" ? "bg-rose-500" : "bg-emerald-500"}`}></span>
            </span>
            <h2 className={`text-2xl sm:text-4xl font-black uppercase tracking-wide ${machineStatus?.machine_state === "fault" ? "text-rose-700" : "text-emerald-700"}`}>
              {machineStatus?.machine_state === "fault" ? "Status: FAULT DETECTED" : "Status: SYSTEM NORMAL"}
            </h2>
          </div>
          <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 animate-pulse">
            Real-Time Telemetry Sync Active
          </div>
        </div>
      </section>

      {/* AI Prediction & Remedies */}
      {machineStatus?.machine_state === "fault" && (
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* AI Prediction */}
          <div className="panel-glow rounded-[2rem] border border-slate-200 bg-white/80 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧠</span>
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest">AI Prediction</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Live Analysis</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Problem: </span>
              <span className="text-lg font-bold text-rose-600">
                {machineStatus.faults.includes("temperature") && machineStatus.faults.includes("current") ? "Motor Overheating & Overload"
                  : machineStatus.faults.includes("temperature") ? "Motor Overheating"
                    : machineStatus.faults.includes("current") ? "High Load / Current Spike"
                      : "Vibration / Mechanical Anomaly"}
              </span>
            </div>
          </div>

          {/* Remedies */}
          <div className="panel-glow rounded-[2rem] border border-slate-200 bg-white/80 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛠️</span>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest">Remedies</h3>
            </div>
            <div className="mt-4">
              <ul className="list-inside list-disc space-y-1 text-base font-medium text-amber-600 pl-2">
                {getRemedies(machineStatus.faults).map((remedy, idx) => (
                  <li key={idx}>{remedy}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Live Data Graph */}
      <section className="mt-6">
        <div className="rounded-[1rem] border border-slate-300 bg-white shadow-sm overflow-hidden">
          <div className="bg-[#2b6cb0] py-3 text-center">
            <h3 className="text-lg font-bold text-white uppercase tracking-wide">Live Data Graph</h3>
          </div>
          <div className="h-[240px] sm:h-[300px] w-full p-4 pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }} 
                  itemStyle={{ fontSize: '12px', fontWeight: '700' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: '600', color: '#475569' }} />
                <Area yAxisId="left" type="monotone" name="Temperature (°C)" dataKey="Temperature" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" activeDot={{ r: 6, strokeWidth: 0 }} />
                <Area yAxisId="right" type="monotone" name="Current (mA)" dataKey="Current" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" activeDot={{ r: 6, strokeWidth: 0 }} />
                <Area yAxisId="left" type="step" name="Vibration" dataKey="Vibration" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVib)" activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* FAST LIVE MINI-TABLE (5 ROWS) */}
      <section className="mt-6">
        <div className="panel-glow rounded-[2rem] border border-cyan-100 bg-white/60 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em]">Real-Time Data Feed</h3>
            </div>
            <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded-md border border-cyan-100 uppercase tracking-widest">Fast Sync</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100">
              <span>Time</span>
              <span>Temp</span>
              <span>Current</span>
              <span>Vib</span>
              <span>Status</span>
            </div>
            <div className="divide-y divide-slate-50">
              {dashboard.history.length ? (
                dashboard.history.slice(0, 5).map((item) => (
                  <div key={item.id} className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] items-center px-4 py-2 text-xs text-slate-700 animate-in fade-in slide-in-from-top-1 duration-300">
                    <span className="font-semibold text-slate-900">{new Date(item.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    <span>{item.temperature.toFixed(1)}°C</span>
                    <span>{item.current}mA</span>
                    <span className={item.vibration > 0 ? "text-emerald-600 font-bold" : "text-slate-400"}>{item.vibration}</span>
                    <span>
                      <StatusPill status={item.status} />
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 italic">No live readings available yet...</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
        <button
          onClick={() => setShowRecent(!showRecent)}
          className="w-full sm:w-auto rounded-full bg-slate-800 text-white px-8 py-3 text-sm font-bold uppercase tracking-wider shadow-md hover:bg-slate-700 hover:shadow-lg transition-all active:scale-95 border border-slate-900 cursor-pointer"
        >
          {showRecent ? "Hide Recent Readings" : "Recent Reading"}
        </button>

        <button
          onClick={() => navigate("/history")}
          className="w-full sm:w-auto rounded-full bg-slate-800 text-white px-8 py-3 text-sm font-bold uppercase tracking-wider shadow-md hover:bg-slate-700 hover:shadow-lg transition-all active:scale-95 border border-slate-900 flex items-center justify-center gap-3 cursor-pointer"
        >
          <span className="text-lg">🔍</span> Search Past Data
        </button>
      </div>

      {showRecent && (
        <section className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
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
                {Math.min(dashboard.history.length, 20)} rows
              </span>
            </div>

            <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-slate-200">
              <div className="min-w-[600px] hidden sm:grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] bg-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                <span>Time</span>
                <span>Temp</span>
                <span>Current</span>
                <span>Vibration</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-slate-100 bg-white">
                {dashboard.history.length ? (
                  dashboard.history.slice(0, 20).map((item) => (
                    <div key={item.id}>
                      <div className="hidden sm:grid min-w-[600px] grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] items-center px-4 py-3 text-sm text-slate-700">
                        <span>{formatTimestamp(item.timestamp)}</span>
                        <span>{item.temperature.toFixed(1)} °C</span>
                        <span>{item.current} mA</span>
                        <span>{item.vibration}</span>
                        <span>
                          <StatusPill status={item.status} />
                        </span>
                      </div>
                      <div className="block sm:hidden px-4 py-3 border-b border-slate-100 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-500 uppercase">{formatTimestamp(item.timestamp)}</span>
                          <StatusPill status={item.status} />
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 text-sm text-slate-700">
                          <div className="space-y-1">
                            <div className="text-[10px] uppercase text-slate-400">Temp</div>
                            <div>{item.temperature.toFixed(1)} °C</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[10px] uppercase text-slate-400">Current</div>
                            <div>{item.current} mA</div>
                          </div>
                          <div className="space-y-1 col-span-2">
                            <div className="text-[10px] uppercase text-slate-400">Vibration</div>
                            <div>{item.vibration}</div>
                          </div>
                        </div>
                      </div>
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
      )}
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

function SensorCard({ title, value, helper, fault }) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-5 shadow-sm text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</p>
      <p className={`mt-4 text-5xl font-black ${fault ? 'text-rose-600' : 'text-sky-600'}`}>{value}</p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
      <div className="mt-4 flex justify-center">
        <StatusPill status={fault ? 'fault' : 'normal'} />
      </div>
    </div>
  );
}

function StatusFlag({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${value
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
  const isFault = status === "fault";
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${isFault ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"}`}
    >
      {isFault ? "FAULT" : "NORMAL"}
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

function getRemedies(faults) {
  if (!faults || faults.length === 0) return [];

  let pool = [];

  if (faults.includes("temperature")) {
    pool.push(
      "Immediately reduce operating load to 50%.",
      "Check the main cooling fan for dust or obstructions.",
      "Improve ambient ventilation around the motor housing.",
      "Inspect thermal heatsinks for excessive dust buildup.",
      "Verify that ambient room temperature is within safe limits.",
      "Check thermal paste or coupling on core components.",
      "Ensure the machine is not running continuously past its duty cycle."
    );
  }

  if (faults.includes("current")) {
    pool.push(
      "Disconnect main power immediately to prevent electrical damage.",
      "Check for severe mechanical jams blocking the motor.",
      "Inspect wiring circuits and terminals for short circuits.",
      "Verify motor phase alignment and winding integrity.",
      "Test the power supply unit for voltage spikes.",
      "Check for damaged insulation on primary power cables.",
      "Reduce the load capacity upon the next restart."
    );
  }

  if (faults.includes("vibration")) {
    pool.push(
      "Inspect structural mounts and tighten all base bolts.",
      "Check rotary bearings for excessive wear, grinding, or damage.",
      "Verify load balancing and shaft alignment.",
      "Schedule an immediate mechanical maintenance check.",
      "Inspect for loose internal components rattling against the chassis.",
      "Check transmission belts or gears for slipping.",
      "Make sure the machine is placed on a completely flat, stable surface."
    );
  }

  // Remove duplicates just in case
  let uniqueRemedies = [...new Set(pool)];

  // Randomly shuffle the array (Fisher-Yates shuffle)
  for (let i = uniqueRemedies.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uniqueRemedies[i], uniqueRemedies[j]] = [uniqueRemedies[j], uniqueRemedies[i]];
  }

  // Return exactly up to 5 random suggestions from the shuffled pool
  return uniqueRemedies.slice(0, 3);
}

export default HomePage;
