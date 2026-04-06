'use client';

import React, { useState } from 'react';
import { apiClient } from '@/app/lib/apiClient';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export const JoinTeamForm = () => {
    const [teamCode, setTeamCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const { user, refreshUser } = useAuth();
    const router = useRouter();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamCode.trim()) return;

        setLoading(true);
        setMessage(null);

        try {
            const data = await apiClient('/api/team', {
                method: 'POST',
                body: JSON.stringify({ teamCode }),
            });

            setMessage({ type: 'success', text: data.message });
            setTeamCode('');
            
            // Refresh to update user team info in AuthContext
            await refreshUser();
            
            // Also refresh router for server components if any
            router.refresh();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to join team' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="bg-[#1e293b] p-6 border border-slate-700 rounded-lg shadow-sm">
            <h3 className="text-white font-semibold mb-2 text-lg">Join a Team</h3>
            <p className="text-slate-400 text-sm mb-4">
                Enter a team code to join an existing team.
            </p>
            
            <form onSubmit={handleJoin} className="space-y-4">
                <div>
                    <input
                        type="text"
                        value={teamCode}
                        onChange={(e) => setTeamCode(e.target.value)}
                        placeholder="Enter Join Code (e.g. TEAM-123)"
                        disabled={loading}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                </div>
                
                {message && (
                    <div className={`p-3 rounded text-sm ${
                        message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !teamCode.trim()}
                    className={`w-full py-2 px-4 rounded font-medium transition-all flex items-center justify-center gap-2 ${
                        loading || !teamCode.trim() 
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
                    }`}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Joining...
                        </>
                    ) : 'Join Team'}
                </button>
            </form>
        </div>
    );
};
