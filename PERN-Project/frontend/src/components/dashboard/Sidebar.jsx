import React, { useState } from "react";
import {
  BarChart3,
  FolderOpen,
  CheckCircle,
  Zap,
  Flag,
  Users,
  LogOut,
  Shield,
  Package,
  TrendingUp,
  Search,
  Settings,
  X
} from "lucide-react";


const Sidebar = ({
  currentUser,
  role,
  roleLabel,
  initials,
  myIssuesCount,
  selectedProject,
  currentView,
  setCurrentView,
  closeProjectDetailsModal,
  isSidebarOpen,
  setIsSidebarOpen,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const allIssues = selectedProject?.issues || [];
  const searchResults = searchQuery.trim() ? allIssues.filter(issue => 
    issue.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5) : [];
  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.02)] transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div>
        {/* Brand/Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">
              CoreOps
            </span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1.5 -mr-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Search (Always visible) */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Quick Search..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Search Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-4 right-4 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-50">
               {searchResults.map(issue => (
                 <button 
                   key={issue.id}
                   onClick={() => {
                     // Potential navigation to issue
                     setSearchQuery("");
                   }}
                   className="w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors"
                 >
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{issue.project?.key}</p>
                   <p className="text-xs font-semibold text-slate-800 truncate">{issue.title}</p>
                 </button>
               ))}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        {selectedProject && currentView.startsWith("PROJECT_") ? (
          <nav className="p-4 space-y-1">
            <button
              onClick={closeProjectDetailsModal}
              className="w-full flex items-center gap-2 px-3 py-2 mb-4 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ← Back to Dashboard
            </button>
            <div className="px-3 py-2 mb-2 text-sm font-extrabold text-slate-800 wrap-break-word border-b border-slate-100 pb-4">
              {selectedProject.name}
            </div>

            <button
              onClick={() => setCurrentView("PROJECT_BOARD")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${currentView === "PROJECT_BOARD" ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <BarChart3 className="w-4 h-4" />
              Board
            </button>
            <button
              onClick={() => setCurrentView("PROJECT_BACKLOG")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${currentView === "PROJECT_BACKLOG" ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Package className="w-4 h-4" />
              Backlog
            </button>
            <button
              onClick={() => setCurrentView("PROJECT_SPRINTS")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${currentView === "PROJECT_SPRINTS" ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Flag className="w-4 h-4" />
              Sprints
            </button>
            <button
              onClick={() => setCurrentView("PROJECT_ANALYTICS")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${currentView === "PROJECT_ANALYTICS" ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <TrendingUp className="w-4 h-4" />
              Analytics
            </button>
            <button
              onClick={() => setCurrentView("PROJECT_TEAM")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${currentView === "PROJECT_TEAM" ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Users className="w-4 h-4" />
              Team
            </button>
          </nav>
        ) : (
          <nav className="p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Menu
            </div>
            <button
              onClick={() => {
                setCurrentView("DASHBOARD");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${currentView === "DASHBOARD" ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => {
                setCurrentView("GLOBAL_PROJECTS");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${currentView === "GLOBAL_PROJECTS" ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <FolderOpen className="w-4 h-4" />
              Projects
            </button>
            <button
              onClick={() => {
                setCurrentView("GLOBAL_ISSUES");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer justify-between ${currentView === "GLOBAL_ISSUES" ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4" />
                My Issues
              </div>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${currentView === "GLOBAL_ISSUES" ? "bg-blue-200 text-blue-800" : "bg-slate-100 text-slate-500"}`}
              >
                {myIssuesCount}
              </span>
            </button>
          </nav>
        )}
      </div>

      {/* User Mini Profile & Logout */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-4 px-1">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold shadow-sm border border-white bg-linear-to-br from-blue-500 to-indigo-600 text-white relative`}
          >
            {initials}
            <div
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${role.dot}`}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-slate-900 truncate">
              {currentUser.name || "User"}
            </p>
            <p className="text-[10px] tracking-wider uppercase font-bold text-slate-500 truncate">
              {roleLabel}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 px-1">
          <button 
             onClick={() => setCurrentView("PROFILE")}
             className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
             title="Profile Settings"
          >
             <Settings className="w-4 h-4" />
          </button>

          <button 
             onClick={onLogout}
             className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
             title="Sign Out"
          >
             <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
