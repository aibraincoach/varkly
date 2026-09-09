import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { APP, ROUTES } from '../../constants/app';

const AppNav: React.FC = () => {
  return (
    <motion.nav
      className="sticky top-0 z-40 bg-ground/90 backdrop-blur-xl border-b border-line shadow-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      role="navigation"
      aria-label="Main"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link
          to={ROUTES.home}
          className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground transition-opacity hover:opacity-90"
          aria-label={`${APP.name} — Home`}
        >
          <img src="/varkly-icon.svg" alt="" className="h-8 w-8" aria-hidden />
          <span className="text-lg font-semibold text-ink tracking-tight">
            {APP.name}
          </span>
        </Link>
      </div>
    </motion.nav>
  );
};

export default AppNav;
