import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle2, FileText, Shield } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';

export interface ActivityItem {
  id: string;
  type: 'risk' | 'document' | 'recommendation' | 'report';
  title: string;
  description?: string;
  timestamp: string;
  severity?: string;
}

interface RecentActivitiesProps {
  activities: ActivityItem[];
}

const typeConfig = {
  risk: { icon: AlertTriangle, color: 'text-[hsl(350_45%_58%)]', bg: 'bg-[hsl(350_45%_38%)]/10', label: 'Risque' },
  document: { icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Document' },
  recommendation: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Recommandation' },
  report: { icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Rapport' },
};

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <div className="glass-card rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-primary" />
        <div>
          <h3 className="text-sm font-semibold">Activités récentes</h3>
          <p className="text-xs text-muted-foreground">Dernières actions du système</p>
        </div>
      </div>
      <ScrollArea className="flex-1 -mx-2 px-2">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucune activité récente</p>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 8).map((activity, i) => {
              const config = typeConfig[activity.type];
              const Icon = config.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 rounded-lg border border-border/40 bg-secondary/20 p-3 hover:bg-secondary/40 transition-colors"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${config.bg}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      {activity.severity && (
                        <Badge variant={activity.severity === 'CRITIQUE' ? 'critical' : 'warning'} className="shrink-0 text-[10px]">
                          {activity.severity}
                        </Badge>
                      )}
                    </div>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{activity.description}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 mt-1">{formatRelativeTime(activity.timestamp)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
