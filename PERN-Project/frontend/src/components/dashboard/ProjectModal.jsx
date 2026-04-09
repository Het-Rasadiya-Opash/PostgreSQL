import React from 'react';
import { FolderPlus, X, Loader2 } from 'lucide-react';

const ProjectModal = ({
  isProjectModalOpen,
  setIsProjectModalOpen,
  modalMode,
  projectForm,
  setProjectForm,
  formStatus,
  handleProjectSubmit
}) => {
  if (!isProjectModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsProjectModalOpen(false)}
      />

      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <FolderPlus className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {modalMode === "create" ? "New Project" : "Edit Project"}
            </h3>
          </div>
          <button
            onClick={() => setIsProjectModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleProjectSubmit} className="p-6 space-y-5">
          {formStatus.error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm font-semibold text-red-600 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              {formStatus.error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Project Name
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Marketing Automation"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              value={projectForm.name}
              onChange={(e) =>
                setProjectForm({ ...projectForm, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Project Key
            </label>
            <div className="relative">
              <input
                required
                type="text"
                placeholder="e.g. MKT"
                maxLength={10}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                value={projectForm.key}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    key: e.target.value
                      .replace(/[^a-zA-Z]/g, "")
                      .toUpperCase(),
                  })
                }
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-1.5 py-0.5 rounded uppercase pointer-events-none">
                Short Code
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Description{" "}
              <span className="text-slate-300 font-normal italic">
                (optional)
              </span>
            </label>
            <textarea
              rows={3}
              placeholder="What is this project about?"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
              value={projectForm.description}
              onChange={(e) =>
                setProjectForm({
                  ...projectForm,
                  description: e.target.value,
                })
              }
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsProjectModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all duration-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formStatus.loading}
              className="flex-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {formStatus.loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white/80" />
              ) : (
                modalMode === "create" ? "Create Project" : "Update Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
