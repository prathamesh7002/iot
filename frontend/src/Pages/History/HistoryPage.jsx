import { useState } from "react";
import { Link } from "react-router-dom";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import MainLayout from "../../components/MainLayout";
import api from "../../services/api";

function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function StatusPill({ status }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${status === "fault" ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
        }`}
    >
      {status === "ok" ? "normal" : status}
    </span>
  );
}

function HistoryPage() {
  const [fromDate, setFromDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toDate, setToDate] = useState("");
  const [toTime, setToTime] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!fromDate) {
      setError("Please select a 'From' date to search.");
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const fromDateTime = new Date(`${fromDate}T${fromTime || "00:00"}:00`).toISOString();
      let toDateTime = undefined;

      if (toDate) {
        toDateTime = new Date(`${toDate}T${toTime || "23:59"}:59`).toISOString();
      }

      const historyParams = {
        limit: 500,
        from: fromDateTime,
        ...(toDateTime && { to: toDateTime })
      };

      const res = await api.get("/api/v1/telemetry/history", { params: historyParams });
      setHistoryData(res.data.items ?? []);
    } catch (err) {
      setError("Failed to fetch historical data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = [...historyData].reverse().map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    Temperature: item.temperature,
    Current: item.current,
    Vibration: item.vibration
  }));

  return (
    <MainLayout>
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/50 p-6 rounded-[2rem] border border-slate-200">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Historical Data Search</h2>
          <p className="mt-1 text-sm text-slate-500 font-medium">Query past telemetry readings and machine events.</p>
        </div>
        <Link to="/" className="rounded-xl bg-white border border-slate-300 shadow-sm px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-cyan-700 transition-colors flex items-center gap-2 cursor-pointer">
          <span className="text-lg">&larr;</span> Back to Live Dashboard
        </Link>
      </div>

      {/* Historical Search Bar */}
      <section className="mt-4 rounded-[1.5rem] border border-slate-300 bg-white p-6 shadow-sm flex flex-col lg:flex-row items-end gap-6 justify-between">

        {/* From Date & Time */}
        <div className="flex-1 w-full max-w-lg">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2 mb-2 block">From *</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
            <input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              className="sm:w-1/3 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* To Date & Time */}
        <div className="flex-1 w-full max-w-lg">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2 mb-2 block">To (Optional)</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
            <input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              className="sm:w-1/3 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 w-full lg:w-auto h-full items-end mt-4 lg:mt-0">
          <button
            onClick={handleSearch}
            disabled={!fromDate || loading}
            className="w-full lg:w-auto rounded-xl bg-cyan-600 px-10 py-3 text-sm font-bold text-white shadow-md hover:bg-cyan-700 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 uppercase tracking-wider h-[46px] flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? "SEARCHING..." : "SEARCH"}
          </button>
        </div>
      </section>

      {error && (
        <div className="mt-6 rounded-xl bg-rose-50 text-rose-700 p-4 border border-rose-200 text-sm font-semibold">
          {error}
        </div>
      )}

      {hasSearched && historyData.length === 0 && !loading && !error && (
        <div className="mt-6 rounded-xl bg-slate-50 text-slate-500 p-8 border border-slate-200 text-sm font-semibold text-center">
          No telemetry recorded in your selected timeframe.
        </div>
      )}

      {historyData.length > 0 && !loading && (
        <>
          <section className="mt-6">
            <div className="rounded-[1rem] border border-slate-300 bg-white shadow-sm overflow-hidden">
              <div className="bg-[#1e293b] py-3 text-center">
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">Historical Graph Breakdown</h3>
              </div>
              <div className="h-[260px] sm:h-[400px] w-full p-4 pl-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorTempHist" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCurrentHist" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorVibHist" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }} 
                      itemStyle={{ fontSize: '12px', fontWeight: '700' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: '600', color: '#475569' }} />
                    <Area yAxisId="left" type="monotone" name="Temperature (°C)" dataKey="Temperature" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorTempHist)" activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Area yAxisId="right" type="monotone" name="Current (mA)" dataKey="Current" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrentHist)" activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Area yAxisId="left" type="step" name="Vibration" dataKey="Vibration" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVibHist)" activeDot={{ r: 6, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <div className="panel-glow rounded-[2rem] border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-slate-900">
                    Search Results Data
                  </h3>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 border border-slate-200 shadow-sm">
                  {historyData.length} records found
                </span>
              </div>

              <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] max-h-[500px] overflow-y-auto bg-white">
                <div className="sticky top-0 z-10 grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] bg-slate-800 text-white px-4 py-3 text-xs font-bold uppercase tracking-[0.25em] shadow-md">
                  <span>Time</span>
                  <span>Temp</span>
                  <span>Current</span>
                  <span>Vibration</span>
                  <span>Status</span>
                </div>
                <div className="divide-y divide-slate-100 bg-white">
                  {historyData.map((item) => (
                      <div key={item.id} className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                      <span className="font-medium text-slate-900">{formatTimestamp(item.timestamp)}</span>
                      <span>{item.temperature.toFixed(1)} °C</span>
                      <span>{item.current} mA</span>
                      <span>{item.vibration}</span>
                      <span>
                        <StatusPill status={item.status} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </MainLayout>
  );
}

export default HistoryPage;
