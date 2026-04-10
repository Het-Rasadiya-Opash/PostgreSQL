import React, { useState } from "react";
import {
  ClipboardList,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Loader2,
  Users,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import apiRequest from "../../utils/apiRequest";

const statusConfig = {
  TODO:        { label: "To Do",       bg: "bg-slate-100",   text: "text-slate-600",   border: "border-slate-200",  dot: "bg-slate-400" },
  IN_PROGRESS: { label: "In Progress", bg: "bg-blue-50",     text: "text-blue-600",    border: "border-blue-200",   dot: "bg-blue-500" },
  DONE:        { label: "Done",        bg: "bg-emerald-50",  text: "text-emerald-600", border: "border-emerald-200", dot: "bg-emerald-500" },
};

const priorityConfig = {
  HIGH:   { dot: "bg-red-500",   label: "High",   badge: "bg-red-50 text-red-600 border-red-200" },
  MEDIUM: { dot: "bg-amber-500", label: "Medium", badge: "bg-amber-50 text-amber-600 border-amber-200" },
  LOW:    { dot: "bg-blue-400",  label: "Low",    badge: "bg-blue-50 text-blue-500 border-blue-200" },
};

const ImplementationPlanView = ({ selectedProject, refreshProject }) => {
  const [expandedIssues, setExpandedIssues] = useState({});
  const [togglingId, setTogglingId]         = useState(null);

  const issues = selectedProject.issues || [];

  const toggleExpand = (id) =>
    setExpandedIssues((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleToggleSubTask = async (subTaskId) => {
    setTogglingId(subTaskId);
    try {
      await apiRequest.patch(`/subtasks/${subTaskId}/toggle`);
      await refreshProject(selectedProject.id);
    } catch (err) {
      console.error("Error toggling subtask:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const totalIssues    = issues.length;
  const doneIssues     = issues.filter((i) => i.status === "DONE").length;
  const totalSubTasks  = issues.reduce((a, i) => a + (i.subTasks?.length || 0), 0);
  const doneSubTasks   = issues.reduce((a, i) => a + (i.subTasks?.filter((s) => s.isCompleted).length || 0), 0);
  const overallPct     = totalSubTasks > 0 ? Math.round((doneSubTasks / totalSubTasks) * 100) : 0;
  const issuesPct      = totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0;

  return (
    <div className="space-y-5">

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Issues",    value: totalIssues,   color: "text-slate-700",   bg: "bg-slate-50",   border: "border-slate-200" },
          { label: "Completed",       value: doneIssues,    color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
          { label: "Total Subtasks",  value: totalSubTasks, color: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200" },
          { label: "Subtasks Done",   value: doneSubTasks,  color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl px-4 py-3`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Overall Progress ── */}
      {totalIssues > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Progress</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Issues progress */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-slate-500">Issues Completed</span>
                <span className={`text-xs font-bold ${issuesPct === 100 ? "text-emerald-600" : "text-slate-500"}`}>
                  {doneIssues}/{totalIssues} · {issuesPct}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${issuesPct === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                  style={{ width: `${issuesPct}%` }}
                />
              </div>
            </div>
            {/* Subtasks progress */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-slate-500">Subtasks Completed</span>
                <span className={`text-xs font-bold ${overallPct === 100 ? "text-emerald-600" : "text-slate-500"}`}>
                  {doneSubTasks}/{totalSubTasks} · {overallPct}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${overallPct === 100 ? "bg-emerald-500" : "bg-violet-500"}`}
                  style={{ width: `${overallPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Issue List ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1.5rem_1fr_7rem_7rem_8rem] gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200">
          <div />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issue</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subtasks</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignee</span>
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
            {issues.map((issue, idx) => {
              const subTasks   = issue.subTasks || [];
              const doneSubs   = subTasks.filter((s) => s.isCompleted).length;
              const pct        = subTasks.length > 0 ? Math.round((doneSubs / subTasks.length) * 100) : 0;
              const isExpanded = expandedIssues[issue.id];
              const sCfg       = statusConfig[issue.status]   || statusConfig.TODO;
              const pCfg       = priorityConfig[issue.priority] || priorityConfig.MEDIUM;

              return (
                <div key={issue.id}>
                  {/* Issue row */}
                  <div
                    className={`grid grid-cols-[1.5rem_1fr_7rem_7rem_8rem] gap-3 items-center px-5 py-3.5 transition-colors ${subTasks.length > 0 ? "cursor-pointer hover:bg-slate-50/80" : ""} ${isExpanded ? "bg-slate-50/60" : ""}`}
                    onClick={() => subTasks.length > 0 && toggleExpand(issue.id)}
                  >
                    {/* Expand chevron */}
                    <div className="flex items-center justify-center">
                      {subTasks.length > 0 ? (
                        <span className="text-slate-400">
                          {isExpanded
                            ? <ChevronDown className="w-3.5 h-3.5" />
                            : <ChevronRight className="w-3.5 h-3.5" />}
                        </span>
                      ) : (
                        <span className="w-3.5 h-3.5 flex items-center justify-center">
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                        </span>
                      )}
                    </div>

                    {/* Title + priority */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${pCfg.dot}`} title={pCfg.label} />
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${issue.status === "DONE" ? "line-through text-slate-400" : "text-slate-800"}`}>
                          {issue.title}
                        </p>
                        {issue.description && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{issue.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Subtask progress */}
                    <div className="flex flex-col gap-1">
                      {subTasks.length > 0 ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400">{doneSubs}/{subTasks.length}</span>
                            <span className={`text-[10px] font-bold ${pct === 100 ? "text-emerald-600" : "text-slate-400"}`}>{pct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-emerald-500" : "bg-violet-400"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-medium">No subtasks</span>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${sCfg.bg} ${sCfg.text} ${sCfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                        {sCfg.label}
                      </span>
                    </div>

                    {/* Assignee */}
                    <div>
                      {issue.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                            <span className="text-[9px] font-bold text-white">
                              {issue.assignee.name?.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-slate-700 truncate max-w-16">
                            {issue.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <Users className="w-3 h-3 text-slate-400" />
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">Unassigned</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subtask rows */}
                  {isExpanded && subTasks.length > 0 && (
                    <div className="bg-linear-to-b from-slate-50/80 to-white border-t border-slate-100">
                      {subTasks.map((sub, sIdx) => (
                        <div
                          key={sub.id}
                          className={`flex items-center gap-3 pl-12 pr-5 py-2.5 transition-colors hover:bg-slate-100/40 ${sIdx !== subTasks.length - 1 ? "border-b border-slate-100/70" : ""}`}
                        >
                          {/* Toggle button */}
                          <button
                            onClick={() => handleToggleSubTask(sub.id)}
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

                          {/* Connector line visual */}
                          <div className="w-3 h-px bg-slate-200 shrink-0" />

                          {/* Title */}
                          <span className={`flex-1 text-xs font-medium transition-all ${sub.isCompleted ? "line-through text-slate-400" : "text-slate-600"}`}>
                            {sub.title}
                          </span>

                          {/* Status chip */}
                          {sub.isCompleted ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              ✓ Done
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                              Pending
                            </span>
                          )}
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
