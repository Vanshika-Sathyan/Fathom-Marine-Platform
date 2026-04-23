import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listCredentials, issueCredential, verifyCredential, revokeCredential } from '../api';
import toast from 'react-hot-toast';
import { Plus, Search, Shield, Trash2, Award } from 'lucide-react';

export default function Credentials() {
  const queryClient = useQueryClient();
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [verifyId, setVerifyId] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [form, setForm] = useState({ workerEmail: '', credentialType: '', expiresAt: '' });

  const { data, isLoading } = useQuery({ queryKey: ['credentials'], queryFn: () => listCredentials() });

  const issueMutation = useMutation({
    mutationFn: issueCredential,
    onSuccess: (res) => {
      toast.success(`Credential issued! ID: ${res.data.credentialId}`);
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
      setShowIssueModal(false);
      setForm({ workerEmail: '', credentialType: '', expiresAt: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to issue credential')
  });

  const revokeMutation = useMutation({
    mutationFn: revokeCredential,
    onSuccess: () => {
      toast.success('Credential revoked');
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    }
  });

  const handleVerify = async () => {
    if (!verifyId) return;
    try {
      const res = await verifyCredential(verifyId);
      setVerifyResult(res.data);
    } catch (e: any) {
      setVerifyResult({ valid: false, error: 'Not found' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Credential Management</h2>
        <button onClick={() => setShowIssueModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
          <Plus size={16} /> Issue Credential
        </button>
      </div>

      {/* Verification Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Shield size={18} /> Verify Credential</h3>
        <div className="flex gap-3">
          <input value={verifyId} onChange={e => setVerifyId(e.target.value)}
            placeholder="Enter Credential ID (e.g. CRED-ABC12345)"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          <button onClick={handleVerify} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm">
            Verify
          </button>
        </div>
        {verifyResult && (
          <div className={`mt-3 p-3 rounded-lg ${verifyResult.valid ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
            {verifyResult.valid ? (
              <div className="text-sm text-green-400">
                ✅ Valid credential for <strong>{verifyResult.credential?.workerName}</strong> — {verifyResult.credential?.credentialType}
              </div>
            ) : (
              <div className="text-sm text-red-400">❌ {verifyResult.error || 'Invalid credential'}</div>
            )}
          </div>
        )}
      </div>

      {/* Credentials Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <Award size={18} className="text-blue-400" />
          <h3 className="font-semibold text-white">All Credentials ({data?.data?.total || 0})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800">
              <tr>
                {['Credential ID', 'Worker', 'Type', 'Issued By', 'Issued', 'Expires', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : data?.data?.credentials?.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono text-blue-400">{c.credentialId}</td>
                  <td className="px-4 py-3">
                    <p className="text-white">{c.workerName}</p>
                    <p className="text-slate-400 text-xs">{c.workerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{c.credentialType}</td>
                  <td className="px-4 py-3 text-slate-400">{c.issuedBy}</td>
                  <td className="px-4 py-3 text-slate-400">{new Date(c.issuedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-400">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      c.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      c.status === 'expired' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {c.status === 'active' && (
                      <button onClick={() => revokeMutation.mutate(c.credentialId)}
                        className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Issue New Credential</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Worker Email</label>
                <input value={form.workerEmail} onChange={e => setForm({...form, workerEmail: e.target.value})}
                  placeholder="worker@fathom.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Credential Type</label>
                <select value={form.credentialType} onChange={e => setForm({...form, credentialType: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                  <option value="">Select type...</option>
                  <option>STCW Basic Safety</option>
                  <option>STCW Advanced Firefighting</option>
                  <option>Medical First Aid</option>
                  <option>Tanker Safety</option>
                  <option>Officer of the Watch</option>
                  <option>Dynamic Positioning</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Expires At (optional)</label>
                <input type="date" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowIssueModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={() => issueMutation.mutate(form)}
                disabled={issueMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium">
                {issueMutation.isPending ? 'Issuing...' : 'Issue Credential'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}