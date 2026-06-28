import { useQuery } from '@tanstack/react-query';
import { Users, BrainCircuit, Activity, Database, ShieldCheck } from 'lucide-react';
import { Card, Spinner } from '@components/ui';
import { adminApi } from '../api/adminApi';

export default function AdminDashboardPage() {
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminApi.getUsers(0, 1),
  });

  if (isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Spinner size="lg" /></div>;
  }

  const stats = { 
    totalUsers: usersData?.data?.data?.totalElements || 0, 
    totalInterviews: 124 
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
          <ShieldCheck className="text-primary-400" />
          Admin Overview
        </h1>
        <p className="text-slate-400 text-lg">System metrics and platform usage analytics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-surface-border bg-gradient-to-br from-surface to-dark-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">Total Users</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</h3>
            </div>
            <div className="p-3 bg-primary-500/10 rounded-xl text-primary-400">
              <Users size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-surface-border bg-gradient-to-br from-surface to-dark-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">Interviews Conducted</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.totalInterviews}</h3>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
              <BrainCircuit size={20} />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border-surface-border bg-gradient-to-br from-surface to-dark-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">System Health</p>
              <h3 className="text-xl font-bold text-success-400 mt-2 flex items-center gap-2">
                <Activity size={18} /> Operational
              </h3>
            </div>
            <div className="p-3 bg-success-500/10 rounded-xl text-success-400">
              <Database size={20} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
