import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color: string;
  delay?: number;
}

export function StatCard({ label, value, icon: Icon, trend, trendUp, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card gradient-border rounded-xl p-5 relative overflow-hidden group"
    >
      <div
        className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20"
        style={{ background: color }}
      />
      <div className="flex items-start justify-between relative">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <motion.p
            className="text-3xl font-bold tracking-tight"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.1 }}
          >
            {value}
          </motion.p>
          {trend && (
            <p className={cn('text-xs font-medium', trendUp ? 'text-emerald-400' : 'text-[hsl(350_45%_58%)]')}>
              {trend}
            </p>
          )}
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-lg"
          style={{ background: `${color}20`, color }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
