import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ATTRAD ErrorBoundary] Runtime Error caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
          <div className="bg-slate-900/90 border border-rose-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl backdrop-blur-xl animate-fade-in space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                {this.props.fallbackTitle || 'Ocurrió un problema en la vista'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                La aplicación capturó un fallo imprevisto y lo contuvo de forma segura para proteger la sesión.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-left">
                <div className="text-[10px] font-mono text-rose-300 break-words">
                  {this.state.error.message || 'Error desconocido'}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recargar Vista</span>
              </button>
              <button
                onClick={() => {
                  window.location.href = window.location.pathname;
                }}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Volver a inicio"
              >
                <Home className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
