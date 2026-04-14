import React, { useState, useRef, useEffect } from "react";
import { Package, ChevronDown, Flag, Loader2, ArrowRight } from "lucide-react";
import apiRequest from "../../utils/apiRequest";

const priorityBar = {
  HIGH:   "bg-red-500",
  MEDIUM: "bg-amber-500",
  LOW:    "bg-blue-400",
};

const statusPill = {
  DONE:        "bg-emerald-50 text-emerald-700 border-emerald-100",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-100",
  TODO:        "bg-white text-slate-600 border-slate-200",
};

const sprintStatusColor = {
  PLANNED:   "text-slate-500",
  ACTIVE:    "text-blue-600",
  COMPLETED: "text-emerald-600",
};

const BacklogView = ({ selectedProject, userRole, refreshProject }) => {
  const [assigningId, setAssigningId] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const buttonRefs = useRef({});

  const openMenu = (issueId) => {
    if (openDropdown === issueId) { setOpenDropdown(null); return; }
    const btn = buttonRefs.current[issueId];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setOpenDropdown(issueId);
  };

  const issues  = selectedProject?.issues  || [];
  const sprints = selectedProject?.sprints || [];
  const backlogIssues = issues.filter(i => !i.sprintId);
  const activeSprints = sprints.filter(s => s.status !== "COMPLETED");

  const handleAssign = async (issueId, sprintId) => {
    setAssigningId(issueId);
    setOpenDropdown(null);
    try {
      await apiRequest.put(`/issues/${issueId}`, { sprintId });
      await refreshProject(selectedProject.id);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign sprint");
    } finally {
      setAssigningId(null);
    }
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = () => setOpenDropdown(null);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const canAssign = userRole === "PROJECT_MANAGER" || userRole === "ADMIN";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-slate-500" />
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Project Backlog
          </h4>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            {backlogIssues.length}
          </span>
        </div>
        {canAssign && activeSprints.length === 0 && (
          <p className="text-xs text-slate-400 italic">Create a sprint to assign issues</p>
        )}
      </div>

      {backlogIssues.length === 0 ? (
        <div className="text-center py-16 bg-slate-50/50 m-4 rounded-2xl border border-dashed border-slate-200">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">Backlog is clean!</h3>
          <p className="text-xs text-slate-500">Every task is currently assigned to a sprint.</p>
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div className="hidden md:grid grid-cols-[1fr_8rem_8rem_10rem] gap-3 px-6 py-2.5 bg-slate-50 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issue</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignee</span>
            {canAssign && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Move to Sprint</span>}
          </div>

          <div className="divide-y divide-slate-100">
            {backlogIssues.map(issue => (
              <div
                key={issue.id}
                className="flex flex-col md:grid md:grid-cols-[1fr_8rem_8rem_10rem] md:items-center gap-3 px-6 py-3.5 hover:bg-slate-50/60 transition-colors"
              >
                {/* Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-1 h-8 rounded-full shrink-0 ${priorityBar[issue.priority] || "bg-slate-300"}`} />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 block">
                      {selectedProject.key}-{issue.id.slice(0, 4).toUpperCase()}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 truncate">{issue.title}</p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusPill[issue.status] || statusPill.TODO}`}>
                    {issue.status.replace("_", " ")}
                  </span>
                </div>

                {/* Assignee */}
                <div className="flex items-center gap-1.5">
                  {issue.assignee ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 overflow-hidden">
                        {issue.assignee.avatar ? (
                          <img src={issue.assignee.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] font-bold text-white">
                            {issue.assignee.name?.[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-600 font-medium truncate max-w-16 hidden sm:block">
                        {issue.assignee.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-400">Unassigned</span>
                  )}
                </div>

                {/* Sprint assignment */}
                {canAssign && (
                  <div className="relative" onMouseDown={e => e.stopPropagation()}>
                    {assigningId === issue.id ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Assigning...
                      </div>
                    ) : activeSprints.length === 0 ? (
                      <span className="text-[10px] text-slate-300 italic">No sprints</span>
                    ) : (
                      <>
                        <button
                          ref={el => buttonRefs.current[issue.id] = el}
                          onClick={() => openMenu(issue.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer whitespace-nowrap"
                        >
                          <Flag className="w-3 h-3" />
                          Add to Sprint
                          <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === issue.id ? "rotate-180" : ""}`} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Fixed dropdown portal — renders outside overflow containers */}
      {openDropdown && activeSprints.length > 0 && (
        <div
          className="fixed z-50 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Sprint</p>
          </div>
          {activeSprints.map(sprint => (
            <button
              key={sprint.id}
              onClick={() => handleAssign(openDropdown, sprint.id)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Flag className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-700 truncate">{sprint.name}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[9px] font-bold uppercase ${sprintStatusColor[sprint.status]}`}>
                  {sprint.status}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BacklogView;
