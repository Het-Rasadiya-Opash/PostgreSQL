'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Team Access Control Demo</h1>
            <p className="text-slate-300 mb-8 text-sm md:text-base">
                This demo showcases Next.js 16 access control features with role-based permissions.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Features Card */}
                <div className="bg-[#1e293b] p-6 border border-slate-700 rounded-lg shadow-sm">
                    <h3 className="text-white font-semibold mb-4 text-lg">Features Demonstrated</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-slate-300">
                        <li>Role-based access control (RBAC)</li>
                        <li>Route protection with middleware</li>
                        <li>Server-side permission checks</li>
                        <li>Client-side permission hooks</li>
                        <li>Dynamic route access</li>
                    </ul>
                </div>

                {/* Roles Card */}
                <div className="bg-[#1e293b] p-6 border border-slate-700 rounded-lg shadow-sm">
                    <h3 className="text-white font-semibold mb-4 text-lg">User Roles</h3>
                    <div className="space-y-3 text-sm text-slate-300">
                        <div><span className="text-purple-400 font-semibold">SUPER_ADMIN:</span> Full system access</div>
                        <div><span className="text-emerald-400 font-semibold">ADMIN:</span> User &amp; team management</div>
                        <div><span className="text-amber-400 font-semibold">MANAGER:</span> Team-specific management</div>
                        <div><span className="text-blue-400 font-semibold">USER:</span> Basic dashboard access</div>
                    </div>
                </div>
            </div>

            {/* Login / Actions Card */}
            {user ? (
                <div className="space-y-6">
                    <div className="bg-[#1e293b] p-6 border border-emerald-500/30 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-slate-300">
                                    Welcome back, <strong className="text-white">{user.name}</strong>!
                                </p>
                                <p className="text-sm text-slate-400">
                                    You are logged in as <strong className="text-emerald-400 font-medium">{user.role}</strong>.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/dashboard"
                            className="inline-flex justify-center whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-5 rounded transition-colors text-sm shrink-0"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-900/50 p-6 border border-blue-900 rounded-lg shadow-sm">
                    <p className="text-slate-300 mb-4">You are not logged in.</p>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded transition-colors text-sm"
                        >
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className="bg-transparent border border-slate-700 hover:bg-slate-800 text-white font-medium py-2 px-5 rounded transition-colors text-sm"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
