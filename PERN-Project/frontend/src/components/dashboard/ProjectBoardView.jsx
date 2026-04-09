import React, { useState } from "react";
import { AlertCircle, PlusCircle, Tag, X, Loader2 } from "lucide-react";
import KanbanBoard from "../KanbanBoard";
import apiRequest from "../../utils/apiRequest";
import CommentSection from "./CommentSection";
import { Search, Filter } from "lucide-react";

const ProjectBoardView = ({
  selectedProject,
  userRole,
  refreshProject,
  fetchMyIssues
}) => {
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    assigneeId: "",
    sprintId: "",
  });
  const [issueSubmitLoading, setIssueSubmitLoading] = useState(false);
  const [issueModalMode, setIssueModalMode] = useState("create");
  const [editingIssueId, setEditingIssueId] = useState(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!issueForm.title || !selectedProject) return;

    try {
      setIssueSubmitLoading(true);
      if (issueModalMode === "create") {
        await apiRequest.post("/issues", {
          ...issueForm,
          projectId: selectedProject.id,
        });
      } else {
        await apiRequest.put(`/issues/${editingIssueId}`, issueForm);
      }
      
      await refreshProject(selectedProject.id);
      fetchMyIssues();
      
      setIssueForm({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: "",
        sprintId: "",
      });
      setIsIssueModalOpen(false);
      setEditingIssueId(null);
    } catch (err) {
      console.error("Error creating/updating issue:", err);
      alert(err.response?.data?.message || "Failed to process issue");
    } finally {
      setIssueSubmitLoading(false);
    }
  };

  const handleEditIssue = (issue) => {
    setIssueModalMode("edit");
    setEditingIssueId(issue.id);
    setIssueForm({
      title: issue.title,
      description: issue.description || "",
      status: issue.status,
      priority: issue.priority,
      assigneeId: issue.assigneeId || "",
      sprintId: issue.sprintId || "",
    });
    setIsIssueModalOpen(true);
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    try {
      await apiRequest.delete(`/issues/${issueId}`);
      refreshProject(selectedProject.id);
      fetchMyIssues();
    } catch (err) {
      console.error("Error deleting issue:", err);
      alert(err.response?.data?.message || "Failed to delete issue");
    }
  };

  const handleStatusDragUpdate = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;

    try {
      await apiRequest.put(`/issues/${draggableId}`, { status: newStatus });
      refreshProject(selectedProject.id);
      fetchMyIssues();
    } catch (err) {
      console.error("Failed to update status via drag", err);
      refreshProject(selectedProject.id); // Reset optimistic update if needed
    }
  };

  const filteredIssues = selectedProject.issues?.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         issue.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "ALL" || issue.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  }) || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-500" />
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Issues ({selectedProject.issues?.length || 0})
          </h4>
        </div>
        <button
          onClick={() => {
            setIssueModalMode("create");
            setIssueForm({
              title: "",
              description: "",
              status: "TODO",
              priority: "MEDIUM",
              assigneeId: "",
              sprintId: "",
            });
            setEditingIssueId(null);
            setIsIssueModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-all duration-200 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Issue</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search issues..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
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

      {isIssueModalOpen && (
        <div className="mb-6 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {issueModalMode === "create" ? "Create New Issue" : "Edit Issue"}
            </h5>
            <button
              onClick={() => setIsIssueModalOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCreateIssue} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                Title
              </label>
              <input
                required
                disabled={userRole === "DEVELOPER" && issueModalMode === "edit"}
                type="text"
                placeholder="e.g. Implement user auth"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                value={issueForm.title}
                onChange={(e) =>
                  setIssueForm({ ...issueForm, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                Description
              </label>
              <textarea
                rows={2}
                disabled={userRole === "DEVELOPER" && issueModalMode === "edit"}
                placeholder="What needs to be done?"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none disabled:bg-slate-50 disabled:text-slate-500"
                value={issueForm.description}
                onChange={(e) =>
                  setIssueForm({ ...issueForm, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  value={issueForm.status}
                  onChange={(e) =>
                    setIssueForm({ ...issueForm, status: e.target.value })
                  }
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Priority
                </label>
                <select
                  disabled={userRole === "DEVELOPER" && issueModalMode === "edit"}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                  value={issueForm.priority}
                  onChange={(e) =>
                    setIssueForm({ ...issueForm, priority: e.target.value })
                  }
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Assignee
                </label>
                <select
                  disabled={userRole === "DEVELOPER" && issueModalMode === "edit"}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                  value={issueForm.assigneeId}
                  onChange={(e) =>
                    setIssueForm({ ...issueForm, assigneeId: e.target.value })
                  }
                >
                  <option value="">Unassigned</option>
                  {selectedProject.members?.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name || member.email}
                    </option>
                  ))}
                  <option value={selectedProject.owner?.id}>
                    {selectedProject.owner?.name} (Owner)
                  </option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Sprint
                </label>
                <select
                  disabled={userRole === "DEVELOPER" && issueModalMode === "edit"}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                  value={issueForm.sprintId}
                  onChange={(e) =>
                    setIssueForm({ ...issueForm, sprintId: e.target.value })
                  }
                >
                  <option value="">Backlog (No Sprint)</option>
                  {selectedProject.sprints?.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={issueSubmitLoading || !issueForm.title}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {issueSubmitLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <PlusCircle className="w-3.5 h-3.5" />
                )}
                {issueModalMode === "create" ? "Create Issue" : "Update Issue"}
              </button>
            </div>
          </form>

          {/* Discussion Section - Dedicated to existing issues */}
          {issueModalMode === "edit" && editingIssueId && (
            <div className="border-t border-slate-100 px-1">
              <CommentSection 
                issueId={editingIssueId} 
                currentUser={null} // Component handles its own state
              />
            </div>
          )}
        </div>
      )}

      {selectedProject.issues && selectedProject.issues.length > 0 ? (
        <div className="mt-4">
          <KanbanBoard
            issues={filteredIssues}
            onDragEnd={handleStatusDragUpdate}
            onIssueClick={handleEditIssue}
            onDeleteIssue={handleDeleteIssue}
            userRole={userRole}
          />
        </div>
      ) : (
        <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">
            No issues reported yet
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Start tracking tasks and bugs by adding your first issue
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectBoardView;
