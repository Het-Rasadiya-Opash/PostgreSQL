import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { 
  Tag, 
  Loader2, 
  ListChecks, 
  Circle, 
  Plus, 
  Trash2 as TrashIcon,
  AlertCircle,
  CalendarClock,
} from "lucide-react";
import Modal from "../ui/Modal";
import apiRequest from "../../utils/apiRequest";
import SubTaskSection from "./SubTaskSection";
import CommentSection from "./CommentSection";
import ActivityLog from "./ActivityLog";
import { formatDate } from "../../utils/dateFormat";
import Button from "../ui/Button";
import Input from "../ui/Input";

const IssueModal = ({
  isOpen,
  onClose,
  selectedProject,
  userRole,
  mode = "create",
  issueToEdit = null,
  refreshProject,
  fetchMyIssues,
  onOptimisticSprintUpdate,
}) => {
  const [issueForm, setIssueForm] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    assigneeId: "",
    sprintId: "",
    dueDate: "",
  });
  const [issueSubmitLoading, setIssueSubmitLoading] = useState(false);
  const [pendingSubTasks, setPendingSubTasks] = useState([]);
  const [pendingSubTaskInput, setPendingSubTaskInput] = useState("");

  // Populate form if editing
  useEffect(() => {
    if (mode === "edit" && issueToEdit) {
      setIssueForm({
        title: issueToEdit.title,
        description: issueToEdit.description || "",
        status: issueToEdit.status,
        priority: issueToEdit.priority,
        assigneeId: issueToEdit.assigneeId || "",
        sprintId: issueToEdit.sprintId || "",
        dueDate: issueToEdit.dueDate ? issueToEdit.dueDate.split("T")[0] : "",
      });
      setPendingSubTasks([]);
    } else {
      setIssueForm({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: "",
        sprintId: "",
        dueDate: "",
      });
      setPendingSubTasks([]);
    }
    setPendingSubTaskInput("");
  }, [mode, issueToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issueForm.title || !selectedProject) return;

    try {
      setIssueSubmitLoading(true);
      if (mode === "create") {
        const res = await apiRequest.post("/issues", {
          ...issueForm,
          projectId: selectedProject.id,
          assigneeId: issueForm.assigneeId || undefined,
          sprintId: issueForm.sprintId || undefined,
          dueDate: issueForm.dueDate || undefined,
        });
        if (pendingSubTasks.length > 0) {
          await Promise.all(
            pendingSubTasks.map((title) =>
              apiRequest.post(`/subtasks/${res.data.issue.id}`, { title })
            )
          );
        }
      } else {
        await apiRequest.put(`/issues/${issueToEdit.id}`, {
          ...issueForm,
          assigneeId: issueForm.assigneeId || null,
          sprintId: issueForm.sprintId || null,
          dueDate: issueForm.dueDate || null,
        });

        // Optimistically update sprint status if status changed
        if (onOptimisticSprintUpdate && issueForm.sprintId && issueForm.status !== issueToEdit.status) {
          const sprintId = issueForm.sprintId;
          const allIssues = selectedProject?.issues || [];
          // Simulate updated issues with new status
          const updatedIssues = allIssues.map(i =>
            i.id === issueToEdit.id ? { ...i, status: issueForm.status } : i
          );
          const sprintIssues = updatedIssues.filter(i => i.sprintId === sprintId);
          const allDone = sprintIssues.every(i => i.status === "DONE");
          const allTodo = sprintIssues.every(i => i.status === "TODO");
          const newSprintStatus = allDone ? "COMPLETED" : allTodo ? "PLANNED" : "ACTIVE";
          onOptimisticSprintUpdate(sprintId, newSprintStatus);
        }
      }

      await refreshProject(selectedProject.id);
      if (fetchMyIssues) fetchMyIssues();
      onClose();
    } catch (err) {
      console.error("Error creating/updating issue:", err);
      alert(err.response?.data?.message || "Failed to process issue");
    } finally {
      setIssueSubmitLoading(false);
    }
  };

  const currentUser = useSelector((state) => state.users.currentUser);
  const isDeveloperEdit = userRole === "DEVELOPER" && mode === "edit";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Create Issue" : "Edit Issue"}
      icon={Tag}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">        
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-ads-text-subtlest uppercase tracking-wider ml-1">
              Title
            </label>
            <Input
              required
              disabled={isDeveloperEdit}
              placeholder="e.g. Implement user auth"
              value={issueForm.title}
              onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-ads-text-subtlest uppercase tracking-wider ml-1">
              Description
            </label>
            <textarea
              rows={3}
              disabled={isDeveloperEdit}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2 rounded-md border border-ads-border bg-white text-sm focus:ring-2 focus:ring-ads-border-focus outline-none transition-all resize-none disabled:bg-ads-surface disabled:text-ads-text-subtlest"
              value={issueForm.description}
              onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-ads-text-subtlest uppercase tracking-wider ml-1">
                Status
              </label>
              <select
                className="w-full h-10 px-3 py-2 rounded-md border border-ads-border bg-white text-sm focus:ring-2 focus:ring-ads-border-focus outline-none transition-all"
                value={issueForm.status}
                onChange={(e) => setIssueForm({ ...issueForm, status: e.target.value })}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-ads-text-subtlest uppercase tracking-wider ml-1">
                Priority
              </label>
              <select
                disabled={isDeveloperEdit}
                className="w-full h-10 px-3 py-2 rounded-md border border-ads-border bg-white text-sm focus:ring-2 focus:ring-ads-border-focus outline-none transition-all disabled:bg-ads-surface"
                value={issueForm.priority}
                onChange={(e) => setIssueForm({ ...issueForm, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-ads-text-subtlest uppercase tracking-wider ml-1">
                Assignee
              </label>
              <select
                disabled={isDeveloperEdit}
                className="w-full h-10 px-3 py-2 rounded-md border border-ads-border bg-white text-sm focus:ring-2 focus:ring-ads-border-focus outline-none transition-all disabled:bg-ads-surface"
                value={issueForm.assigneeId}
                onChange={(e) => setIssueForm({ ...issueForm, assigneeId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {selectedProject?.members?.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name || member.email}
                  </option>
                ))}
                <option value={selectedProject?.owner?.id}>
                  {selectedProject?.owner?.name} (Owner)
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-ads-text-subtlest uppercase tracking-wider ml-1">
                Sprint
              </label>
              <select
                disabled={isDeveloperEdit}
                className="w-full h-10 px-3 py-2 rounded-md border border-ads-border bg-white text-sm focus:ring-2 focus:ring-ads-border-focus outline-none transition-all disabled:bg-ads-surface"
                value={issueForm.sprintId}
                onChange={(e) => {
                  const sprintId = e.target.value;
                  const sprint = selectedProject?.sprints?.find(s => s.id === sprintId);
                  const updates = { sprintId };
                  // Auto-set due date to sprint end date if not already set
                  if (sprint?.endDate && !issueForm.dueDate) {
                    updates.dueDate = sprint.endDate.split("T")[0];
                  }
                  setIssueForm({ ...issueForm, ...updates });
                }}
              >
                <option value="">Backlog (No Sprint)</option>
                {selectedProject?.sprints?.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                    {sprint.startDate && sprint.endDate
                      ? ` (${formatDate(sprint.startDate)} – ${formatDate(sprint.endDate)})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-ads-text-subtlest uppercase tracking-wider ml-1 flex items-center gap-1">
                <CalendarClock className="w-3 h-3" /> Due Date
              </label>
              {(() => {
                const sprint = selectedProject?.sprints?.find(s => s.id === issueForm.sprintId);
                const minDate = sprint?.startDate ? sprint.startDate.split("T")[0] : undefined;
                const maxDate = sprint?.endDate   ? sprint.endDate.split("T")[0]   : undefined;
                return (
                  <div className="relative">
                    <input
                      type="date"
                      disabled={isDeveloperEdit}
                      min={minDate}
                      max={maxDate}
                      className="w-full h-10 px-3 py-2 rounded-md border border-ads-border bg-white text-sm focus:ring-2 focus:ring-ads-border-focus outline-none transition-all disabled:bg-ads-surface disabled:text-ads-text-subtlest"
                      value={issueForm.dueDate}
                      onChange={(e) => {
                        const dueDate = e.target.value;
                        const updates = { dueDate };
                        // Auto-select sprint whose range contains this due date
                        if (dueDate && !issueForm.sprintId) {
                          const due = new Date(dueDate);
                          const matchingSprint = selectedProject?.sprints?.find(s => {
                            if (!s.startDate || !s.endDate) return false;
                            const start = new Date(s.startDate);
                            const end   = new Date(s.endDate);
                            start.setHours(0,0,0,0);
                            end.setHours(23,59,59,999);
                            return due >= start && due <= end;
                          });
                          if (matchingSprint) updates.sprintId = matchingSprint.id;
                        }
                        setIssueForm({ ...issueForm, ...updates });
                      }}
                    />
                    {sprint && (minDate || maxDate) && (
                      <p className="text-[10px] text-ads-text-subtlest mt-1 ml-1">
                        Sprint range: {minDate ?? "—"} → {maxDate ?? "—"}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Subtasks logic */}
          {mode === "create" ? (
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-ads-primary" />
                <label className="text-[10px] font-bold text-ads-text-subtlest uppercase tracking-wider">
                  Post-creation Subtasks
                </label>
              </div>

              <div className="space-y-2">
                {pendingSubTasks.map((title, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-md bg-ads-surface border border-ads-border group">
                    <Circle className="w-3.5 h-3.5 text-ads-text-subtlest" />
                    <span className="flex-1 text-xs text-ads-text">{title}</span>
                    <button
                      type="button"
                      onClick={() => setPendingSubTasks(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1 rounded hover:bg-red-50 text-ads-text-subtlest hover:text-ads-danger transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-ads-border bg-ads-surface focus-within:border-ads-border-focus transition-all">
                  <Plus className="w-3.5 h-3.5 text-ads-text-subtlest shrink-0" />
                  <input
                    type="text"
                    placeholder="Add a subtask and press Enter..."
                    className="flex-1 bg-transparent text-xs text-ads-text outline-none"
                    value={pendingSubTaskInput}
                    onChange={(e) => setPendingSubTaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (pendingSubTaskInput.trim()) {
                          setPendingSubTasks(prev => [...prev, pendingSubTaskInput.trim()]);
                          setPendingSubTaskInput("");
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t border-ads-border">
              <SubTaskSection issueId={issueToEdit.id} onSubTaskChange={() => refreshProject(selectedProject.id)} />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-ads-border">
           <Button variant="ghost" type="button" onClick={onClose}>
             Cancel
           </Button>
           <Button type="submit" loading={issueSubmitLoading} disabled={!issueForm.title}>
             {mode === "create" ? "Create Issue" : "Update Issue"}
           </Button>
        </div>
      </form>

      {/* Comments — outside form to prevent submit conflict */}
      {mode === "edit" && issueToEdit && (
        <div className="px-6 pb-6">
          <CommentSection
          issueId={issueToEdit.id}
          currentUser={currentUser}
          onCommentChange={() => refreshProject(selectedProject.id)}
          members={[
            ...(selectedProject?.members || []),
            selectedProject?.owner ? { ...selectedProject.owner, role: "PROJECT_MANAGER" } : null,
          ].filter(Boolean)}
        />
        </div>
      )}

      {mode === "edit" && issueToEdit && (
        <div className="px-6 pb-6">
          <ActivityLog issueId={issueToEdit.id} />
        </div>
      )}
    </Modal>
  );
};

export default IssueModal;
