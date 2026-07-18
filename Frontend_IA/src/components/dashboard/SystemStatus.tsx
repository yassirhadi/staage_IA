import { motion } from 'framer-motion';
import { CheckCircle2, Server, Wifi, WifiOff, Globe, Cpu, Database, Scan } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface SystemStatusProps {
  backendOnline: boolean;
  lastAnalysis: string;
  pendingAnalysis: number;
}

interface StatusItemProps {
  label: string;
  status: 'online' | 'offline' | 'warning';
  detail: string;
  icon: React.ElementType;
}

function StatusRow({ label, status, detail, icon: Icon }: StatusItemProps) {
  const statusConfig = {
    online: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', badge: 'success' as const, dot: 'bg-emerald-400' },
    offline: { color: 'text-[hsl(350_45%_58%)]', bg: 'bg-[hsl(350_45%_38%)]/10', badge: 'destructive' as const, dot: 'bg-[hsl(350_45%_50%)]' },
    warning: { color: 'text-amber-400', bg: 'bg-amber-500/10', badge: 'warning' as const, dot: 'bg-amber-400' },
  };
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-secondary/20 p-3">
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', config.bg)}>
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{label}</p>
          <span className={cn('h-1.5 w-1.5 rounded-full animate-pulse', config.dot)} />
        </div>
        <p className="text-xs text-muted-foreground truncate">{detail}</p>
      </div>
      <Badge variant={config.badge} className="text-[10px] shrink-0">
        {status === 'online' ? 'En ligne' : status === 'offline' ? 'Hors ligne' : 'Attention'}
      </Badge>
    </div>
  );
}

export function SystemStatus({ backendOnline, lastAnalysis, pendingAnalysis }: SystemStatusProps) {
  const [iaOnline, setIaOnline] = useState<boolean | null>(null);
  const [mysqlOnline, setMysqlOnline] = useState<boolean | null>(null);
  const [ocrOnline, setOcrOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkServices = async () => {
      try {
        // Check FastAPI health endpoint with correct prefix
        const iaRes = await fetch('http://localhost:8000/api/v1/health', { method: 'GET' });
        setIaOnline(iaRes.ok);
        // Assume OCR is part of FastAPI service
        setOcrOnline(iaRes.ok);
      } catch {
        setIaOnline(false);
        setOcrOnline(false);
      }

      // For MySQL, we'll assume it's online if backend is online (since backend uses it)
      setMysqlOnline(backendOnline);
    };

    checkServices();
  }, [backendOnline]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Server className="h-4 w-4 text-primary" />
        <div>
          <h3 className="text-sm font-semibold">État du système</h3>
          <p className="text-xs text-muted-foreground">Surveillance en temps réel</p>
        </div>
      </div>

      <div className="space-y-2">
        <StatusRow
          label="Frontend"
          status="online"
          detail={typeof window !== 'undefined' ? window.location.origin : 'Application web'}
          icon={Globe}
        />
        <StatusRow
          label="Backend API"
          status={backendOnline ? 'online' : 'offline'}
          detail="http://localhost:8080/api"
          icon={backendOnline ? Wifi : WifiOff}
        />
        <StatusRow
          label="Service IA (FastAPI)"
          status={iaOnline === null ? 'warning' : iaOnline ? 'online' : 'offline'}
          detail="http://localhost:8000"
          icon={Cpu}
        />
        <StatusRow
          label="OCR"
          status={ocrOnline === null ? 'warning' : ocrOnline ? 'online' : 'offline'}
          detail="Intégré au service IA"
          icon={Scan}
        />
        <StatusRow
          label="Base de données (MySQL)"
          status={mysqlOnline === null ? 'warning' : mysqlOnline ? 'online' : 'offline'}
          detail="localhost:3306"
          icon={Database}
        />
        <StatusRow
          label="Analyses en attente"
          status={pendingAnalysis > 0 ? 'warning' : 'online'}
          detail={pendingAnalysis > 0 ? `${pendingAnalysis} document(s) en attente` : 'Aucune analyse en attente'}
          icon={CheckCircle2}
        />
      </div>
    </motion.div>
  );
}
