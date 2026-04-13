import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, Circle, Plus, Trash2, Loader2, ListChecks } from "lucide-react";
import apiRequest from "../../utils/apiRequest";

const SubTaskSection = ({ issueId }) => {
  const [subTasks, setSubTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (issueId) fetchSubTasks();
  }, [issueId]);

  useEffect(() => {
    if (showInput) inputRef.current?.focus();
  }, [showInput]);

  const fetchSubTasks = async () => {
    try {
      const res = await apiRequest.get(`/issues/${issueId}`);
      setSubTasks(res.data.issue?.subTasks || []);
    } catch (err) {
      console.error("Error fetching subtasks:", err);
    }
  };

  const handleAdd = async (e) => {
    e?.preventDefault();
    if (!newTitle.trim()) return;
    try {
      setAdding(true);
      const res = await apiRequest.post(`/subtasks/${issueId}`, { title: newTitle.trim() });
      setSubTasks((prev) => [...prev, res.data.subTask]);
      setNewTitle("");
      inputRef.current?.focus();
    } catch (err) {
      console.error("Error adding subtask:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
    if (e.key === "Escape") { setShowInput(false); setNewTitle(""); }
  };

  const handleToggle = async (id) => {
    setTogglingId(id);
    try {
      const res = await apiRequest.patch(`/subtasks/${id}/toggle`);
      setSubTasks((prev) => prev.map((s) => (s.id === id ? res.data.subTask : s)));
    } catch (err) {
      console.error("Error toggling subtask:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await apiRequest.delete(`/subtasks/${id}`);
      setSubTasks((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Error deleting subtask:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const completed = subTasks.filter((s) => s.isCompleted).length;
  const total = subTasks.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mt-5 pt-5 border-t border-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-violet-500" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Subtasks</span>
          {total > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
              {completed}/{total}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowInput((v) => !v)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
            showInput
              ? "bg-violet-100 text-violet-700"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          }`}
        >
          <Plus className={`w-3.5 h-3.5 transition-transform duration-200 ${showInput ? "rotate-45" : ""}`} />
          Add subtask
        </button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-slate-400">Progress</span>
            <span className={`text-[10px] font-bold transition-colors ${progress === 100 ? "text-emerald-600" : "text-slate-500"}`}>
              {progress}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? "bg-emerald-500" : "bg-violet-500"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Subtask list */}
      {total > 0 && (
        <div className="space-y-1 mb-3">
          {subTasks.map((sub) => (
            <div
              key={sub.id}
              className={`flex items-center gap-3 group px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                sub.isCompleted
                  ? "bg-emerald-50/50 border-emerald-100"
                  : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggle(sub.id)}
                disabled={togglingId === sub.id}
                className="shrink-0 transition-all duration-200 hover:scale-110"
              >
                {togglingId === sub.id ? (
                  <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                ) : sub.isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 hover:text-violet-400" />
                )}
              </button>

              <span
                className={`flex-1 text-sm leading-snug transition-all duration-200 ${
                  sub.isCompleted ? "line-through text-slate-400" : "text-slate-700"
                }`}
              >
                {sub.title}
              </span>

              <button
                type="button"
                onClick={() => handleDelete(sub.id)}
                disabled={deletingId === sub.id}
                className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
              >
                {deletingId === sub.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inline add input */}
      {showInput && (
        <div className="flex items-center gap-2 p-1 rounded-xl border border-violet-200 bg-violet-50/50 focus-within:border-violet-400 focus-within:bg-white transition-all duration-200">
          <Circle className="w-4 h-4 text-slate-300 ml-2 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Write a subtask and press Enter..."
            className="flex-1 py-2 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || !newTitle.trim()}
            className="shrink-0 mr-1 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
          >
            {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
            Add
          </button>
        </div>
      )}

      {/* Empty state */}
      {total === 0 && !showInput && (
        <button
          type="button"
          onClick={() => setShowInput(true)}
          className="w-full py-3 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 hover:border-violet-300 hover:text-violet-500 hover:bg-violet-50/30 transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add your first subtask
        </button>
      )}
    </div>
  );
};

export default SubTaskSection;
