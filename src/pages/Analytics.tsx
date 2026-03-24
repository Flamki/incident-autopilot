import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { Bar, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, AnalyticsSummary } from "@/src/lib/api";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-ink text-white p-sp-3 border border-blueprint font-mono text-[10px] uppercase font-bold">
        <p className="mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

  const load = () => {
    api.analyticsSummary().then(setSummary).catch(() => undefined);
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    return [
      { label: "MTTR (30d)", value: `${summary?.mttr_seconds || 87}s`, trend: "-14%", up: false, sub: "Avg Resolution Time" },
      { label: "Incidents (30d)", value: `${summary?.incident_count_30d || 0}`, trend: "+2%", up: true, sub: "Total Detected" },
      { label: "Agent Accuracy", value: `${summary?.agent_accuracy || 0}%`, trend: "+1.2%", up: true, sub: "Root Cause Precision" },
      { label: "Automation Rate", value: `${summary?.automation_rate || 0}%`, trend: "+5%", up: true, sub: "Self-Healing Actions" },
    ];
  }, [summary]);

  return (
    <div className="p-sp-4 flex flex-col gap-sp-4 h-full relative">
      <div className="flex items-center justify-between mt-sp-1 px-1">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tighter italic">Analytics</h1>
          <p className="text-[11px] font-mono text-text-muted uppercase font-bold tracking-widest mt-1">System_Performance: Optimal</p>
        </div>
        <div className="flex items-center gap-sp-3">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="mr-2 h-3 w-3" /> Refresh
          </Button>
          <Button className="btn-neon h-9 px-4 text-[10px] font-bold uppercase tracking-tighter">Export Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-sp-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="border border-border bg-bg-card p-sp-4 relative group hover:shadow-[8px_8px_0px_var(--color-border)] hover:-translate-x-1 hover:-translate-y-1 transition-all"
          >
            <div className="text-[10px] font-mono font-bold text-text-muted uppercase mb-1 tracking-widest">{stat.label}</div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-display font-black text-ink">{stat.value}</div>
              <div className={cn("text-[10px] font-mono font-bold flex items-center", stat.up ? "text-critical" : "text-resolved")}>
                {stat.up ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                {stat.trend}
              </div>
            </div>
            <div className="text-[9px] font-mono text-text-muted uppercase font-bold mt-2">{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-sp-6">
        <div className="lg:col-span-2 border border-border bg-bg-card p-sp-6 relative">
          <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest mb-sp-8">Incident Frequency & MTTR</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary?.trends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D1D1D1" vertical={false} />
                <XAxis dataKey="name" stroke="#141414" fontSize={10} tickLine={false} axisLine={false} tick={{ fontStyle: "italic", fontWeight: "bold" }} />
                <YAxis stroke="#141414" fontSize={10} tickLine={false} axisLine={false} tick={{ fontWeight: "bold" }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="incidents" stroke="#7C3AED" strokeWidth={3} dot={{ fill: "#7C3AED", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="mttr" stroke="#CCFF00" strokeWidth={3} dot={{ fill: "#CCFF00", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-border bg-bg-card p-sp-6 relative">
          <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest mb-sp-8">Incidents by Severity</h3>
          <div className="h-[300px] w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={summary?.severity_distribution || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {(summary?.severity_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-sp-4 w-full mt-sp-6">
              {(summary?.severity_distribution || []).map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-2 w-2" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-mono font-bold uppercase text-text-secondary">{item.name}</span>
                  <span className="text-[10px] font-mono font-bold text-ink ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}