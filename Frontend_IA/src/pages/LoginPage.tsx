import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, User, Lock, Eye, EyeOff, Loader2, AlertCircle, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { authApi } from '@/api/services';

export default function LoginPage() {
  const [view, setView] = useState<'login' | 'forgot-email' | 'forgot-password'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Forgot Password state
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch {
      setError('Identifiants invalides. Vérifiez votre nom d\'utilisateur et mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await authApi.verifyEmail(email);
      if (response.data.data) {
        setView('forgot-password');
      } else {
        setError('Aucun utilisateur trouvé avec cet email.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la vérification de l\'email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authApi.resetPasswordWithEmail(email, newPassword, confirmPassword);
      setSuccess('Mot de passe mis à jour avec succès ! Vous pouvez maintenant vous connecter.');
      setTimeout(() => {
        setView('login');
        setEmail('');
        setNewPassword('');
        setConfirmPassword('');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[hsl(222_28%_7%)]">
      {/* Background layers — gold + navy, the app's signature look */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(216,168,74,0.22),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(107,140,155,0.16),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_0%_80%,rgba(216,168,74,0.12),transparent)]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Animated orbs */}
        <motion.div
          className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-[hsl(168_40%_42%)]/16 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Scan line */}
        <motion.div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Logo & header */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20"
            >
              <Shield className="h-8 w-8 text-primary" />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Copilot <span className="text-gradient">RSSI</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Security Operations Center — Connexion sécurisée
            </p>
          </div>

          {/* Login card */}
          <div className="glass-card gradient-border rounded-2xl p-8 shadow-2xl">
            {view === 'login' ? (
              <>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Authentification</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Saisissez vos identifiants pour accéder à la plateforme
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  {/* Username */}
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium text-foreground">
                      Nom d'utilisateur
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin ou rssi"
                        required
                        autoComplete="username"
                        className={cn(
                          'flex h-11 w-full rounded-lg border border-border bg-background/50 pl-10 pr-4 text-sm',
                          'text-foreground placeholder:text-muted-foreground/60',
                          'transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20'
                        )}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        className={cn(
                          'flex h-11 w-full rounded-lg border border-border bg-background/50 pl-10 pr-11 text-sm',
                          'text-foreground placeholder:text-muted-foreground/60',
                          'transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <Button type="submit" disabled={loading} className="h-11 w-full text-sm font-semibold" size="lg">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connexion en cours...
                      </>
                    ) : (
                      'Se connecter'
                    )}
                  </Button>

                  {/* Forgot Password link */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setView('forgot-email')}
                      className="text-sm text-primary hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                </form>
              </>
            ) : view === 'forgot-email' ? (
              <>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Vérification de l'email</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Entrez votre email pour vérifier votre compte
                  </p>
                </div>

                <form onSubmit={handleVerifyEmailSubmit} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        required
                        className={cn(
                          'flex h-11 w-full rounded-lg border border-border bg-background/50 pl-10 pr-4 text-sm',
                          'text-foreground placeholder:text-muted-foreground/60',
                          'transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20'
                        )}
                      />
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setView('login')} className="flex-1">
                      Retour
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Vérification...
                        </>
                      ) : (
                        'Vérifier'
                      )}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Réinitialisation du mot de passe</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choisissez votre nouveau mot de passe
                  </p>
                </div>

                <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
                  {/* New Password */}
                  <div className="space-y-2">
                    <label htmlFor="new-password" className="text-sm font-medium text-foreground">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className={cn(
                          'flex h-11 w-full rounded-lg border border-border bg-background/50 pl-10 pr-4 text-sm',
                          'text-foreground placeholder:text-muted-foreground/60',
                          'transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20'
                        )}
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className={cn(
                          'flex h-11 w-full rounded-lg border border-border bg-background/50 pl-10 pr-4 text-sm',
                          'text-foreground placeholder:text-muted-foreground/60',
                          'transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20'
                        )}
                      />
                    </div>
                  </div>

                  {/* Error / Success */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2.5 text-sm text-green-600"
                    >
                      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {success}
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setView('forgot-email')} className="flex-1">
                      Retour
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Chargement...
                        </>
                      ) : (
                        'Réinitialiser'
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}

            {/* Demo accounts */}
            <div className="mt-6 rounded-lg border border-border/50 bg-muted/30 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Comptes de démonstration
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between rounded-md bg-background/40 px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Administrateur</span>
                  <code className="font-mono text-foreground">admin / admin123</code>
                </div>
                <div className="flex items-center justify-between rounded-md bg-background/40 px-3 py-2 text-xs">
                  <span className="text-muted-foreground">RSSI</span>
                  <code className="font-mono text-foreground">rssi / rssi123</code>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground/60">
            © 2026 Copilot RSSI — Plateforme de cybersécurité
          </p>
        </motion.div>
      </div>
    </div>
  );
}
