import React, { useState, useEffect } from "react";
import { Flag, Loader2, Calendar } from "lucide-react";
import Modal from "../ui/Modal";
import apiRequest from "../../utils/apiRequest";
import Button from "../ui/Button";
import Input from "../ui/Input";

const SprintModal = ({
  isOpen,
  onClose,
  selectedProject,
  userRole,
  mode = "create",
  sprintToEdit = null,
  refreshProject
}) => {
  const [sprintForm, setSprintForm] = useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
    status: "PLANNED",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && sprintToEdit) {
      setSprintForm({
        name: sprintToEdit.name,
        goal: sprintToEdit.goal || "",
        startDate: sprintToEdit.startDate ? sprintToEdit.startDate.split("T")[0] : "",
        endDate: sprintToEdit.endDate ? sprintToEdit.endDate.split("T")[0] : "",
        status: sprintToEdit.status || "PLANNED",
      });
    } else {
      setSprintForm({
        name: "",
        goal: "",
        startDate: "",
        endDate: "",
        status: "PLANNED",
      });
    }
  }, [mode, sprintToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sprintForm.name || !selectedProject) return;

    try {
      setLoading(true);
      if (mode === "create") {
        await apiRequest.post("/sprints", {
          ...sprintForm,
          projectId: selectedProject.id,
        });
      } else {
        await apiRequest.put(`/sprints/${sprintToEdit.id}`, sprintForm);
      }
      
      await refreshProject(selectedProject.id);
      onClose();
    } catch (err) {
      console.error("Error creating/updating sprint:", err);
      alert(err.response?.data?.message || "Failed to process sprint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Create New Sprint" : "Edit Sprint"}
      icon={Flag}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[10px] font-bold text-ads-text-subtlest uppercase tracking-wider ml-1">
              Sprint Name
            </label>
            <Input
              required
              placeholder="e.g. Q1 Alpha Sprint"
              value={sprintForm.name}
              onChange={(e) => setSprintForm({ ...sprintForm, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[10px] font-bold text-ads-text-subtlest uppercase tracking-wider ml-1">
              Sprint Goal
            </label>
            <input
              type="text"
              placeholder="What is the primary objective?"
              className="w-full h-10 px-3 py-2 rounded-md border border-ads-border bg-white text-sm focus:ring-2 focus:ring-ads-border-focus outline-none transition-all"
              value={sprintForm.goal}
              onChange={(e) => setSprintForm({ ...sprintForm, goal: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-ads-text-subtlest uppercase tracking-wider ml-1">
              Start Date
            </label>
            <input
              type="date"
              className="w-full h-10 px-3 py-2 rounded-md border border-ads-border bg-white text-sm focus:ring-2 focus:ring-ads-border-focus outline-none transition-all"
              value={sprintForm.startDate}
              onChange={(e) => setSprintForm({ ...sprintForm, startDate: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-ads-text-subtlest uppercase tracking-wider ml-1">
              End Date
            </label>
            <input
              type="date"
              className="w-full h-10 px-3 py-2 rounded-md border border-ads-border bg-white text-sm focus:ring-2 focus:ring-ads-border-focus outline-none transition-all"
              value={sprintForm.endDate}
              onChange={(e) => setSprintForm({ ...sprintForm, endDate: e.target.value })}
            />
          </div>

          {mode === "edit" && (
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-ads-text-subtlest uppercase tracking-wider ml-1">
                Status
              </label>
              <select
                className="w-full h-10 px-3 py-2 rounded-md border border-ads-border bg-white text-sm focus:ring-2 focus:ring-ads-border-focus outline-none transition-all"
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

        <div className="flex justify-end gap-3 pt-4 border-t border-ads-border">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!sprintForm.name}>
            {mode === "create" ? "Create Sprint" : "Update Sprint"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SprintModal;
