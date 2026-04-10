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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 transition-all duration-200 cursor-pointer"
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
              PLANNED:   { color: "bg-slate-50 text-slate-500 border-slate-200",   label: "Planned" },
              ACTIVE:    { color: "bg-blue-50 text-blue-600 border-blue-200",       label: "Active" },
              COMPLETED: { color: "bg-emerald-50 text-emerald-600 border-emerald-200", label: "Completed" },
            };
            const cfg = statusConfig[sprint.status] || statusConfig.PLANNED;

            return (
              <div
                key={sprint.id}
                className="group flex flex-col p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50">
                      <Flag className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">{sprint.name}</h5>
                      {sprint.goal && (
                        <p className="text-xs text-slate-500 mt-0.5 italic line-clamp-1">{sprint.goal}</p>
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
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer"
                          >
                            <Play className="w-3 h-3" /> Start
                          </button>
                        )}
                        {sprint.status === "ACTIVE" && (
                          <button
                            onClick={() => handleStatusChange(sprint, "COMPLETED")}
                            title="Complete Sprint"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer"
                          >
                            <CheckCheck className="w-3 h-3" /> Complete
                          </button>
                        )}
                        {sprint.status === "COMPLETED" && (
                          <button
                            onClick={() => handleStatusChange(sprint, "PLANNED")}
                            title="Reopen Sprint"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" /> Reopen
                          </button>
                        )}
                        <button
                          onClick={() => handleEditSprint(sprint)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                          title="Edit Sprint"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : "—"}
                    {" → "}
                    {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : "—"}
                  </span>
                </div>

                {/* Subtask progress */}
                {totalSubTasks > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => toggleSprintSubTasks(sprint.id)}
                      className="w-full flex items-center justify-between mb-1.5 hover:bg-slate-50 p-1 rounded-lg transition-colors cursor-pointer group/progress"
                    >
                      <div className="flex items-center gap-1.5">
                        {doneSubTasks === totalSubTasks ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-300 group-hover/progress:text-blue-400" />
                        )}
                        <span className="text-[11px] font-semibold text-slate-500">
                          {doneSubTasks}/{totalSubTasks} subtasks complete
                        </span>
                        {expandedSprints[sprint.id] ? (
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                      <span className={`text-[11px] font-bold ${
                        subTaskPct === 100 ? "text-emerald-600" : "text-slate-400"
                      }`}>{subTaskPct}%</span>
                    </button>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          subTaskPct === 100 ? "bg-emerald-500" : "bg-violet-400"
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
                              <span className={`text-[11px] leading-tight truncate ${
                                sub.isCompleted ? "line-through text-slate-400" : "text-slate-600"
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
