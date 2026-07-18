import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface ChartDataPoint {
  name: string;
  value: number;
}

interface DashboardChartsProps {
  confidential: ChartDataPoint[];
  risks: ChartDataPoint[];
  recommendations: ChartDataPoint[];
}

const COLORS = {
  confidential: ['#64748b', '#3b82f6', '#f59e0b', '#ef4444'],
  risks: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
  recommendations: ['#10b981', '#ef4444', '#3b82f6', '#8b5cf6'],
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card/95 backdrop-blur px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground">{label || payload[0].name}</p>
      <p className="text-sm font-semibold">{payload[0].value}</p>
    </div>
  );
};

export function DashboardCharts({ confidential, risks, recommendations }: DashboardChartsProps) {
  const trendData = confidential.map((item, i) => ({
    name: item.name,
    documents: item.value,
    risks: risks[i]?.value ?? 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl p-6 lg:col-span-2"
      >
        <h3 className="text-sm font-semibold mb-1">Vue d&apos;ensemble sécurité</h3>
        <p className="text-xs text-muted-foreground mb-4">Documents par niveau de confidentialité vs risques</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRisks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }} />
            <Area type="monotone" dataKey="documents" name="Documents" stroke="#3b82f6" fill="url(#colorDocs)" strokeWidth={2} />
            <Area type="monotone" dataKey="risks" name="Risques" stroke="#ef4444" fill="url(#colorRisks)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="text-sm font-semibold mb-1">Risques par sévérité</h3>
        <p className="text-xs text-muted-foreground mb-4">Distribution des menaces détectées</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={risks} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="Risques" radius={[6, 6, 0, 0]}>
              {risks.map((_, index) => (
                <Cell key={`risk-${index}`} fill={COLORS.risks[index % COLORS.risks.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="text-sm font-semibold mb-1">Confidentialité</h3>
        <p className="text-xs text-muted-foreground mb-4">Classification des documents</p>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={confidential.filter((d) => d.value > 0)}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {confidential.map((_, index) => (
                <Cell key={`conf-${index}`} fill={COLORS.confidential[index % COLORS.confidential.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }} />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-xl p-6 lg:col-span-2"
      >
        <h3 className="text-sm font-semibold mb-1">Recommandations</h3>
        <p className="text-xs text-muted-foreground mb-4">Statut des actions correctives</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={recommendations} layout="vertical" barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} horizontal={false} />
            <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="Recommandations" radius={[0, 6, 6, 0]}>
              {recommendations.map((_, index) => (
                <Cell key={`rec-${index}`} fill={COLORS.recommendations[index % COLORS.recommendations.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
