import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@components/ui';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="flex items-center justify-center gap-2 mb-12">
          <BrainCircuit className="text-primary-400" size={22} />
          <span className="font-bold gradient-text">AI Interview</span>
        </div>

        <div className="text-8xl font-black gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold mb-3">Page Not Found</h1>
        <p className="text-slate-400 text-sm mb-10 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link to="/">
            <Button leftIcon={<Home size={16} />}>Go Home</Button>
          </Link>
          <Button variant="outline" onClick={() => history.back()} leftIcon={<ArrowLeft size={16} />}>
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
