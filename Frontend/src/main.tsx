import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

// Global Error Boundary to prevent white screen of death
class GlobalErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-background p-6 font-sans">
          <div className="p-8 bg-white dark:bg-background rounded-[2rem] shadow-xl border border-gray-100 dark:border-white/10 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Ops! Algo deu errado.</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
              Encontramos um erro inesperado ao carregar a aplicação. Nossa equipe já foi notificada.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#8CE600] text-gray-950 px-6 py-4 rounded-xl font-bold text-sm uppercase tracking-widest w-full hover:bg-[#7bc900] transition-colors shadow-lg shadow-[#8CE600]/20"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>,
)



