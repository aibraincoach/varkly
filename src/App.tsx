import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QuizProvider } from './contexts/QuizContext';
import { ToastProvider } from './contexts/ToastContext';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/shared/ErrorBoundary';
import Toast from './components/shared/Toast';
import { ROUTES } from './constants/app';

const PanelsScreen = lazy(() => import('./components/panels/PanelsScreen'));
const NotFoundPage = lazy(() => import('./components/shared/NotFoundPage'));

const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-ground">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-vark-v border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-2">Loading…</p>
    </div>
  </div>
);

const panelsRoute = (
  <AppLayout>
    <PanelsScreen />
  </AppLayout>
);

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <QuizProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path={ROUTES.home} element={panelsRoute} />
              <Route path={ROUTES.about} element={panelsRoute} />
              <Route path={ROUTES.quiz} element={panelsRoute} />
              <Route path={ROUTES.results} element={panelsRoute} />
              <Route path={ROUTES.prompts} element={panelsRoute} />
              <Route path="/r/:hash" element={panelsRoute} />
              <Route path="/r/:hash/prompts" element={panelsRoute} />
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
