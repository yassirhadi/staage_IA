import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Bot,
  FolderOpen,
  ScanLine,
  ShieldAlert,
  FileBarChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  {
    label: 'Scanner un dossier',
    description: 'Inventorier les documents',
    icon: ScanLine,
    href: '/inventory',
    color: '#3b82f6',
  },
  {
    label: 'Analyser les risques',
    description: 'Consulter les menaces',
    icon: ShieldAlert,
    href: '/risks',
    color: '#ef4444',
  },
  {
    label: 'Ouvrir Copilote IA',
    description: 'Assistant sécurité',
    icon: Bot,
    href: '/copilot',
    color: '#8b5cf6',
  },
  {
    label: 'Voir les rapports',
    description: 'Export et synthèse',
    icon: FileBarChart,
    href: '/reports',
    color: '#10b981',
  },
];

export function QuickActions() {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Actions rapides</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Accès direct aux opérations courantes</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, i) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={action.href}
              className={cn(
                'flex flex-col gap-2 rounded-lg border border-border/50 bg-secondary/30 p-3',
                'transition-all hover:bg-secondary/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5'
              )}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-md"
                style={{ background: `${action.color}20`, color: action.color }}
              >
                <action.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium leading-tight">{action.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{action.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
