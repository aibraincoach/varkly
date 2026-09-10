import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { usePageMeta } from '../../hooks/usePageMeta';
import { APP, ROUTES } from '../../constants/app';

const NotFoundPage: React.FC = () => {
  usePageMeta('Page not found', `The page you're looking for doesn't exist. — ${APP.name}`);

  return (
    <div className="flex items-center justify-center p-4 min-h-[calc(100vh-3.5rem)]">
      <motion.div
        className="max-w-md w-full text-center rounded-2xl p-6 md:p-8 border border-line bg-surface shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-6xl font-bold text-ink mb-4" aria-hidden="true">
          404
        </h1>
        <h2 className="text-xl font-semibold text-ink mb-2">
          Page not found
        </h2>
        <p className="text-muted-1 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to={ROUTES.home}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 font-semibold rounded-xl transition-colors duration-200 bg-ink text-on-ink border border-ink hover:bg-ink-hover active:scale-[0.98]"
          aria-label="Back to home"
        >
          <Home className="w-4 h-4" strokeWidth={2.5} aria-hidden />
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
