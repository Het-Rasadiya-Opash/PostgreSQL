import React, { useState, useEffect } from "react";
import { MessageSquare, Send, Loader2, Trash2 } from "lucide-react";
import apiRequest from "../../utils/apiRequest";

const CommentSection = ({ issueId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setLoading(true);
      const res = await apiRequest.post("/comments", { body: newComment, issueId });
      setComments((prev) => [...prev, res.data.comment]);
      setNewComment("");
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
                  <p className="text-sm text-slate-700 leading-relaxed">{comment.body}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <textarea
          rows={2}
          placeholder="Write a comment..."
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none pr-12"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="absolute right-2.5 bottom-2.5 p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer shadow-md"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
