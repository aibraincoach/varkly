import { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { APP, ROUTES } from '../../constants/app';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-ground">
          <motion.div
            className="max-w-md w-full text-center rounded-2xl p-6 md:p-8 border border-line bg-white shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            role="alert"
            aria-live="assertive"
          >
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-2xl bg-ground border border-line">
                <AlertTriangle className="w-10 h-10 text-ink" strokeWidth={2} aria-hidden />
              </div>
            </div>
            <h1 className="text-xl font-bold text-ink mb-2">
              Something went wrong
            </h1>
            <p className="text-muted-1 text-sm mb-6">
              We're sorry. The app hit an error. You can try again or go back home.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                type="button"
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-xl transition-colors duration-200 bg-white text-ink border-2 border-line hover:border-ink active:scale-[0.98]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-4 h-4" strokeWidth={2.5} aria-hidden />
                Try again
              </motion.button>
              <a
                href={ROUTES.home}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-xl transition-colors duration-200 bg-ink text-ground border border-ink hover:bg-ink/90 active:scale-[0.98] w-full sm:w-auto"
              >
                Back to {APP.name}
              </a>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
