import React, { useState } from "react";
import { AlertCircle, PlusCircle, Search, Filter } from "lucide-react";
import KanbanBoard from "../KanbanBoard";
import apiRequest from "../../utils/apiRequest";
import IssueModal from "./IssueModal";
import ActivityDrawer from "./ActivityDrawer";

const ProjectBoardView = ({
  selectedProject,
  userRole,
  refreshProject,
  fetchMyIssues
}) => {
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueModalMode, setIssueModalMode] = useState("create");
  const [editingIssueId, setEditingIssueId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [activityIssue, setActivityIssue] = useState(null);
  // Local optimistic issues state
  const [localIssues, setLocalIssues] = useState(null);

  // Always derive from localIssues (optimistic) or selectedProject.issues
  const issues = localIssues ?? selectedProject.issues ?? [];

  // Reset local state when selectedProject changes (after refreshProject resolves)
  React.useEffect(() => {
    setLocalIssues(null);
  }, [selectedProject]);

  const handleEditIssue = (issue) => {
    setIssueModalMode("edit");
    setEditingIssueId(issue.id);
    setIsIssueModalOpen(true);
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    try {
      // Optimistic remove
      setLocalIssues((prev) => (prev ?? selectedProject.issues ?? []).filter(i => i.id !== issueId));
      await apiRequest.delete(`/issues/${issueId}`);
      refreshProject(selectedProject.id);
      fetchMyIssues();
    } catch (err) {
      setLocalIssues(null);
      console.error("Error deleting issue:", err);
      alert(err.response?.data?.message || "Failed to delete issue");
    }
  };

  // Optimistic sprint status derivation
  const deriveSprintStatus = (sprintId, updatedIssues) => {
    const sprintIssues = updatedIssues.filter(i => i.sprintId === sprintId);
    if (sprintIssues.length === 0) return "PLANNED";
    const allDone = sprintIssues.every(i => i.status === "DONE");
    const allTodo = sprintIssues.every(i => i.status === "TODO");
    if (allDone) return "COMPLETED";
    if (allTodo) return "PLANNED";
    return "ACTIVE";
  };

  const handleStatusDragUpdate = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;

    // Optimistic update — move card instantly
    const updatedIssues = (localIssues ?? selectedProject.issues ?? []).map(i =>
      i.id === draggableId ? { ...i, status: newStatus } : i
    );
    setLocalIssues(updatedIssues);

    try {
      await apiRequest.put(`/issues/${draggableId}`, { status: newStatus });
      refreshProject(selectedProject.id);
      fetchMyIssues();
    } catch (err) {
      setLocalIssues(null);
      console.error("Failed to update status via drag", err);
      refreshProject(selectedProject.id);
    }
  };

  const handleToggleSubTask = async (subTaskId) => {
    try {
      await apiRequest.patch(`/subtasks/${subTaskId}/toggle`);
      refreshProject(selectedProject.id);
    } catch (err) {
      console.error("Failed to toggle subtask:", err);
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "ALL" || issue.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="bg-ads-surface-white rounded-2xl border border-ads-border shadow-sm p-4 sm:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-ads-text-subtlest" />
          <h4 className="text-sm font-bold text-ads-text-subtlest uppercase tracking-wider">
            Issues ({issues.length})
          </h4>
        </div>
        <button
          onClick={() => {
            setIssueModalMode("create");
            setEditingIssueId(null);
            setIsIssueModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-ads-success hover:bg-ads-success-light border border-ads-success/20 transition-all duration-200 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Issue</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ads-text-subtlest" />
          <input
            type="text"
            placeholder="Search issues..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-ads-border bg-ads-surface text-sm focus:ring-2 focus:ring-ads-primary/10 focus:border-ads-primary outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-ads-text-subtlest" />
          <select
            className="px-3 py-2 rounded-xl border border-ads-border bg-ads-surface text-sm focus:ring-2 focus:ring-ads-primary/10 focus:border-ads-primary outline-none transition-all"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>

      {issues.length > 0 ? (
        <div className="mt-4">
          <KanbanBoard
            issues={filteredIssues}
            onDragEnd={handleStatusDragUpdate}
            onIssueClick={handleEditIssue}
            onActivityClick={(issue) => setActivityIssue(issue)}
            onDeleteIssue={handleDeleteIssue}
            onToggleSubTask={handleToggleSubTask}
            userRole={userRole}
          />
        </div>
      ) : (
        <div className="text-center py-10 bg-ads-surface/50 rounded-2xl border border-dashed border-ads-border">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-ads-text-subtlest" />
          <p className="text-sm font-medium text-ads-text-subtle">
            No issues reported yet
          </p>
          <p className="text-xs text-ads-text-subtlest mt-1">
            Start tracking tasks and bugs by adding your first issue
          </p>
        </div>
      )}

      {/* Feature Modals */}
      <IssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        selectedProject={selectedProject}
        userRole={userRole}
        mode={issueModalMode}
        issueToEdit={issues.find(i => i.id === editingIssueId)}
        refreshProject={refreshProject}
        fetchMyIssues={fetchMyIssues}
      />

      {activityIssue && (
        <ActivityDrawer
          issue={activityIssue}
          onClose={() => setActivityIssue(null)}
        />
      )}
    </div>
  );
};

export default ProjectBoardView;
