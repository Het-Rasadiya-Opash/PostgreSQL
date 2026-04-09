import React, { useState, useEffect } from "react";
import { MessageSquare, Send, User, Loader2 } from "lucide-react";
import apiRequest from "../../utils/apiRequest";

const CommentSection = ({ issueId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (issueId) {
      fetchComments();
    }
  }, [issueId]);

  const fetchComments = async () => {
    try {
      setFetching(true);
      const response = await apiRequest.get(`/comments/issue/${issueId}`);
      setComments(response.data.comments || []);
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
      const response = await apiRequest.post("/comments", {
        body: newComment,
        issueId,
      });
      setComments([...comments, response.data.comment]);
      setNewComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
      alert(err.response?.data?.message || "Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-slate-500" />
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          Discussion ({comments.length})
        </h4>
      </div>

      <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
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
            <div key={comment.id} className="flex gap-3 items-start animate-in fade-in duration-300">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600">
                  {comment.author?.name ? comment.author.name[0].toUpperCase() : comment.author?.email[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-900">
                      {comment.author?.name || "Member"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {comment.body}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative group">
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
          className="absolute right-2.5 bottom-2.5 p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer shadow-md hover:shadow-lg"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
