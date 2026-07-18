import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page" style={{ padding: '40px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h2>Erreur d'affichage</h2>
            <p>Une erreur interne empêche l'affichage de cette page.</p>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#b91c1c' }}>
              {this.state.error?.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
