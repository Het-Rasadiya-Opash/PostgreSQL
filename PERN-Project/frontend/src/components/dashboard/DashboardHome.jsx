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
      color: "text-ads-primary",
      bg: "bg-ads-primary-light",
      border: "border-ads-primary/10",
    },
    {
      icon: Flag,
      label: "To Do",
      value: todoTasks.toString(),
      color: "text-ads-text-subtle",
      bg: "bg-ads-surface",
      border: "border-ads-border",
    },
    {
      icon: Clock,
      label: "In Progress",
      value: inProgressTasks.toString(),
      color: "text-ads-info",
      bg: "bg-ads-info-light",
      border: "border-ads-info/10",
    },
    {
      icon: CheckCircle,
      label: "Tasks Done",
      value: doneTasks.toString(),
      color: "text-ads-success",
      bg: "bg-ads-success-light",
      border: "border-ads-success/10",
    },
    {
      icon: Users,
      label: "Team Members",
      value: (projects || [])
        .reduce((total, project) => total + (project._count?.members || 0), 0)
        .toString(),
      color: "text-ads-primary",
      bg: "bg-ads-primary-light",
      border: "border-ads-primary/10",
    },
  ];



  return (
    <>
      <div className="bg-ads-surface-white rounded-2xl border border-ads-border shadow-sm overflow-hidden">
        {/* Cover: Jira Blue Gradient */}
        <div className="h-36 bg-linear-to-r from-ads-primary to-ads-primary-hover relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 left-20 w-40 h-40 bg-ads-primary-light/20 rounded-full blur-2xl" />
        </div>

        <div className="px-8 pb-8">
          <div className="flex items-end justify-between -mt-12 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-ads-primary border-4 border-white shadow-xl flex items-center justify-center text-white text-3xl font-extrabold select-none">
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
              <h1 className="text-2xl font-extrabold text-ads-text leading-tight">
                {currentUser.name || "User"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-sm text-ads-text-subtle">
                  <Mail className="w-3.5 h-3.5 text-ads-text-subtlest" />
                  {currentUser.email}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-ads-text-subtle">
                  <BadgeCheck className="w-3.5 h-3.5 text-ads-primary" />
                  ID:{" "}
                  <span className="font-mono text-xs bg-ads-surface border border-ads-border rounded px-1.5 py-0.5 text-ads-text-subtle">
                    {currentUser.id || "—"}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
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
              <p className="text-2xl font-extrabold text-ads-text leading-none">
                {value}
              </p>
              <p className="text-xs text-ads-text-subtle font-medium mt-1">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#172B4D] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl border border-[#253858]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-ads-primary/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-ads-primary/10 rounded-full blur-3xl animate-pulse" />

        <div className="relative z-10 max-w-2xl">
          <h5 className="text-2xl sm:text-3xl font-extrabold mb-4 leading-tight">Welcome back, {currentUser.name?.split(' ')[0] || initials}! 🚀</h5>
          <p className="text-base sm:text-lg text-ads-surface-hover mb-8 leading-relaxed max-w-xl">
            You currently have <span className="text-ads-primary-light font-bold underline decoration-ads-primary-light/30 underline-offset-4">{todoTasks}</span> tasks pending in your queue. Ready to tackle them and boost your productivity?
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              className="px-8 py-4 rounded-2xl bg-ads-primary hover:bg-ads-primary-hover text-sm font-bold transition-all shadow-xl shadow-ads-primary/25 hover:scale-105 active:scale-95"
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
