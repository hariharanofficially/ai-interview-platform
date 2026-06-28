import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CheckCircle, Ban, Search, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Input, Spinner } from '@components/ui';
import { adminApi, type UserAdminResponse } from '../api/adminApi';

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const size = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, size],
    queryFn: () => adminApi.getUsers(page, size),
  });

  const pagedData = data?.data?.data;

  const { mutate: suspendUser } = useMutation({
    mutationFn: (id: string) => adminApi.suspendUser(id),
    onSuccess: () => {
      toast.success('User suspended');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Failed to suspend user'),
  });

  const { mutate: activateUser } = useMutation({
    mutationFn: (id: string) => adminApi.activateUser(id),
    onSuccess: () => {
      toast.success('User activated');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Failed to activate user'),
  });

  if (isLoading || !pagedData) {
    return <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">User Management</h1>
          <p className="text-slate-400 text-sm">View and manage all registered users on the platform.</p>
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder="Search users..." 
            leftIcon={<Search size={16} />}
            className="w-full sm:w-64"
          />
          <button className="p-2.5 bg-dark-800 border border-white/[0.08] rounded-xl text-slate-300 hover:text-white hover:border-white/20 transition-colors">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-dark-800/50 text-slate-400 border-b border-white/[0.06]">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {pagedData.content.map((user: UserAdminResponse) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-200">{user.firstName} {user.lastName}</div>
                    <div className="text-slate-400 text-xs">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                      ${user.role === 'ADMIN' ? 'bg-primary-500/20 text-primary-400' : 'bg-slate-800 text-slate-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.active ? (
                      <span className="inline-flex items-center gap-1.5 text-success-400 text-xs font-medium">
                        <CheckCircle size={14} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-danger-400 text-xs font-medium">
                        <Ban size={14} /> Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.active ? (
                        <button 
                          onClick={() => suspendUser(user.id)}
                          className="text-xs font-medium text-danger-400 hover:text-danger-300 px-3 py-1.5 bg-danger-400/10 hover:bg-danger-400/20 rounded-md transition-colors"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button 
                          onClick={() => activateUser(user.id)}
                          className="text-xs font-medium text-success-400 hover:text-success-300 px-3 py-1.5 bg-success-400/10 hover:bg-success-400/20 rounded-md transition-colors"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing <span className="font-medium text-slate-200">{page * size + 1}</span> to <span className="font-medium text-slate-200">{Math.min((page + 1) * size, pagedData.totalElements)}</span> of <span className="font-medium text-slate-200">{pagedData.totalElements}</span> results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-sm bg-dark-800 border border-white/[0.08] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={pagedData.last}
              className="px-3 py-1.5 text-sm bg-dark-800 border border-white/[0.08] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
