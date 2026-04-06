'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/app/lib/apiClient';
import { User, Role, Team } from '@/app/types';
import { JoinTeamForm } from '@/app/components/team/JoinTeamForm';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'MANAGER' | 'USER' | 'hasTeam'>('all');
  const [view, setView] = useState<'users' | 'teams'>('users');

  useEffect(() => {
    // Basic route protection
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchUsersAndTeams = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [usersData, teamsData] = await Promise.all([
          apiClient('/api/user'),
          apiClient('/api/team').catch(() => ({ teams: [] })) // Graceful fallback
        ]);
        setUsers(usersData.users || []);
        setTeams(teamsData.teams || []);
      } catch (err: any) {
        // Normal users might get 403 on this endpoint depending on backend logic
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUsersAndTeams();
    }
  }, [user]);

  if (authLoading || !user) {
    return <div className="p-8 text-center text-slate-400">Loading dashboard...</div>;
  }

  const roleColors: Record<string, string> = {
    'SUPER_ADMIN': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    [Role.ADMIN]: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    [Role.MANAGER]: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    [Role.USER]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    try {
      setLoading(true);
      await apiClient(`/api/user/${targetUserId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole })
      });
      // Refresh both users and teams to keep counts accurate
      const [usersData, teamsData] = await Promise.all([
        apiClient('/api/user'),
        apiClient('/api/team').catch(() => ({ teams: [] }))
      ]);
      setUsers(usersData.users || []);
      setTeams(teamsData.teams || []);
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamChange = async (targetUserId: string, teamId: string) => {
    try {
      setLoading(true);
      await apiClient(`/api/user/${targetUserId}/team`, {
        method: 'PATCH',
        body: JSON.stringify({ teamId: teamId || null })
      });
      // Refresh both users and teams to keep counts accurate
      const [usersData, teamsData] = await Promise.all([
        apiClient('/api/user'),
        apiClient('/api/team').catch(() => ({ teams: [] }))
      ]);
      setUsers(usersData.users || []);
      setTeams(teamsData.teams || []);
    } catch (err: any) {
      alert(err.message || 'Failed to assign team');
    } finally {
      setLoading(false);
    }
  };

  const stats = user.role === Role.ADMIN ? {
    totalUsers: users.length,
    totalManagers: users.filter(u => u.role === Role.MANAGER).length,
    totalRegularUsers: users.filter(u => u.role === Role.USER).length,
    totalTeams: teams.length
  } : null;

  const filteredUsers = users.filter(u => {
    if (filter === 'MANAGER') return u.role === Role.MANAGER;
    if (filter === 'USER') return u.role === Role.USER;
    if (filter === 'hasTeam') return !!u.teamId;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400 font-medium">
            Welcome back, <strong className="text-slate-200">{user.name}</strong>. Here is your dashboard overview.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`px-4 py-1 border rounded-full text-sm font-bold ${roleColors[user.role] || roleColors[Role.USER]}`}>
            Role: {user.role}
          </div>
          <div className="px-4 py-1 border border-slate-700 bg-slate-800 rounded-full text-sm font-medium text-slate-300">
            Team: {user.team?.name ? `${user.team.name} (${(teams.find(t => t.id === user.teamId) as any)?._count?.members || 0} Members)` : 'No Team Assigned'}
          </div>
        </div>
      </div>

      {!user.teamId && (
        <div className="max-w-md mb-8">
            <JoinTeamForm />
        </div>
      )}

      {/* Admin Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => {
              setFilter('all');
              setView('users');
            }}
            className={`text-left bg-[#1e293b] border p-5 rounded-xl shadow-lg transition-all ${view === 'users' && filter === 'all' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-800 hover:border-slate-700'}`}
          >
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Users</p>
            <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
          </button>
          <button 
            onClick={() => {
              setFilter('MANAGER');
              setView('users');
            }}
            className={`text-left bg-[#1e293b] border p-5 rounded-xl shadow-lg transition-all ${view === 'users' && filter === 'MANAGER' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-800 hover:border-slate-700'}`}
          >
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Managers</p>
            <p className="text-3xl font-bold text-emerald-400">{stats.totalManagers}</p>
          </button>
          <button 
            onClick={() => {
              setFilter('USER');
              setView('users');
            }}
            className={`text-left bg-[#1e293b] border p-5 rounded-xl shadow-lg transition-all ${view === 'users' && filter === 'USER' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-800 hover:border-slate-700'}`}
          >
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Regular Users</p>
            <p className="text-3xl font-bold text-blue-400">{stats.totalRegularUsers}</p>
          </button>
          <button 
            onClick={() => setView('teams')}
            className={`text-left bg-[#1e293b] border p-5 rounded-xl shadow-lg transition-all ${view === 'teams' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-800 hover:border-slate-700'}`}
          >
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Active Teams</p>
            <p className="text-3xl font-bold text-white">{stats.totalTeams}</p>
          </button>
        </div>
      )}

      <div className="bg-[#1e293b] rounded-xl border border-slate-800 shadow-xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0f172a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">
              {view === 'users' ? (
                <>
                  {filter === 'all' && 'System Users & Team Members'}
                  {filter === 'MANAGER' && 'System Managers'}
                  {filter === 'USER' && 'Regular Team Users'}
                  {filter === 'hasTeam' && 'Assigned Team Members'}
                </>
              ) : (
                'System Teams Overview'
              )}
            </h2>
            {view === 'users' && filter !== 'all' && (
              <button 
                onClick={() => setFilter('all')}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded transition-colors"
              >
                Clear Filter
              </button>
            )}
            {view === 'teams' && (
              <button 
                onClick={() => setView('users')}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded transition-colors"
              >
                Back to Users
              </button>
            )}
          </div>
          <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
            {view === 'users' ? `${filteredUsers.length} Users` : `${teams.length} Teams`} Found
          </span>
        </div>
        
        <div className="p-6">
          {error ? (
            <div className="text-center py-10 bg-red-500/5 rounded-lg border border-red-500/20">
              <p className="text-red-400 font-medium">Access Restricted</p>
              <p className="text-sm text-red-500/70 mt-1">{error}</p>
              <p className="text-xs text-slate-500 mt-4">Your current role ({user.role}) might not have permission to view this data.</p>
            </div>
          ) : loading ? (
            <div className="text-center py-10 text-slate-400">Loading directory...</div>
          ) : view === 'users' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Team</th>
                    {user.role === Role.ADMIN && (
                      <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id} className={`border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors ${i === filteredUsers.length - 1 ? 'border-b-0' : ''}`}>
                      <td className="px-4 py-4 font-medium text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        {u.name} {u.id === user.id && <span className="text-xs font-normal text-slate-500 ml-2">(You)</span>}
                      </td>
                      <td className="px-4 py-4 break-all">{u.email}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 text-xs rounded-full border whitespace-nowrap ${roleColors[u.role] || roleColors[Role.USER]}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                         {editingTeam === u.id ? (
                           <select
                               onChange={(e) => {
                                 handleTeamChange(u.id, e.target.value);
                                 setEditingTeam(null);
                               }}
                               onBlur={() => setEditingTeam(null)}
                               value={u.teamId || ""}
                               className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 max-w-[120px] rounded focus:outline-none focus:border-blue-500 cursor-pointer"
                               autoFocus
                             >
                                <option value="">No Team</option>
                                {teams.map(t => (
                                  <option key={t.id} value={t.id}>{t.name} ({(t as any)._count?.members || 0})</option>
                                ))}
                           </select>
                         ) : u.team ? (
                           <div className="flex items-center gap-2 whitespace-nowrap">
                             <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                             {u.team.name}
                             
                             {user.role === Role.ADMIN && u.role !== Role.ADMIN && (
                               <button onClick={() => setEditingTeam(u.id)} className="ml-1 text-slate-500 hover:text-white transition-colors" title="Change Team">
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                   <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                 </svg>
                               </button>
                             )}
                           </div>
                         ) : (
                           <div className="flex items-center gap-2">
                             <span className="text-slate-500 italic whitespace-nowrap">No Team</span>
                             {user.role === Role.ADMIN && u.role !== Role.ADMIN && (
                               <button onClick={() => setEditingTeam(u.id)} className="text-blue-500 hover:text-blue-400 transition-colors" title="Assign Team">
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                 </svg>
                               </button>
                             )}
                           </div>
                         )}
                      </td>
                      {user.role === Role.ADMIN && (
                        <td className="px-4 py-4">
                           {u.role !== Role.ADMIN ? (
                             <select
                               onChange={(e) => handleRoleChange(u.id, e.target.value)}
                               value={u.role}
                               className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded focus:outline-none focus:border-blue-500 cursor-pointer"
                             >
                                <option value={Role.USER}>User</option>
                                <option value={Role.MANAGER}>Manager</option>
                             </select>
                           ) : (
                             <span className="text-slate-600 italic text-xs">No Actions available</span>
                           )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Teams Table View */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Team Name</th>
                    <th className="px-4 py-3">Team Code</th>
                    <th className="px-4 py-3 rounded-tr-lg">Members</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t, i) => (
                    <tr key={t.id} className={`border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors ${i === teams.length - 1 ? 'border-b-0' : ''}`}>
                      <td className="px-4 py-4 font-medium text-white flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        {t.name}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-slate-400">{t.code}</td>
                      <td className="px-4 py-4">
                        <span className="bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-slate-300 border border-slate-700">
                          {(t as any)._count?.members || 0} Members
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
