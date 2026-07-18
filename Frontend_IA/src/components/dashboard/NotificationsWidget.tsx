import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bell, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatRelativeTime } from '@/lib/utils';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsWidgetProps {
  notifications: NotificationItem[];
}

const typeColors: Record<string, string> = {
  RISK: 'text-[hsl(350_45%_58%)] bg-[hsl(350_45%_38%)]/10',
  ANALYSIS: 'text-cyan-400 bg-cyan-500/10',
  REPORT: 'text-purple-400 bg-purple-500/10',
  DOCUMENT: 'text-amber-400 bg-amber-500/10',
  RECOMMENDATION: 'text-emerald-400 bg-emerald-500/10',
};

export function NotificationsWidget({ notifications }: NotificationsWidgetProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="glass-card rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="h-4 w-4 text-primary" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[hsl(350_45%_38%)] animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est lu'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-[10px]">{unreadCount}</Badge>
        )}
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2">
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucune notification</p>
        ) : (
          <div className="space-y-2">
            {notifications.slice(0, 5).map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-lg border p-3 transition-colors ${
                  notif.isRead
                    ? 'border-border/30 bg-secondary/10 opacity-70'
                    : 'border-primary/20 bg-primary/5'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${typeColors[notif.type] || 'text-muted-foreground bg-secondary'}`}>
                    {notif.type}
                  </span>
                  {!notif.isRead && <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />}
                </div>
                <p className="text-sm font-medium mt-1.5 leading-tight">{notif.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notif.message}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">{formatRelativeTime(notif.createdAt)}</p>
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>

      <Button variant="ghost" size="sm" className="mt-4 w-full text-xs" asChild>
        <Link to="/notifications">
          Voir toutes les notifications
          <ArrowRight className="h-3 w-3" />
        </Link>
      </Button>
    </div>
  );
}
