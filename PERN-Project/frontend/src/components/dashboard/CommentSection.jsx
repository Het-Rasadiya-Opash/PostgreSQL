import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Loader2, Trash2, AtSign } from "lucide-react";
import apiRequest from "../../utils/apiRequest";

// Render comment body with @mentions highlighted
const renderBody = (body) => {
  const parts = body.split(/(@\w[\w\s]*)/g);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="inline-flex items-center gap-0.5 text-indigo-600 font-semibold bg-indigo-50 px-1 rounded">
        {part}
      </span>
    ) : part
  );
};

const CommentSection = ({ issueId, currentUser, onCommentChange, members = [] }) => {
  const [comments,   setComments]   = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading,    setLoading]    = useState(false);
  const [fetching,   setFetching]   = useState(false);

  // Mention state
  const [mentionQuery,  setMentionQuery]  = useState("");
  const [mentionIndex,  setMentionIndex]  = useState(null); // cursor position of @
  const [showMentions,  setShowMentions]  = useState(false);
  const [activeOption,  setActiveOption]  = useState(0);

  const textareaRef = useRef(null);

  useEffect(() => {
    if (issueId) fetchComments();
  }, [issueId]);

  const fetchComments = async () => {
    try {
      setFetching(true);
      const res = await apiRequest.get(`/comments/issue/${issueId}`);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setFetching(false);
    }
  };

  // Filter members by mention query
  const mentionOptions = members.filter(m =>
    m.name?.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 5);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setNewComment(val);

    const cursor = e.target.selectionStart;
    const textUpToCursor = val.slice(0, cursor);
    const atMatch = textUpToCursor.match(/@([\w\s]*)$/);

    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setMentionIndex(cursor - atMatch[0].length);
      setShowMentions(true);
      setActiveOption(0);
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  };

  const insertMention = (member) => {
    const before = newComment.slice(0, mentionIndex);
    const after  = newComment.slice(mentionIndex + mentionQuery.length + 1); // +1 for @
    const inserted = `@${member.name} `;
    setNewComment(before + inserted + after);
    setShowMentions(false);
    setMentionQuery("");
    setTimeout(() => {
      textareaRef.current?.focus();
      const pos = before.length + inserted.length;
      textareaRef.current?.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (!showMentions) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveOption(o => Math.min(o + 1, mentionOptions.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveOption(o => Math.max(o - 1, 0)); }
    if (e.key === "Enter" && mentionOptions[activeOption]) { e.preventDefault(); insertMention(mentionOptions[activeOption]); }
    if (e.key === "Escape") setShowMentions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setLoading(true);
      const res = await apiRequest.post("/comments", { body: newComment, issueId });
      setComments((prev) => [...prev, res.data.comment]);
      setNewComment("");
      setShowMentions(false);
      onCommentChange?.();
    } catch (err) {
      console.error("Error posting comment:", err);
      alert(err.response?.data?.message || "Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await apiRequest.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onCommentChange?.();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const canDelete = (comment) =>
    currentUser &&
    (comment.author?.id === currentUser.id ||
      currentUser.role === "ADMIN" ||
      currentUser.role === "PROJECT_MANAGER");

  return (
    <div className="mt-6 pt-6 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-slate-500" />
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          Discussion ({comments.length})
        </h4>
      </div>

      {/* Comments list */}
      <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
        {fetching ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-2">
            No comments yet. Start the conversation.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 items-start group animate-in fade-in duration-300">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                {comment.author?.avatar ? (
                  <img src={comment.author.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-slate-600">
                    {(comment.author?.name || "?")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-900">
                      {comment.author?.name || "Member"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      {canDelete(comment) && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {renderBody(comment.body)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative">
        {/* Mention hint */}
        {members.length > 0 && (
          <div className="flex items-center gap-1 mb-1.5">
            <AtSign className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] text-slate-400">Type @ to mention a team member</span>
          </div>
        )}

        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={2}
            placeholder="Write a comment... (use @ to mention)"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none pr-12"
            value={newComment}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="absolute right-2.5 bottom-2.5 p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer shadow-md"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>

          {/* Mention dropdown */}
          {showMentions && mentionOptions.length > 0 && (
            <div className="absolute bottom-full left-0 mb-1 w-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-1 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mention</p>
              </div>
              {mentionOptions.map((member, idx) => (
                <button
                  key={member.id}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); insertMention(member); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${activeOption === idx ? "bg-indigo-50" : "hover:bg-slate-50"}`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 overflow-hidden">
                    {member.avatar ? (
                      <img src={member.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[9px] font-bold text-white">
                        {member.name?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{member.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{member.role?.toLowerCase().replace("_", " ")}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
