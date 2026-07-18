import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn, getScoreColor, getScoreGradient } from '@/lib/utils';

interface ScoreWidgetProps {
  title: string;
  score: number | null;
  subtitle?: string;
  documentsScore?: number | null;
  risksScore?: number | null;
  delay?: number;
}

function ScoreRing({ score, size = 120 }: { score: number | null; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeScore = score ?? 0; // Default to 0% if null
  const offset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth="6"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-2xl font-bold', getScoreColor(safeScore))}>
          {Math.round(safeScore)}%
        </span>
      </div>
    </div>
  );
}

export function SecurityScoreWidget({ title, score, subtitle, documentsScore, delay = 0 }: ScoreWidgetProps) {
  const safeScore = score ?? 0;
  const safeDocumentsScore = documentsScore ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card gradient-border rounded-xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <ScoreRing score={safeScore} />
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Documents</span>
              <span className="font-medium">{Math.round(safeDocumentsScore)}%</span>
            </div>
            <Progress value={safeDocumentsScore} className="h-1.5" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            <span>Basé sur l'analyse IA</span>
          </div>
        </div>
      </div>

      <Button variant="outline" size="sm" className="mt-4 w-full text-xs" asChild>
        <Link to="/security-score">Détails du score</Link>
      </Button>
    </motion.div>
  );
}

export function ComplianceScoreWidget({ title, score, delay = 0 }: ScoreWidgetProps) {
  const safeScore = score ?? 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card gradient-border rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">Conformité réglementaire</p>
        </div>
        <span className={cn('text-3xl font-bold', getScoreColor(safeScore))}>
          {Math.round(safeScore)}%
        </span>
      </div>

      <Progress
        value={safeScore}
        className="h-2 mb-3"
        indicatorClassName={cn('bg-gradient-to-r', getScoreGradient(safeScore))}
      />

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Faible', range: '< 60%', active: safeScore < 60 },
          { label: 'Moyen', range: '60-79%', active: safeScore >= 60 && safeScore < 80 },
          { label: 'Élevé', range: '≥ 80%', active: safeScore >= 80 },
        ].map((level) => (
          <div
            key={level.label}
            className={cn(
              'rounded-md py-1.5 text-[10px] border transition-colors',
              level.active
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border/40 text-muted-foreground'
            )}
          >
            <p className="font-medium">{level.label}</p>
            <p className="opacity-70">{level.range}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
