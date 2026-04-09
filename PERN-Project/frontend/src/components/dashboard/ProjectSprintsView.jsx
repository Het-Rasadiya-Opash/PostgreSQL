import React from 'react';
import { Calendar, Flag, PlusCircle, X, Edit3, Loader2 } from 'lucide-react';

const ProjectSprintsView = ({
  selectedProject,
  userRole,
  isSprintModalOpen,
  setIsSprintModalOpen,
  sprintModalMode,
  setSprintModalMode,
  sprintForm,
  setSprintForm,
  handleCreateSprint,
  sprintSubmitLoading,
  setEditingSprintId,
  handleEditSprint
}) => {
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
              setSprintForm({ name: "", goal: "", startDate: "", endDate: "" });
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

      {isSprintModalOpen && (
        <div className="mb-6 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-sm font-bold text-blue-900 flex items-center gap-2">
              <Flag className="w-4 h-4" />
              {sprintModalMode === "create" ? "Create New Sprint" : "Edit Sprint"}
            </h5>
            <button 
              onClick={() => setIsSprintModalOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCreateSprint} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Sprint Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Q1 Alpha"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={sprintForm.name}
                  onChange={(e) => setSprintForm({ ...sprintForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Sprint Goal</label>
                <input
                  type="text"
                  placeholder="Primary objective..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={sprintForm.goal}
                  onChange={(e) => setSprintForm({ ...sprintForm, goal: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={sprintForm.startDate}
                  onChange={(e) => setSprintForm({ ...sprintForm, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">End Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={sprintForm.endDate}
                  onChange={(e) => setSprintForm({ ...sprintForm, endDate: e.target.value })}
                />
              </div>
              {sprintModalMode === "edit" && (
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Status</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={sprintForm.status}
                    onChange={(e) => setSprintForm({ ...sprintForm, status: e.target.value })}
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={sprintSubmitLoading || !sprintForm.name}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {sprintSubmitLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                {sprintModalMode === "create" ? "Create Sprint" : "Update Sprint"}
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedProject.sprints && selectedProject.sprints.length > 0 ? (
        <div className="space-y-3">
          {selectedProject.sprints.map((sprint) => (
            <div
              key={sprint.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50">
                  <Flag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900">{sprint.name}</h5>
                  {sprint.goal && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 italic">{sprint.goal}</p>
                  )}
                </div>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center gap-4 text-[11px] font-bold text-slate-400">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : "—"} 
                    {" → "}
                    {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : "—"}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] uppercase tracking-tighter border ${
                  sprint.status === "ACTIVE" 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-slate-50 text-slate-500 border-slate-100"
                }`}>
                  {sprint.status}
                </span>
                {userRole === "PROJECT_MANAGER" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSprint(sprint);
                    }}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                    title="Edit Sprint"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
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
    </div>
  );
};

export default ProjectSprintsView;
