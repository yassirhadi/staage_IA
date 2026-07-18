import apiClient, { aiClient } from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'RSSI';
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data),
  me: () => apiClient.get<ApiResponse<AuthResponse>>('/auth/me'),
  getUsers: () => apiClient.get('/auth/users'),
  verifyEmail: (email: string) =>
    apiClient.post<ApiResponse<boolean>>('/auth/verify-email', { email }),
  resetPasswordWithEmail: (email: string, newPassword: string, confirmPassword: string) =>
    apiClient.post('/auth/reset-password-with-email', { email, newPassword, confirmPassword }),
};

export const adminApi = {
  createUser: (data: object) => apiClient.post('/admin/users', data),
  updateUser: (id: number, data: object) => apiClient.put(`/admin/users/${id}`, data),
  deleteUser: (id: number) => apiClient.delete(`/admin/users/${id}`),
  resetPassword: (id: number, newPassword: string) =>
    apiClient.post(`/admin/users/${id}/reset-password`, { newPassword }),
  getAuditLogs: () => apiClient.get('/admin/audit-logs'),

  // Roles
  getRoles: () => apiClient.get('/admin/roles'),
  getRole: (id: number) => apiClient.get(`/admin/roles/${id}`),
  createRole: (data: object) => apiClient.post('/admin/roles', data),
  updateRole: (id: number, data: object) => apiClient.put(`/admin/roles/${id}`, data),
  deleteRole: (id: number) => apiClient.delete(`/admin/roles/${id}`),

  // Permissions
  getPermissions: () => apiClient.get('/admin/permissions'),
  getPermission: (id: number) => apiClient.get(`/admin/permissions/${id}`),
  createPermission: (data: object) => apiClient.post('/admin/permissions', data),
  updatePermission: (id: number, data: object) => apiClient.put(`/admin/permissions/${id}`, data),
  deletePermission: (id: number) => apiClient.delete(`/admin/permissions/${id}`),

  // Referentials
  getReferentials: () => apiClient.get('/admin/referentials'),
  getReferential: (id: number) => apiClient.get(`/admin/referentials/${id}`),
  createReferential: (data: object) => apiClient.post('/admin/referentials', data),
  updateReferential: (id: number, data: object) => apiClient.put(`/admin/referentials/${id}`, data),
  deleteReferential: (id: number) => apiClient.delete(`/admin/referentials/${id}`),

  // Folders
  getFolders: () => apiClient.get('/admin/folders'),
  getFolder: (id: number) => apiClient.get(`/admin/folders/${id}`),
  createFolder: (data: object) => apiClient.post('/admin/folders', data),
  updateFolder: (id: number, data: object) => apiClient.put(`/admin/folders/${id}`, data),
  deleteFolder: (id: number) => apiClient.delete(`/admin/folders/${id}`),

  // Settings
  getSettings: () => apiClient.get('/admin/settings'),
  updateSettings: (data: object) => apiClient.put('/admin/settings', data),

  // Backups
  createBackup: () => apiClient.post('/admin/backups/create'),
  getBackups: () => apiClient.get('/admin/backups'),
  downloadBackup: (filename: string) =>
    apiClient.get(`/admin/backups/download/${filename}`, { responseType: 'blob' }),
  restoreBackup: (filename: string) =>
    apiClient.post(`/admin/backups/restore/${filename}`),
  deleteBackup: (filename: string) =>
    apiClient.delete(`/admin/backups/${filename}`),
};

export const inventoryApi = {
  scan: (directoryPath: string) =>
    apiClient.post('/inventory/scan', { directoryPath }),
  getDocuments: () => apiClient.get('/inventory/documents'),
  analyzeDocument: (id: number) => apiClient.post(`/inventory/documents/${id}/analyze`),
  deleteDocument: (id: number) => apiClient.delete(`/inventory/documents/${id}`),
  preview: (id: number) => apiClient.get(`/inventory/documents/${id}/preview`, { responseType: 'blob' }),
  download: (id: number) => apiClient.get(`/inventory/documents/${id}/download`, { responseType: 'blob' }),
  getAnalysisResult: (id: number) => apiClient.get(`/analysis-results/document/${id}`),
};

export const assetsApi = {
  getAll: () => apiClient.get('/assets'),
  create: (data: object) => apiClient.post('/assets', data),
};

export const aiApi = {
  chat: (action: string, data?: object) => {
    if (action === 'get_history') {
      return aiClient.get('/history'); // Correct endpoint: /api/v1/history
    }
    return aiClient.post('/chat', data || {}); // Correct endpoint: /api/v1/chat
  },
  getDashboardStats: () => aiClient.get('/dashboard-stats'), // Get real stats from database
  getRisks: () => apiClient.get('/risks'), // Use Spring Boot backend for risks
};

export const rssiApi = {
  getRecommendations: () => apiClient.get('/rssi/recommendations'),
  updateRecommendation: (id: number, status: string) =>
    apiClient.put(`/rssi/recommendations/${id}/status`, { status }),
  generateReport: (reportType: string) =>
    apiClient.post('/rssi/reports/generate', { reportType }),
  getReports: () => apiClient.get('/rssi/reports'),
  exportExcel: () =>
    apiClient.get('/rssi/reports/export/excel', { responseType: 'blob' }),
  getReferentials: () => apiClient.get('/rssi/referentials'),
  getFolders: () => apiClient.get('/rssi/folders'),
  getAuditLogs: () => apiClient.get('/rssi/audit-logs'),
  getNotifications: () => apiClient.get('/notifications'),
};

export const securityApi = {
  getLatest: () => apiClient.get('/security-scores/latest'),
  calculate: () => apiClient.post('/security-scores/calculate'),
};
