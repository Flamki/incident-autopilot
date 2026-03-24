import { motion } from "motion/react";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Zap, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";

const data = [
  { name: "Mon", incidents: 4, mttr: 120 },
  { name: "Tue", incidents: 7, mttr: 95 },
  { name: "Wed", incidents: 3, mttr: 80 },
  { name: "Thu", incidents: 5, mttr: 110 },
  { name: "Fri", incidents: 8, mttr: 140 },
  { name: "Sat", incidents: 2, mttr: 60 },
  { name: "Sun", incidents: 1, mttr: 45 },
];

const severityData = [
  { name: "Critical", value: 12, color: "#FF3B30" },
  { name: "Warning", value: 24, color: "#FF9500" },
  { name: "Info", value: 48, color: "#007AFF" },
  { name: "Resolved", value: 124, color: "#34C759" },
];

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
  return (
    <div className="p-sp-4 flex flex-col gap-sp-4 h-full relative">
      <div className="flex items-center justify-between mt-sp-1 px-1">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tighter italic">Analytics</h1>
          <p className="text-[11px] font-mono text-text-muted uppercase font-bold tracking-widest mt-1">System_Performance: Optimal // MTTR_Trend: -14%</p>
        </div>
        <div className="flex items-center gap-sp-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-3 w-3" /> Refresh
          </Button>
          <Button className="btn-neon h-9 px-4 text-[10px] font-bold uppercase tracking-tighter">
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-sp-6">
        {[
          { label: "MTTR (30d)", value: "87s", trend: "-14%", up: false, sub: "Avg Resolution Time" },
          { label: "Incidents (30d)", value: "124", trend: "+2%", up: true, sub: "Total Detected" },
          { label: "Agent Accuracy", value: "97.4%", trend: "+1.2%", up: true, sub: "Root Cause Precision" },
          { label: "Automation Rate", value: "82%", trend: "+5%", up: true, sub: "Self-Healing Actions" },
        ].map((stat, i) => (
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
              <div className={cn(
                "text-[10px] font-mono font-bold flex items-center",
                stat.up ? "text-critical" : "text-resolved"
              )}>
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
          <div className="coord-label -top-2 -left-2 bg-bg-card px-1">// INCIDENT_TRENDS //</div>
          <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest mb-sp-8">Incident Frequency & MTTR</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D1D1D1" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#141414" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontStyle: 'italic', fontWeight: 'bold' }}
                />
                <YAxis 
                  stroke="#141414" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontWeight: 'bold' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="incidents" 
                  stroke="#7C3AED" 
                  strokeWidth={3} 
                  dot={{ fill: '#7C3AED', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mttr" 
                  stroke="#CCFF00" 
                  strokeWidth={3} 
                  dot={{ fill: '#CCFF00', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-border bg-bg-card p-sp-6 relative">
          <div className="coord-label -top-2 -left-2 bg-bg-card px-1">// SEVERITY_DISTRIBUTION //</div>
          <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest mb-sp-8">Incidents by Severity</h3>
          <div className="h-[300px] w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-sp-4 w-full mt-sp-6">
              {severityData.map((item) => (
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
