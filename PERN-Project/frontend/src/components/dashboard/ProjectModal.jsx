import React from 'react';
import { FolderPlus } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ProjectModal = ({
  isProjectModalOpen,
  setIsProjectModalOpen,
  modalMode,
  projectForm,
  setProjectForm,
  formStatus,
  handleProjectSubmit
}) => {
  return (
    <Modal
      isOpen={isProjectModalOpen}
      onClose={() => setIsProjectModalOpen(false)}
      title={modalMode === "create" ? "New Project" : "Edit Project"}
      icon={FolderPlus}
    >
      <form onSubmit={handleProjectSubmit} className="p-6 space-y-5">
        {formStatus.error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm font-semibold text-red-600 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            {formStatus.error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-ads-text-subtlest uppercase tracking-wider ml-1">
            Project Name
          </label>
          <Input
            required
            placeholder="e.g. Marketing Automation"
            value={projectForm.name}
            onChange={(e) =>
              setProjectForm({ ...projectForm, name: e.target.value })
            }
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-ads-text-subtlest uppercase tracking-wider ml-1">
            Project Key
          </label>
          <div className="relative">
            <Input
              required
              placeholder="e.g. MKT"
              maxLength={10}
              className="font-bold uppercase pr-20"
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
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-ads-text-subtlest bg-ads-surface border border-ads-border px-1.5 py-0.5 rounded uppercase pointer-events-none">
              Short Code
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-ads-text-subtlest uppercase tracking-wider ml-1">
            Description{" "}
            <span className="text-ads-text-subtlest font-normal italic">
              (optional)
            </span>
          </label>
          <textarea
            rows={3}
            placeholder="What is this project about?"
            className="w-full px-3 py-2 rounded-md border border-ads-border bg-white text-sm focus:ring-2 focus:ring-ads-border-focus outline-none transition-all resize-none"
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
          <Button
            variant="ghost"
            type="button"
            className="flex-1"
            onClick={() => setIsProjectModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-2"
            loading={formStatus.loading}
          >
            {modalMode === "create" ? "Create Project" : "Update Project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectModal;
