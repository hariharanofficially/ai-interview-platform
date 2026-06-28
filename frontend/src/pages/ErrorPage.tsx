import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@components/ui';

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 text-center">
      <div>
        <AlertTriangle size={56} className="text-danger-400 mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-3">Something Went Wrong</h1>
        <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto">
          An unexpected error occurred. Our team has been notified. Please try again.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button onClick={() => window.location.reload()}>Try Again</Button>
          <Link to="/"><Button variant="outline">Go Home</Button></Link>
        </div>
      </div>
    </div>
  );
}
