import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { listCredentials, getWellbeingDashboard } from '../api';
import { Award, Users, BookOpen, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { data: credData } = useQuery({ queryKey: ['credentials'], queryFn: () => listCredentials() });
  const { data: wbData } = useQuery({ queryKey: ['wellbeing'], queryFn: () => getWellbeingDashboard() });

  const stats = [
    { label: 'Total Credentials', value: credData?.data?.total || 0, icon: Award, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Active Credentials', value: credData?.data?.credentials?.filter((c: any) => c.status === 'active').length || 0, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Wellbeing Score', value: wbData?.data?.averageWellbeingScore?.toFixed(1) || '—', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'At Risk Workers', value: wbData?.data?.atRiskCount || 0, icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Welcome back, {user.name} 👋</h2>
        <p className="text-slate-400 mt-1">Here's your platform overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className={`${bg} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={color} size={20} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-slate-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Recent Credentials</h3>
        <div className="space-y-3">
          {credData?.data?.credentials?.slice(0, 5).map((c: any) => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-white">{c.workerName}</p>
                <p className="text-xs text-slate-400">{c.credentialType} · {c.credentialId}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                c.status === 'active' ? 'bg-green-500/20 text-green-400' :
                c.status === 'expired' ? 'bg-orange-500/20 text-orange-400' :
                'bg-red-500/20 text-red-400'
              }`}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}