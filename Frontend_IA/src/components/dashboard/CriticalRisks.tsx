import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertOctagon, ArrowRight, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatRelativeTime } from '@/lib/utils';

export interface CriticalRisk {
  id: number;
  title: string;
  description?: string;
  severity: string;
  category?: string;
  detectedAt: string;
}

interface CriticalRisksProps {
  risks: CriticalRisk[];
  totalRisks: number;
}

const severityVariant = (severity: string) => {
  if (severity === 'CRITIQUE') return 'critical' as const;
  if (severity === 'ELEVE') return 'destructive' as const;
  return 'warning' as const;
};

const severityLabel: Record<string, string> = {
  CRITIQUE: 'Critique',
  ELEVE: 'Élevé',
  MOYEN: 'Moyen',
  FAIBLE: 'Faible',
};

export function CriticalRisks({ risks, totalRisks }: CriticalRisksProps) {
  const criticalCount = risks.filter((r) => r.severity === 'CRITIQUE').length;
  const highCount = risks.filter((r) => r.severity === 'ELEVE').length;

  return (
    <div className="glass-card rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(350_45%_38%)]/15">
            <Flame className="h-4 w-4 text-[hsl(350_45%_58%)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Risques critiques</h3>
            <p className="text-xs text-muted-foreground">
              {criticalCount} critique{criticalCount !== 1 ? 's' : ''} · {highCount} élevé{highCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Badge variant="destructive" className="text-[10px]">
          {totalRisks} total
        </Badge>
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2">
        {risks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertOctagon className="h-8 w-8 text-emerald-400/50 mb-2" />
            <p className="text-sm text-muted-foreground">Aucun risque critique détecté</p>
          </div>
        ) : (
          <div className="space-y-2">
            {risks.slice(0, 6).map((risk, i) => (
              <motion.div
                key={risk.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-lg border border-[hsl(350_45%_38%)]/10 bg-[hsl(350_45%_38%)]/5 p-3 hover:border-[hsl(350_45%_38%)]/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-tight">{risk.title}</p>
                  <Badge variant={severityVariant(risk.severity)} className="shrink-0 text-[10px]">
                    {severityLabel[risk.severity] || risk.severity}
                  </Badge>
                </div>
                {risk.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{risk.description}</p>
                )}
                <p className="text-[10px] text-muted-foreground/60 mt-1.5">{formatRelativeTime(risk.detectedAt)}</p>
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>

      <Button variant="ghost" size="sm" className="mt-4 w-full text-xs" asChild>
        <Link to="/risks">
          Voir tous les risques
          <ArrowRight className="h-3 w-3" />
        </Link>
      </Button>
    </div>
  );
}
