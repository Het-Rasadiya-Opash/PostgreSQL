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
  X,
  ClipboardList,
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
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-ads-surface border-r border-ads-border flex flex-col justify-between shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.02)] transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div>
        <div 
          onClick={() => {
            setCurrentView("DASHBOARD");
            closeProjectDetailsModal();
          }}
          className="h-16 flex items-center justify-between px-6 border-b border-ads-border cursor-pointer hover:bg-ads-surface-hover transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-ads-primary rounded-lg flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-ads-text text-lg tracking-tight">
              PMS
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsSidebarOpen(false);
            }}
            className="md:hidden p-1.5 -mr-2 rounded-lg text-ads-text-subtle hover:text-ads-text hover:bg-ads-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        {selectedProject && currentView.startsWith("PROJECT_") ? (
          <nav className="p-4 space-y-1">
            <button
              onClick={closeProjectDetailsModal}
              className="w-full flex items-center gap-2 px-3 py-2 mb-4 rounded-lg text-xs font-bold text-ads-text-subtle hover:text-ads-text hover:bg-ads-surface-hover transition-colors cursor-pointer"
            >
              ← Back to Dashboard
            </button>
            <div className="px-3 py-2 mb-2 text-sm font-extrabold text-ads-text wrap-break-word border-b border-ads-border pb-4">
              {selectedProject.name}
            </div>

            <button
              onClick={() => setCurrentView("PROJECT_BOARD")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${currentView === "PROJECT_BOARD" ? "bg-ads-primary-light text-ads-primary hover:bg-white" : "text-ads-text-subtle hover:bg-ads-surface-hover"}`}
            >
              <BarChart3 className="w-4 h-4" />
              Board
            </button>
            <button
              onClick={() => setCurrentView("PROJECT_BACKLOG")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${currentView === "PROJECT_BACKLOG" ? "bg-ads-primary-light text-ads-primary hover:bg-white" : "text-ads-text-subtle hover:bg-ads-surface-hover"}`}
            >
              <Package className="w-4 h-4" />
              Backlog
            </button>
            <button
              onClick={() => setCurrentView("PROJECT_SPRINTS")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${currentView === "PROJECT_SPRINTS" ? "bg-ads-primary-light text-ads-primary hover:bg-white" : "text-ads-text-subtle hover:bg-ads-surface-hover"}`}
            >
              <Flag className="w-4 h-4" />
              Sprints
            </button>
            <button
              onClick={() => setCurrentView("PROJECT_ANALYTICS")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${currentView === "PROJECT_ANALYTICS" ? "bg-ads-primary-light text-ads-primary hover:bg-white" : "text-ads-text-subtle hover:bg-ads-surface-hover"}`}
            >
              <TrendingUp className="w-4 h-4" />
              Analytics
            </button>
            <button
              onClick={() => setCurrentView("PROJECT_TEAM")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${currentView === "PROJECT_TEAM" ? "bg-ads-primary-light text-ads-primary hover:bg-white" : "text-ads-text-subtle hover:bg-ads-surface-hover"}`}
            >
              <Users className="w-4 h-4" />
              Team
            </button>
            <button
              onClick={() => setCurrentView("PROJECT_PLAN")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${currentView === "PROJECT_PLAN" ? "bg-ads-primary-light text-ads-primary hover:bg-white" : "text-ads-text-subtle hover:bg-ads-surface-hover"}`}
            >
              <ClipboardList className="w-4 h-4" />
              Implementation Plan
            </button>
          </nav>
        ) : (
          <nav className="p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-ads-text-subtlest mb-1">
              Menu
            </div>
            <button
              onClick={() => {
                setCurrentView("DASHBOARD");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${currentView === "DASHBOARD" ? "bg-ads-primary-light text-ads-primary hover:bg-white" : "text-ads-text-subtle hover:bg-ads-surface-hover"}`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => {
                setCurrentView("GLOBAL_PROJECTS");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${currentView === "GLOBAL_PROJECTS" ? "bg-ads-primary-light text-ads-primary hover:bg-white" : "text-ads-text-subtle hover:bg-ads-surface-hover"}`}
            >
              <FolderOpen className="w-4 h-4" />
              Projects
            </button>
            <button
              onClick={() => {
                setCurrentView("GLOBAL_ISSUES");
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer justify-between ${currentView === "GLOBAL_ISSUES" ? "bg-ads-primary-light text-ads-primary hover:bg-white" : "text-ads-text-subtle hover:bg-ads-surface-hover"}`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4" />
                My Issues
              </div>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${currentView === "GLOBAL_ISSUES" ? "bg-ads-primary text-white" : "bg-ads-border text-ads-text-subtlest"}`}
              >
                {myIssuesCount}
              </span>
            </button>
          </nav>
        )}
      </div>

      {/* User Mini Profile & Logout */}
      <div className="p-4 border-t border-ads-border bg-ads-surface/50">
        <div className="flex items-center gap-3 mb-4 px-1">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold shadow-sm border border-white bg-ads-primary text-white relative`}
          >
            {initials}
            <div
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${role.dot}`}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-ads-text truncate">
              {currentUser.name || "User"}
            </p>
            <p className="text-[10px] tracking-wider uppercase font-bold text-ads-text-subtlest truncate">
              {roleLabel}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 px-1">
          <button
            onClick={() => setCurrentView("PROFILE")}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-ads-text-subtle hover:text-ads-primary hover:bg-ads-primary-light transition-all cursor-pointer"
            title="Profile Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onLogout}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-ads-text-subtle hover:text-ads-danger hover:bg-ads-danger-light transition-all cursor-pointer"
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
