import React from 'react';
import AppFooter from './AppFooter';

type AppLayoutProps = {
  children: React.ReactNode;
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-ink focus:text-white focus:rounded-lg focus:outline-none"
      >
        Skip to content
      </a>
      <main id="main" className="flex-1">
        {children}
      </main>
      <AppFooter />
    </div>
  );
};

export default AppLayout;
