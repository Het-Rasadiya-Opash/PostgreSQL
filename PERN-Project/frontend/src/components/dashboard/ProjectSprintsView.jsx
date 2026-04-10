import React, { useState } from 'react';
import { Calendar, Flag, PlusCircle, Edit3, Loader2, Play, CheckCheck, RotateCcw, CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import apiRequest from '../../utils/apiRequest';
import SprintModal from './SprintModal';

const ProjectSprintsView = ({ selectedProject, userRole, refreshProject }) => {
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [sprintModalMode, setSprintModalMode] = useState("create");
  const [editingSprintId, setEditingSprintId] = useState(null);

  const [expandedSprints, setExpandedSprints] = useState({});
  const [togglingId, setTogglingId] = useState(null);

  const handleEditSprint = (sprint) => {
    setSprintModalMode("edit");
    setEditingSprintId(sprint.id);
    setIsSprintModalOpen(true);
  };

  const handleStatusChange = async (sprint, newStatus) => {
    try {
      await apiRequest.put(`/sprints/${sprint.id}`, { status: newStatus });
      await refreshProject(selectedProject.id);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update sprint status");
    }
  };

  const toggleSprintSubTasks = (sprintId) => {
    setExpandedSprints(prev => ({ ...prev, [sprintId]: !prev[sprintId] }));
  };

  const handleToggleSubTask = async (subTaskId) => {
    setTogglingId(subTaskId);
    try {
      await apiRequest.patch(`/subtasks/${subTaskId}/toggle`);
      await refreshProject(selectedProject.id);
    } catch (err) {
      console.error("Failed to toggle subtask:", err);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="bg-ads-surface-white rounded-2xl border border-ads-border shadow-sm p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-ads-text-subtlest" />
          <h4 className="text-sm font-bold text-ads-text-subtlest uppercase tracking-wider">
            Sprints ({selectedProject.sprints?.length || 0})
          </h4>
        </div>
        {userRole === "PROJECT_MANAGER" && (
          <button
            onClick={() => {
              setSprintModalMode("create");
              setEditingSprintId(null);
              setIsSprintModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-ads-primary hover:bg-ads-primary-light border border-ads-primary/20 transition-all duration-200 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Sprint</span>
          </button>
        )}
      </div>

      {selectedProject.sprints && selectedProject.sprints.length > 0 ? (
        <div className="space-y-3">
          {selectedProject.sprints.map((sprint) => {
            const sprintIssues = selectedProject.issues?.filter(i => i.sprintId === sprint.id) || [];
            const totalSubTasks = sprintIssues.reduce((acc, i) => acc + (i.subTasks?.length || 0), 0);
            const doneSubTasks = sprintIssues.reduce((acc, i) => acc + (i.subTasks?.filter(s => s.isCompleted).length || 0), 0);
            const subTaskPct = totalSubTasks > 0 ? Math.round((doneSubTasks / totalSubTasks) * 100) : 0;

            const statusConfig = {
              PLANNED: { color: "bg-ads-surface text-ads-text-subtle border-ads-border", label: "Planned" },
              ACTIVE: { color: "bg-ads-primary-light text-ads-primary border-ads-primary/20", label: "Active" },
              COMPLETED: { color: "bg-ads-success-light text-ads-success border-ads-success/20", label: "Completed" },
            };
            const cfg = statusConfig[sprint.status] || statusConfig.PLANNED;

            return (
              <div
                key={sprint.id}
                className="group flex flex-col p-4 bg-white border border-ads-border rounded-2xl hover:border-ads-primary/20 hover:shadow-md transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-ads-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-ads-primary-light flex items-center justify-center shrink-0 border border-ads-primary/10">
                      <Flag className="w-4 h-4 text-ads-primary" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-ads-text">{sprint.name}</h5>
                      {sprint.goal && (
                        <p className="text-xs text-ads-text-subtle mt-0.5 italic line-clamp-1">{sprint.goal}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status badge */}
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${cfg.color}`}>
                      {cfg.label}
                    </span>

                    {/* Quick status action buttons — PROJECT_MANAGER only */}
                    {userRole === "PROJECT_MANAGER" && (
                      <div className="flex items-center gap-1">
                        {sprint.status === "PLANNED" && (
                          <button
                            onClick={() => handleStatusChange(sprint, "ACTIVE")}
                            title="Start Sprint"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-ads-primary bg-ads-primary-light hover:bg-ads-primary-light/80 border border-ads-primary/20 transition-all cursor-pointer"
                          >
                            <Play className="w-3 h-3" /> Start
                          </button>
                        )}
                        {sprint.status === "ACTIVE" && (
                          <button
                            onClick={() => handleStatusChange(sprint, "COMPLETED")}
                            title="Complete Sprint"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-ads-success bg-ads-success-light hover:bg-ads-success-light/80 border border-ads-success/20 transition-all cursor-pointer"
                          >
                            <CheckCheck className="w-3 h-3" /> Complete
                          </button>
                        )}
                        {sprint.status === "COMPLETED" && (
                          <button
                            onClick={() => handleStatusChange(sprint, "PLANNED")}
                            title="Reopen Sprint"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-ads-text-subtle bg-ads-surface hover:bg-ads-surface-hover border border-ads-border transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" /> Reopen
                          </button>
                        )}
                        <button
                          onClick={() => handleEditSprint(sprint)}
                          className="p-1.5 rounded-lg text-ads-text-subtlest hover:text-ads-primary hover:bg-ads-primary-light transition-all cursor-pointer"
                          title="Edit Sprint"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-ads-text-subtlest">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : "—"}
                    {" → "}
                    {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : "—"}
                  </span>
                </div>

                {/* Subtask progress */}
                {totalSubTasks > 0 && (
                  <div className="mt-3 pt-3 border-t border-ads-border/20">
                    <button
                      onClick={() => toggleSprintSubTasks(sprint.id)}
                      className="w-full flex items-center justify-between mb-1.5 hover:bg-ads-surface-hover p-1 rounded-lg transition-colors cursor-pointer group/progress"
                    >
                      <div className="flex items-center gap-1.5">
                        {doneSubTasks === totalSubTasks ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-ads-success" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-ads-border group-hover/progress:text-ads-primary" />
                        )}
                        <span className="text-[11px] font-semibold text-ads-text-subtle">
                          {doneSubTasks}/{totalSubTasks} subtasks complete
                        </span>
                        {expandedSprints[sprint.id] ? (
                          <ChevronDown className="w-3 h-3 text-ads-text-subtlest" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-ads-text-subtlest" />
                        )}
                      </div>
                      <span className={`text-[11px] font-bold ${subTaskPct === 100 ? "text-ads-success" : "text-ads-text-subtlest"
                        }`}>{subTaskPct}%</span>
                    </button>
                    <div className="w-full h-1.5 bg-ads-surface rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${subTaskPct === 100 ? "bg-ads-success" : "bg-ads-primary"
                          }`}
                        style={{ width: `${subTaskPct}%` }}
                      />
                    </div>

                    {/* Expandable subtask list */}
                    {expandedSprints[sprint.id] && (
                      <div className="mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {sprintIssues.map(issue =>
                          (issue.subTasks || []).map(sub => (
                            <div
                              key={sub.id}
                              className="flex items-center gap-2 pl-6 pr-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors group/sub"
                            >
                              <button
                                onClick={() => handleToggleSubTask(sub.id)}
                                disabled={togglingId === sub.id}
                                className="shrink-0 transition-transform duration-200 hover:scale-110"
                              >
                                {togglingId === sub.id ? (
                                  <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                                ) : sub.isCompleted ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-slate-300 hover:text-blue-400" />
                                )}
                              </button>
                              <span className={`text-[11px] leading-tight truncate ${sub.isCompleted ? "line-through text-slate-400" : "text-slate-600"
                                }`}>
                                {sub.title}
                              </span>
                              <span className="ml-auto text-[9px] font-bold text-slate-300 uppercase opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                from {issue.title}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <Flag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No sprints planned for this project yet</p>
          {userRole === "PROJECT_MANAGER" && (
            <p className="text-xs text-slate-400 mt-1">Start by creating your first agile sprint cycle</p>
          )}
        </div>
      )}

      {/* Feature Modals */}
      <SprintModal
        isOpen={isSprintModalOpen}
        onClose={() => setIsSprintModalOpen(false)}
        selectedProject={selectedProject}
        userRole={userRole}
        mode={sprintModalMode}
        sprintToEdit={selectedProject.sprints?.find(s => s.id === editingSprintId)}
        refreshProject={refreshProject}
      />
    </div>
  );
};

export default ProjectSprintsView;
