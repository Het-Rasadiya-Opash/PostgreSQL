import React, { useState } from "react";
import {
  ClipboardList, ChevronDown, ChevronRight,
  CheckCircle2, Circle, Loader2, Users, TrendingUp, CalendarClock,
} from "lucide-react";
import apiRequest from "../../utils/apiRequest";
import { formatDate } from "../../utils/dateFormat";

const statusConfig = {
  TODO:        { label: "To Do",       bg: "bg-slate-100",  text: "text-slate-600",  border: "border-slate-200",  dot: "bg-slate-400" },
  IN_PROGRESS: { label: "In Progress", bg: "bg-blue-50",    text: "text-blue-600",   border: "border-blue-200",   dot: "bg-blue-500"  },
  DONE:        { label: "Done",        bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", dot: "bg-emerald-500" },
};

const priorityConfig = {
  HIGH:   { dot: "bg-red-500",   label: "High",   badge: "bg-red-50 text-red-600 border-red-200"     },
  MEDIUM: { dot: "bg-amber-500", label: "Medium", badge: "bg-amber-50 text-amber-600 border-amber-200" },
  LOW:    { dot: "bg-blue-400",  label: "Low",    badge: "bg-blue-50 text-blue-500 border-blue-200"   },
};

const ImplementationPlanView = ({ selectedProject, refreshProject }) => {
  const [expandedIssues, setExpandedIssues] = useState({});
  const [togglingId, setTogglingId] = useState(null);
  const [localIssues, setLocalIssues] = useState(null);

  // Reset local state when selectedProject refreshes
  React.useEffect(() => { setLocalIssues(null); }, [selectedProject]);

  const issues = localIssues ?? selectedProject.issues ?? [];

  const toggleExpand = (id) =>
    setExpandedIssues((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleToggleSubTask = async (subTaskId, issueId) => {
    setTogglingId(subTaskId);

    // Optimistic update
    setLocalIssues((prev) => {
      const base = prev ?? selectedProject.issues ?? [];
      return base.map((issue) => {
        if (issue.id !== issueId) return issue;
        const updatedSubTasks = issue.subTasks.map((s) =>
          s.id === subTaskId ? { ...s, isCompleted: !s.isCompleted } : s
        );
        const allDone = updatedSubTasks.every((s) => s.isCompleted);
        const anyDone = updatedSubTasks.some((s) => s.isCompleted);
        return {
          ...issue,
          subTasks: updatedSubTasks,
          status: allDone ? "DONE" : anyDone ? "IN_PROGRESS" : "TODO",
        };
      });
    });

    try {
      await apiRequest.patch(`/subtasks/${subTaskId}/toggle`);
      refreshProject(selectedProject.id);
    } catch (err) {
      setLocalIssues(null);
      console.error("Error toggling subtask:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const totalIssues   = issues.length;
  const doneIssues    = issues.filter((i) => i.status === "DONE").length;
  const totalSubTasks = issues.reduce((a, i) => a + (i.subTasks?.length || 0), 0);
  const doneSubTasks  = issues.reduce((a, i) => a + (i.subTasks?.filter((s) => s.isCompleted).length || 0), 0);
  const overallPct    = totalSubTasks > 0 ? Math.round((doneSubTasks / totalSubTasks) * 100) : 0;
  const issuesPct     = totalIssues   > 0 ? Math.round((doneIssues   / totalIssues)   * 100) : 0;

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Issues",   value: totalIssues,   color: "text-slate-700",  bg: "bg-slate-50",  border: "border-slate-200"  },
          { label: "Completed",      value: doneIssues,    color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
          { label: "Total Subtasks", value: totalSubTasks, color: "text-violet-700",  bg: "bg-violet-50", border: "border-violet-200"  },
          { label: "Subtasks Done",  value: doneSubTasks,  color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200"    },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl px-4 py-3`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Overall Progress */}
      {totalIssues > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Progress</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-slate-500">Issues Completed</span>
                <span className={`text-xs font-bold ${issuesPct === 100 ? "text-emerald-600" : "text-slate-500"}`}>
                  {doneIssues}/{totalIssues} · {issuesPct}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${issuesPct === 100 ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${issuesPct}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-slate-500">Subtasks Completed</span>
                <span className={`text-xs font-bold ${overallPct === 100 ? "text-emerald-600" : "text-slate-500"}`}>
                  {doneSubTasks}/{totalSubTasks} · {overallPct}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${overallPct === 100 ? "bg-emerald-500" : "bg-violet-500"}`} style={{ width: `${overallPct}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issue List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Header */}
        <div className="hidden md:flex items-center gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200">
          <div className="w-4 shrink-0" />
          <span className="flex-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issue</span>
          <span className="w-28 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subtasks</span>
          <span className="w-24 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</span>
          <span className="w-24 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
          <span className="w-28 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignee</span>
          <span className="w-24 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</span>
        </div>

        {issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <ClipboardList className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-500 mb-1">No issues yet</p>
            <p className="text-xs text-slate-400">Add issues from the Board view to build your plan</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {issues.map((issue) => {
              const subTasks  = issue.subTasks || [];
              const doneSubs  = subTasks.filter((s) => s.isCompleted).length;
              const pct       = subTasks.length > 0 ? Math.round((doneSubs / subTasks.length) * 100) : 0;
              const isExpanded = expandedIssues[issue.id];
              const sCfg      = statusConfig[issue.status]   || statusConfig.TODO;
              const pCfg      = priorityConfig[issue.priority] || priorityConfig.MEDIUM;

              const due        = issue.dueDate ? new Date(issue.dueDate) : null;
              const now        = new Date(); now.setHours(0, 0, 0, 0);
              const isOverdue  = due && due < now && issue.status !== "DONE";
              const isDueToday = due && due.toDateString() === now.toDateString();

              return (
                <div key={issue.id}>
                  {/* Issue Row */}
                  <div
                    onClick={() => subTasks.length > 0 && toggleExpand(issue.id)}
                    className={`flex flex-col md:flex-row md:items-center gap-2 md:gap-3 px-5 py-4 md:py-3 transition-colors
                      ${subTasks.length > 0 ? "cursor-pointer hover:bg-slate-50" : ""}
                      ${isExpanded ? "bg-slate-50" : ""}`}
                  >
                    {/* Chevron */}
                    <div className="w-4 shrink-0 flex items-center justify-center">
                      {subTasks.length > 0 ? (
                        isExpanded
                          ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200 block mx-auto" />
                      )}
                    </div>

                    {/* Title + description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          {selectedProject.key}-{issue.id.slice(0, 4).toUpperCase()}
                        </span>
                        <p className={`text-sm font-semibold truncate ${issue.status === "DONE" ? "line-through text-slate-400" : "text-slate-800"}`}>
                          {issue.title}
                        </p>
                      </div>
                      {issue.description && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 pl-0">{issue.description}</p>
                      )}
                    </div>

                    {/* Subtask progress */}
                    <div className="w-full md:w-28 shrink-0">
                      {subTasks.length > 0 ? (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-400">{doneSubs}/{subTasks.length} tasks</span>
                            <span className={`text-[10px] font-bold ${pct === 100 ? "text-emerald-600" : "text-slate-400"}`}>{pct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-emerald-500" : "bg-violet-400"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-medium">No subtasks</span>
                      )}
                    </div>

                    {/* Priority */}
                    <div className="w-24 shrink-0">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${pCfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pCfg.dot}`} />
                        {pCfg.label}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="w-24 shrink-0">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${sCfg.bg} ${sCfg.text} ${sCfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                        {sCfg.label}
                      </span>
                    </div>

                    {/* Assignee */}
                    <div className="w-28 shrink-0">
                      {issue.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                            {issue.assignee.avatar ? (
                              <img src={issue.assignee.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[9px] font-bold text-white">
                                {issue.assignee.name?.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-slate-700 truncate">{issue.assignee.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <Users className="w-3 h-3 text-slate-400" />
                          </div>
                          <span className="text-[11px] text-slate-400">Unassigned</span>
                        </div>
                      )}
                    </div>

                    {/* Due Date */}
                    <div className="w-24 shrink-0">
                      {due ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                          isOverdue  ? "bg-red-50 text-red-600 border-red-200" :
                          isDueToday ? "bg-yellow-50 text-yellow-700 border-yellow-300" :
                                       "bg-slate-50 text-slate-500 border-slate-200"
                        }`}>
                          <CalendarClock className="w-3 h-3" />
                          {isOverdue ? "Overdue" : isDueToday ? "Today" : formatDate(due)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-300">—</span>
                      )}
                    </div>
                  </div>

                  {/* Subtask rows */}
                  {isExpanded && subTasks.length > 0 && (
                    <div className="border-t border-slate-100">
                      {subTasks.map((sub, sIdx) => (
                        <div
                          key={sub.id}
                          className={`flex items-center gap-3 py-2.5 px-5 hover:bg-slate-50 transition-colors ${sIdx !== subTasks.length - 1 ? "border-b border-slate-100" : ""}`}
                        >
                          {/* indent spacer matching chevron width */}
                          <div className="w-4 shrink-0" />

                          {/* toggle */}
                          <button
                            onClick={() => handleToggleSubTask(sub.id, issue.id)}
                            disabled={togglingId === sub.id}
                            className="shrink-0 transition-all duration-200 hover:scale-110 disabled:opacity-60"
                          >
                            {togglingId === sub.id ? (
                              <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                            ) : sub.isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-300 hover:text-violet-400" />
                            )}
                          </button>

                          {/* connector */}
                          <div className="w-4 h-px bg-slate-200 shrink-0" />

                          {/* title + badge inline */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className={`text-xs font-medium truncate transition-all ${sub.isCompleted ? "line-through text-slate-400" : "text-slate-600"}`}>
                              {sub.title}
                            </span>
                            {sub.isCompleted ? (
                              <span className="shrink-0 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                ✓ Done
                              </span>
                            ) : (
                              <span className="shrink-0 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImplementationPlanView;
