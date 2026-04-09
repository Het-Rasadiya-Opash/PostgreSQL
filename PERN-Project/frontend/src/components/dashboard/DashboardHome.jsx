import React from 'react';
import { Shield, BadgeCheck, Mail, FolderOpen, Flag, Clock, CheckCircle, Users } from 'lucide-react';
import apiRequest from '../../utils/apiRequest';

const DashboardHome = ({ currentUser, role, roleLabel, initials, myIssues, projects }) => {
  const doneTasks = myIssues?.filter((i) => i.status === "DONE").length || 0;
  const inProgressTasks = myIssues?.filter((i) => i.status === "IN_PROGRESS").length || 0;
  const todoTasks = myIssues?.filter((i) => i.status === "TODO").length || 0;

  const stats = [
    {
      icon: FolderOpen,
      label: "Projects",
      value: projects?.length.toString() || "0",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      icon: Flag,
      label: "To Do",
      value: todoTasks.toString(),
      color: "text-slate-600",
      bg: "bg-slate-100",
      border: "border-slate-200",
    },
    {
      icon: Clock,
      label: "In Progress",
      value: inProgressTasks.toString(),
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      icon: CheckCircle,
      label: "Tasks Done",
      value: doneTasks.toString(),
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      icon: Users,
      label: "Team Members",
      value: (projects || [])
        .reduce((total, project) => total + (project._count?.members || 0), 0)
        .toString(),
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
    },
  ];



  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Cover */}
        <div className="h-36 bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 left-20 w-40 h-40 bg-violet-400/20 rounded-full blur-2xl" />
        </div>

        <div className="px-8 pb-8">
          <div className="flex items-end justify-between -mt-12 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 border-4 border-white shadow-xl flex items-center justify-center text-white text-3xl font-extrabold select-none">
                {initials}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${role.dot}`}
              />
            </div>

            <div className="mb-1 flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${role.pill}`}
              >
                <Shield className="w-3.5 h-3.5" />
                {roleLabel}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
                {currentUser.name || "User"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.email}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                  ID:{" "}
                  <span className="font-mono text-xs bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600">
                    {currentUser.id || "—"}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(({ icon: Icon, label, value, color, bg, border }) => (
          <div
            key={label}
            className={`bg-white rounded-2xl border ${border} p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200 group`}
          >
            <div
              className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}
            >
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 leading-none">
                {value}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative z-10 max-w-2xl">
              <h5 className="text-3xl font-extrabold mb-4 leading-tight">Welcome back, {currentUser.name?.split(' ')[0] || initials}! 🚀</h5>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-xl">
                 You currently have <span className="text-blue-400 font-bold underline decoration-blue-400/30 underline-offset-4">{todoTasks}</span> tasks pending in your queue. Ready to tackle them and boost your productivity?
              </p>
              <div className="flex flex-wrap gap-4">
                  <button 
                    className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-sm font-bold transition-all shadow-xl shadow-blue-500/25 hover:scale-105 active:scale-95"
                  >
                     Go to My Issues
                  </button>
                  <button 
                    className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-sm font-bold transition-all backdrop-blur-md border border-white/10 hover:border-white/20"
                  >
                     View Projects
                  </button>
              </div>
          </div>
      </div>
    </>
  );
};

export default DashboardHome;
