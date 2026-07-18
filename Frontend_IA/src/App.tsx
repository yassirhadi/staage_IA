import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './layouts/Layout';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import AssetsPage from './pages/AssetsPage';
import RisksPage from './pages/RisksPage';
import CopilotPage from './pages/CopilotPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ReportsPage from './pages/ReportsPage';
import ReferentialsPage from './pages/ReferentialsPage';
import AuditPage from './pages/AuditPage';
import FoldersPage from './pages/FoldersPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminRolesPage from './pages/AdminRolesPage';
import PermissionsPage from './pages/PermissionsPage';
import BackupsPage from './pages/BackupsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminProfilePage from './pages/AdminProfilePage';
import HistoryPage from './pages/HistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import SecurityScorePage from './pages/SecurityScorePage';
import SensitiveDataPage from './pages/SensitiveDataPage';
import DocumentsPage from './pages/DocumentsPage';
import ClassificationPage from './pages/ClassificationPage';
import ChatHistoryPage from './pages/ChatHistoryPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/classification" element={<ClassificationPage />} />
            <Route path="/sensitive-data" element={<SensitiveDataPage />} />
            <Route path="/risks" element={<RisksPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/copilot" element={<CopilotPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/chat-history" element={<ChatHistoryPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/referentials" element={<ReferentialsPage />} />
            <Route path="/profile" element={<AdminProfilePage />} />
          </Route>
            <Route element={<AdminRoute />}>
              <Route element={<Layout />}>
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/roles" element={<AdminRolesPage />} />
                <Route path="/admin/permissions" element={<PermissionsPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
                <Route path="/admin/backups" element={<BackupsPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;