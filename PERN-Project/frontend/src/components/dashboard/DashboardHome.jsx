import React from "react";
import {
  Shield,
  BadgeCheck,
  Mail,
  FolderOpen,
  Flag,
  Clock,
  CheckCircle,
  Users,
} from "lucide-react";

const DashboardHome = ({
  currentUser,
  role,
  roleLabel,
  initials,
  myIssues,
  projects,
}) => {
  const doneTasks = myIssues?.filter((i) => i.status === "DONE").length || 0;
  const inProgressTasks =
    myIssues?.filter((i) => i.status === "IN_PROGRESS").length || 0;
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
      <div className="bg-white rounded-3xl border border-ads-border shadow-ads-modal overflow-hidden animate-in fade-in duration-700">
        {/* Banner: Premium Dark Blue Gradient with dot pattern */}
        <div className="h-40 bg-linear-to-br from-[#0747A6] via-[#0052CC] to-[#172B4D] relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1.5px, transparent 1.5px)",
              backgroundSize: "16px 16px",
            }}
          />
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
        </div>

        <div className="px-8 pb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 mb-8 gap-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="relative shrink-0 group">
                <div className="w-28 h-28 rounded-3xl bg-ads-primary border-[5px] border-white shadow-2xl flex items-center justify-center text-white text-4xl font-extrabold select-none transition-transform duration-300 group-hover:scale-105">
                  {initials}
                </div>
                <div
                  className="absolute bottom-1 right-1 w-6 h-6 rounded-full border-[3px] border-white bg-blue-500 shadow-md animate-in zoom-in duration-500"
                  title="Online"
                />
              </div>

              <div className="flex flex-col gap-2 pb-1">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#0052CC] border border-blue-100 text-[10px] font-extrabold uppercase tracking-widest w-fit shadow-xs">
                  <Shield className="w-3.5 h-3.5" />
                  {roleLabel}
                </span>
                <h1 className="text-3xl font-extrabold text-ads-text tracking-tight">
                  {currentUser.name || "User"}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-50">
            <div className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                <Mail className="w-4 h-4 text-ads-text-subtle group-hover:text-ads-primary" />
              </div>
              <span className="text-sm font-bold text-ads-text-subtle">
                {currentUser.email}
              </span>
            </div>

            <div className="flex items-center gap-3 bg-[#F4F5F7] px-4 py-2.5 rounded-2xl border border-[#EBECF0] group cursor-default transition-all hover:bg-[#EBECF0]">
              <div className="flex items-center gap-2 text-[#42526E]">
                <BadgeCheck className="w-4 h-4 text-ads-primary" />
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  ID:
                </span>
              </div>
              <span className="font-mono text-xs text-[#172B4D] font-bold bg-white/50 px-2 py-1 rounded-lg border border-white">
                {currentUser.id || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map(({ icon: Icon, label, value, color, bg, border }) => (
          <div
            key={label}
            className={`bg-white rounded-2xl border ${border} p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md transition-all duration-200 group min-w-0`}
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 ${bg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xl sm:text-2xl font-extrabold text-ads-text leading-none truncate">
                {value}
              </p>
              <p
                className="text-[10px] sm:text-xs text-ads-text-subtle font-medium mt-1 uppercase tracking-wider truncate"
                title={label}
              >
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
          <h5 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-4 leading-tight">
            Welcome back, {currentUser.name?.split(" ")[0] || initials}! 🚀
          </h5>
          <p className="text-sm sm:text-base md:text-lg text-ads-surface-hover mb-6 sm:mb-8 leading-relaxed max-w-xl">
            You currently have{" "}
            <span className="text-ads-primary-light font-bold underline decoration-ads-primary-light/30 underline-offset-4">
              {todoTasks}
            </span>{" "}
            tasks pending in your queue. Ready to tackle them and boost your
            productivity?
          </p>
        </div>
      </div>
    </>
  );
};

export default DashboardHome;
