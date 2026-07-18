import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, CircleCheck, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RecommendationStats {
  validees: number;
  rejetees: number;
  enCours: number;
  terminees: number;
}

interface RecommendationsWidgetProps {
  stats: RecommendationStats;
}

export function RecommendationsWidget({ stats }: RecommendationsWidgetProps) {
  const items = [
    { label: 'Validées', value: stats.validees, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Rejetées', value: stats.rejetees, icon: XCircle, color: 'text-[hsl(350_45%_58%)]', bg: 'bg-[hsl(350_45%_38%)]/10' },
    { label: 'En cours', value: stats.enCours, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Terminées', value: stats.terminees, icon: CircleCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="glass-card rounded-xl p-6 h-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15">
          <CheckCircle2 className="h-4 w-4 text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Recommandations</h3>
          <p className="text-xs text-muted-foreground">Actions correctives</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg border border-border/40 bg-secondary/20 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`flex h-7 w-7 items-center justify-center rounded-md ${item.bg}`}>
                <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
              </div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
            <p className="text-xl font-bold">{item.value}</p>
          </motion.div>
        ))}
      </div>

      <Button variant="ghost" size="sm" className="mt-4 w-full text-xs" asChild>
        <Link to="/recommendations">
          Voir toutes les recommandations
          <ArrowRight className="h-3 w-3 ml-1" />
        </Link>
      </Button>
    </motion.div>
  );
}
