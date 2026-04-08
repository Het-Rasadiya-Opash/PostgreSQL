import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/usersSlice";
import {
  LogOut,
  Zap,
  Shield,
  BarChart3,
  FolderOpen,
  CheckCircle,
  Users,
  Clock,
  Mail,
  BadgeCheck,
} from "lucide-react";

const roleColors = {
  ADMIN: { pill: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  PROJECT_MANAGER: { pill: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  DEVELOPER: { pill: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  USER: { pill: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
};

const roleLabels = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Project Manager",
  DEVELOPER: "Developer",
  USER: "User",
};

const stats = [
  { icon: FolderOpen, label: "Projects", value: "0", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  { icon: CheckCircle, label: "Tasks Done", value: "0", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  { icon: Users, label: "Team Members", value: "0", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
  { icon: Clock, label: "Hours Logged", value: "0", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
];

const Dashboard = () => {
  const { currentUser } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const initials = currentUser.name
    ? currentUser.name.split(" ").slice(0, 2).map((n) => n[0].toUpperCase()).join("")
    : currentUser.email[0].toUpperCase();

  const role = roleColors[currentUser.role] || roleColors.USER;
  const roleLabel = roleLabels[currentUser.role] || currentUser.role;

  return (
    <div className="min-h-screen bg-slate-100">

      {/* ── Navbar ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">CoreOps</span>
          </div>
          <button
            onClick={() => { dispatch(logout()); navigate("/login"); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8 space-y-6">

        {/* ── Profile Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Cover */}
          <div className="h-36 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "18px 18px" }}
            />
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 left-20 w-40 h-40 bg-violet-400/20 rounded-full blur-2xl" />
          </div>

          {/* Body */}
          <div className="px-8 pb-8">
            {/* Avatar + actions row */}
            <div className="flex items-end justify-between -mt-12 mb-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 border-4 border-white shadow-xl flex items-center justify-center text-white text-3xl font-extrabold select-none">
                  {initials}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${role.dot}`} />
              </div>

              {/* Role + ID */}
              <div className="mb-1 flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${role.pill}`}>
                  <Shield className="w-3.5 h-3.5" />
                  {roleLabel}
                </span>
              </div>
            </div>

            {/* Name / email / meta */}
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
                    ID: <span className="font-mono text-xs bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600">{currentUser.id || "—"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 mt-6 pt-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">0</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Projects</p>
                </div>
                <div className="border-x border-slate-100">
                  <p className="text-2xl font-extrabold text-slate-900">0</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Tasks Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">0</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Hours Logged</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, label, value, color, bg, border }) => (
            <div
              key={label}
              className={`bg-white rounded-2xl border ${border} p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200 group`}
            >
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Account Details Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Account Details</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="px-6 py-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</p>
              <p className="text-sm font-semibold text-slate-900">{currentUser.name || "—"}</p>
            </div>
            <div className="px-6 py-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</p>
              <p className="text-sm font-semibold text-slate-900 break-all">{currentUser.email}</p>
            </div>
            <div className="px-6 py-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Access Role</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider ${role.pill}`}>
                <Shield className="w-3 h-3" />
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
