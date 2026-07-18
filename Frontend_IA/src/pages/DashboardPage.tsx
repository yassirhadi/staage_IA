import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  HardDrive,
  ShieldAlert,
  Lightbulb,
  FileBarChart,
  Lock,
  Clock,
  RefreshCw,
  Users,
  Shield,
} from 'lucide-react';
import { inventoryApi, aiApi, rssiApi, assetsApi, securityApi, adminApi, authApi } from '@/api/services';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivities, type ActivityItem } from '@/components/dashboard/RecentActivities';
import { CriticalRisks, type CriticalRisk } from '@/components/dashboard/CriticalRisks';
import { SecurityScoreWidget, ComplianceScoreWidget } from '@/components/dashboard/ScoreWidgets';
import { SystemStatus } from '@/components/dashboard/SystemStatus';
import { NotificationsWidget, type NotificationItem } from '@/components/dashboard/NotificationsWidget';
import { RecommendationsWidget } from '@/components/dashboard/RecommendationsWidget';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  documents: number;
  risks: number;
  pending: number;
  confidential: number;
  recommendations: number;
  validated: number;
  rejected: number;
  assets: number;
  reports: number;
  users: number;
  roles: number;
  lastBackup: string;
}

interface ChartDataPoint {
  name: string;
  value: number;
}

interface ChartData {
  confidential: ChartDataPoint[];
  risks: ChartDataPoint[];
  recommendations: ChartDataPoint[];
  topDocuments: { name: string }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    documents: 0,
    risks: 0,
    pending: 0,
    confidential: 0,
    recommendations: 0,
    validated: 0,
    rejected: 0,
    assets: 0,
    reports: 0,
    users: 0,
    roles: 0,
    lastBackup: 'N/A',
  });

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const [chartData, setChartData] = useState<ChartData>({
    confidential: [],
    risks: [],
    recommendations: [],
    topDocuments: [],
  });

  const [recStats, setRecStats] = useState({
    validees: 0,
    rejetees: 0,
    enCours: 0,
    terminees: 0,
  });

  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [lastAnalysis, setLastAnalysis] = useState('N/A');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [securityScore, setSecurityScore] = useState<{
    overall: number | null;
    compliance: number | null;
    documents: number | null;
  }>({ overall: null, compliance: null, documents: null });

  const [criticalRisks, setCriticalRisks] = useState<CriticalRisk[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadStats = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      // Check Spring Boot health first by trying to reach the backend
      try {
        await fetch('http://localhost:8080/api/auth/users');
        setBackendOnline(true);
      } catch {
        setBackendOnline(false);
      }

      const [docsRes, risksRes, recsRes, assetsRes, reportsRes, scoreRes, notifsRes, usersRes, rolesRes, backupsRes, dashboardStatsRes] = await Promise.all([
        inventoryApi.getDocuments().catch(() => ({ data: { data: [] } })),
        aiApi.getRisks().catch(() => ({ data: { data: [] } })),
        rssiApi.getRecommendations().catch(() => ({ data: { data: [] } })),
        assetsApi.getAll().catch(() => ({ data: { data: [] } })),
        rssiApi.getReports().catch(() => ({ data: { data: [] } })),
        securityApi.getLatest().catch(() => ({ data: { data: null } })),
        rssiApi.getNotifications().catch(() => ({ data: { data: [] } })),
        authApi.getUsers().catch(() => ({ data: { data: [] } })),
        adminApi.getRoles().catch(() => ({ data: { data: [] } })),
        adminApi.getBackups().catch(() => ({ data: { data: [] } })),
        aiApi.getDashboardStats().catch(() => ({ data: { data: null } })),
      ]);

      const docs = Array.isArray(docsRes?.data?.data) ? docsRes.data.data : [];
      const risks = Array.isArray(risksRes?.data?.data) ? risksRes.data.data : [];
      const recs = Array.isArray(recsRes?.data?.data) ? recsRes.data.data : [];
      const assets = Array.isArray(assetsRes?.data?.data) ? assetsRes.data.data : [];
      const reports = Array.isArray(reportsRes?.data?.data) ? reportsRes.data.data : [];
      const users = Array.isArray(usersRes?.data?.data) ? usersRes.data.data : [];
      const roles = Array.isArray(rolesRes?.data?.data) ? rolesRes.data.data : [];
      const backups = Array.isArray(backupsRes?.data?.data) ? backupsRes.data.data : [];
      let scorePayload = scoreRes?.data?.data || null;
      const dashboardStats = dashboardStatsRes?.data?.data || null;

      // Fallback values if API fails
      const userCount = users.length > 0 ? users.length : 2; // Default to 2 users (admin, rssi)
      const roleCount = roles.length > 0 ? roles.length : 2; // Default to 2 roles (ADMIN, RSSI)

      // If no score exists, calculate one
      if (!scorePayload) {
        try {
          const calculateRes = await securityApi.calculate();
          scorePayload = calculateRes?.data?.data;
        } catch (calcErr) {
          console.error('Error calculating security score:', calcErr);
        }
      }
      const notifs = Array.isArray(notifsRes?.data?.data) ? notifsRes.data.data : [];

      const confDistribution = [
        { name: 'Public', value: docs.filter((d: { confidentialityLevel?: string }) => d.confidentialityLevel === 'PUBLIC').length },
        { name: 'Interne', value: docs.filter((d: { confidentialityLevel?: string }) => d.confidentialityLevel === 'INTERNE').length },
        { name: 'Confidentiel', value: docs.filter((d: { confidentialityLevel?: string }) => d.confidentialityLevel === 'CONFIDENTIEL').length },
        { name: 'Très conf.', value: docs.filter((d: { confidentialityLevel?: string }) => d.confidentialityLevel === 'TRES_CONFIDENTIEL' || d.confidentialityLevel === 'TRÈS CONFIDENTIEL').length },
      ];

      const riskDistribution = [
        { name: 'Faible', value: dashboardStats?.low_risks ?? risks.filter((r: { severity?: string }) => r.severity === 'FAIBLE' || r.severity === 'BAS' || r.severity === 'LOW').length },
        { name: 'Moyen', value: dashboardStats?.medium_risks ?? risks.filter((r: { severity?: string }) => r.severity === 'MOYEN' || r.severity === 'MEDIUM').length },
        { name: 'Élevé', value: dashboardStats?.high_risks ?? risks.filter((r: { severity?: string }) => r.severity === 'ELEVE' || r.severity === 'HAUT' || r.severity === 'HIGH').length },
        { name: 'Critique', value: dashboardStats?.critical_risks ?? risks.filter((r: { severity?: string }) => r.severity === 'CRITIQUE' || r.severity === 'CRITICAL').length },
      ];

      const recStats = {
        validees: recs.filter((r: { status?: string }) => r.status === 'VALIDEE').length,
        rejetees: recs.filter((r: { status?: string }) => r.status === 'REJETEE').length,
        enCours: recs.filter((r: { status?: string }) => r.status === 'EN_COURS').length,
        terminees: recs.filter((r: { status?: string }) => r.status === 'TERMINEE').length,
      };

      const recDistribution = [
        { name: 'Validées', value: recStats.validees },
        { name: 'Rejetées', value: recStats.rejetees },
        { name: 'En cours', value: recStats.enCours },
        { name: 'Terminées', value: recStats.terminees },
      ];

      const topDocs = docs
        .filter((d: { confidentialityLevel?: string }) => d.confidentialityLevel === 'TRES_CONFIDENTIEL')
        .slice(0, 5)
        .map((d: { fileName: string }) => ({
          name: d.fileName.length > 20 ? d.fileName.substring(0, 20) + '...' : d.fileName,
        }));

      const lastDoc = docs
        .filter((d: { updatedAt?: string; createdAt?: string; modifiedDate?: string }) => d.updatedAt || d.createdAt || d.modifiedDate)
        .sort((a: { updatedAt?: string; createdAt?: string; modifiedDate?: string }, b: { updatedAt?: string; createdAt?: string; modifiedDate?: string }) => {
          const aTime = new Date(a.updatedAt || a.createdAt || a.modifiedDate || 0).getTime();
          const bTime = new Date(b.updatedAt || b.createdAt || b.modifiedDate || 0).getTime();
          return bTime - aTime;
        })[0];
      const lastDate = lastDoc?.updatedAt || lastDoc?.createdAt || lastDoc?.modifiedDate;
      setLastAnalysis(lastDate ? new Date(lastDate).toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }) : 'N/A');

      // Get last backup date
      let lastBackup = 'N/A';
      if (backups.length > 0) {
        const sortedBackups = backups.sort((a: { date: string }, b: { date: string }) => {
          const aTime = new Date(a.date).getTime();
          const bTime = new Date(b.date).getTime();
          return bTime - aTime;
        });
        const latestBackup = sortedBackups[0];
        const backupDate = new Date(latestBackup.date);
        if (!isNaN(backupDate.getTime())) {
          lastBackup = new Date(latestBackup.date).toLocaleString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
        }
      }

      setStats({
        documents: dashboardStats?.documents_count ?? docs.length,
        risks: dashboardStats?.risks_count ?? risks.length,
        pending: docs.filter((d: { analysisStatus: string }) => d.analysisStatus === 'PENDING').length,
        confidential: dashboardStats?.confidential_documents ?? docs.filter(
          (d: { confidentialityLevel?: string }) =>
            d.confidentialityLevel === 'CONFIDENTIEL' || d.confidentialityLevel === 'TRES_CONFIDENTIEL'
        ).length,
        recommendations: recs.length,
        assets: assets.length,
        reports: reports.length,
        validated: recs.filter((r: { status?: string }) => r.status === 'VALIDEE').length,
        rejected: recs.filter((r: { status?: string }) => r.status === 'REJETEE').length,
        users: dashboardStats?.users_count ?? userCount,
        roles: roleCount,
        lastBackup: lastBackup,
      });

      setChartData({
        confidential: confDistribution,
        risks: riskDistribution,
        recommendations: recDistribution,
        topDocuments: topDocs,
      });

      setRecStats(recStats);

      if (scorePayload) {
        setSecurityScore({
          overall: scorePayload.overallScore ?? null,
          compliance: scorePayload.complianceScore ?? null,
          documents: scorePayload.documentsScore ?? null,
        });
      } else {
        setSecurityScore({ overall: null, compliance: null, documents: null });
      }

      const highRisks = risks
        .filter((r: { severity?: string }) => r.severity === 'CRITIQUE' || r.severity === 'ELEVE')
        .sort((a: { severity?: string }, b: { severity?: string }) => {
          const order: Record<string, number> = { CRITIQUE: 0, ELEVE: 1, MOYEN: 2, FAIBLE: 3 };
          return (order[a.severity || ''] ?? 4) - (order[b.severity || ''] ?? 4);
        })
        .map((r: { id: number; title: string; description?: string; severity: string; category?: string; detectedAt: string }) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          severity: r.severity,
          category: r.category,
          detectedAt: r.detectedAt,
        }));
      setCriticalRisks(highRisks);

      const activityItems: ActivityItem[] = [
        ...risks.slice(0, 5).map((r: { id: number; title: string; description?: string; severity?: string; detectedAt: string }) => ({
          id: `risk-${r.id}`,
          type: 'risk' as const,
          title: r.title,
          description: r.description,
          timestamp: r.detectedAt,
          severity: r.severity,
        })),
        ...docs.slice(0, 5).map((d: { id: number; fileName: string; createdAt?: string; modifiedDate?: string }) => ({
          id: `doc-${d.id}`,
          type: 'document' as const,
          title: d.fileName,
          timestamp: d.createdAt || d.modifiedDate || new Date().toISOString(),
        })),
        ...recs.slice(0, 5).map((r: { id: number; description: string; riskTitle?: string; createdAt: string }) => ({
          id: `rec-${r.id}`,
          type: 'recommendation' as const,
          title: r.riskTitle || r.description.substring(0, 50),
          description: r.description,
          timestamp: r.createdAt,
        })),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
      setActivities(activityItems);

      setNotifications(
        notifs
          .filter((n: NotificationItem) => n && (n.title || n.message))
          .sort((a: NotificationItem, b: NotificationItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError('Impossible de charger les données du tableau de bord. Vérifiez que le backend est démarré.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const statCards = useMemo(
    () => [
      { label: 'Nombre d\'actifs', value: stats.assets, icon: HardDrive, color: '#8b5cf6' },
      { label: 'Documents analysés', value: stats.documents, icon: FileText, color: '#3b82f6' },
      { label: 'Documents confidentiels', value: stats.confidential, icon: Lock, color: '#06b6d4' },
      { label: 'Risques critiques', value: chartData.risks.find(r => r.name === 'Critique')?.value || 0, icon: ShieldAlert, color: '#ef4444' },
      { label: 'Risques moyens', value: chartData.risks.find(r => r.name === 'Moyen')?.value || 0, icon: ShieldAlert, color: '#f97316' },
      { label: 'Utilisateurs', value: stats.users, icon: Users, color: '#6366f1' },
      { label: 'Rôles', value: stats.roles, icon: Shield, color: '#8b5cf6' },
      { label: 'Heure système', value: currentTime, icon: Clock, color: '#10b981' },
    ],
    [stats, chartData.risks, lastAnalysis]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-80 rounded-xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vue d&apos;ensemble du Copilote RSSI —{' '}
            {stats.documents === 0 && stats.risks === 0
              ? 'Commencez par scanner un dossier'
              : `${stats.documents} documents, ${stats.risks} risques détectés`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {error ? 'Backend hors ligne' : 'Système opérationnel'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadStats(true)}
            disabled={isRefreshing}
            className="text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-xl border border-[hsl(350_45%_38%)]/30 bg-[hsl(350_45%_38%)]/10 p-4"
        >
          <p className="text-sm text-[hsl(350_45%_70%)] font-medium">{error}</p>
          <p className="text-xs text-[hsl(350_45%_58%)]/70 mt-1">
            Assurez-vous que le backend est démarré sur http://localhost:8080
          </p>
        </motion.div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {statCards.map((card, i) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            color={card.color}
            delay={i * 0.05}
          />
        ))}
      </div>

      {/* Scores + System status row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <SecurityScoreWidget
          title="Score sécurité"
          score={securityScore.overall}
          subtitle="Évaluation globale"
          documentsScore={securityScore.documents}
          delay={0.1}
        />
        <ComplianceScoreWidget
          title="Score conformité"
          score={securityScore.compliance}
          delay={0.15}
        />
        <SystemStatus
          backendOnline={backendOnline}
          lastAnalysis={lastAnalysis}
          pendingAnalysis={stats.pending}
        />
      </div>

      {/* Charts */}
      <DashboardCharts
        confidential={chartData.confidential}
        risks={chartData.risks}
        recommendations={chartData.recommendations}
      />

      {/* Quick actions + widgets row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="lg:col-span-2 xl:col-span-1">
          <QuickActions />
        </div>
        <div className="lg:col-span-2 xl:col-span-1 min-h-[380px]">
          <RecommendationsWidget stats={recStats} />
        </div>
        <div className="lg:col-span-2 xl:col-span-1 min-h-[380px]">
          <CriticalRisks risks={criticalRisks} totalRisks={stats.risks} />
        </div>
        <div className="lg:col-span-2 xl:col-span-1 min-h-[380px]">
          <NotificationsWidget notifications={notifications} />
        </div>
      </div>

      {/* Recent activities */}
      <div className="grid grid-cols-1 gap-4">
        <div className="min-h-[320px]">
          <RecentActivities activities={activities} />
        </div>
      </div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs text-muted-foreground text-center pb-4"
      >
        Les données sont calculées en temps réel depuis la base via le backend. Cliquez sur Actualiser pour forcer le rafraîchissement.
      </motion.p>
    </div>
  );
}
