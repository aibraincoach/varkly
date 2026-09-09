import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QuizProvider } from './contexts/QuizContext';
import { ToastProvider } from './contexts/ToastContext';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/shared/ErrorBoundary';
import Toast from './components/shared/Toast';
import { ROUTES } from './constants/app';

const LandingPage = lazy(() => import('./components/landing/LandingPage'));
const QuizContainer = lazy(() => import('./components/quiz/QuizContainer'));
const ResultsPage = lazy(() => import('./components/results/ResultsPage'));
const NotFoundPage = lazy(() => import('./components/shared/NotFoundPage'));

const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-ground">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-vark-v border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-2">Loading…</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <QuizProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route
                path={ROUTES.home}
                element={
                  <AppLayout>
                    <LandingPage />
                  </AppLayout>
                }
              />
              <Route
                path={ROUTES.quiz}
                element={
                  <AppLayout>
                    <QuizContainer />
                  </AppLayout>
                }
              />
              <Route
                path={ROUTES.results}
                element={
                  <AppLayout>
                    <ResultsPage />
                  </AppLayout>
                }
              />
              <Route
                path="/r/:hash"
                element={
                  <AppLayout>
                    <ResultsPage />
                  </AppLayout>
                }
              />
              <Route
                path="*"
                element={
                  <AppLayout>
                    <NotFoundPage />
                  </AppLayout>
                }
              />
            </Routes>
          </Suspense>
          <Toast />
        </QuizProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
