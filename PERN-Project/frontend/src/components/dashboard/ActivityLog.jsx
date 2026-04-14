import React, { useState, useEffect } from "react";
import { History, ArrowRight, Loader2, UserCheck, Tag, AlignLeft, Activity } from "lucide-react";
import apiRequest from "../../utils/apiRequest";

const fieldIcon = {
  status:   <Activity className="w-3 h-3 text-amber-500" />,
  priority: <Tag className="w-3 h-3 text-violet-500" />,
  assignee: <UserCheck className="w-3 h-3 text-blue-500" />,
  title:    <AlignLeft className="w-3 h-3 text-slate-500" />,
  created:  <History className="w-3 h-3 text-emerald-500" />,
};

const fieldLabel = {
  status:   "Status",
  priority: "Priority",
  assignee: "Assignee",
  title:    "Title",
  created:  "Created",
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const ActivityLog = ({ issueId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!issueId) return;
    setLoading(true);
    apiRequest.get(`/issues/${issueId}/activity`)
      .then((res) => setActivities(res.data.activities || []))
      .catch((err) => console.error("Error fetching activity:", err))
      .finally(() => setLoading(false));
  }, [issueId]);

  return (
    <div className="mt-6 pt-6 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-slate-500" />
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          Activity ({activities.length})
        </h4>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
        </div>
      ) : activities.length === 0 ? (
        <p className="text-xs text-slate-400 italic text-center py-2">No activity yet.</p>
      ) : (
        <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
          {activities.map((a) => (
            <div key={a.id} className="flex items-start gap-3 py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors">
              {/* Actor avatar */}
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                {a.actor?.avatar ? (
                  <img src={a.actor.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[9px] font-bold text-white">
                    {a.actor?.name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-700">{a.actor?.name ?? "Someone"}</span>

                  {a.field === "created" ? (
                    <span className="text-xs text-slate-500">created this issue</span>
                  ) : (
                    <>
                      <span className="text-xs text-slate-500">changed</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {fieldIcon[a.field]}
                        {fieldLabel[a.field] ?? a.field}
                      </span>
                      {a.oldValue && (
                        <>
                          <span className="text-[10px] font-semibold text-slate-400 line-through truncate max-w-20">{a.oldValue}</span>
                          <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                        </>
                      )}
                      <span className="text-[10px] font-bold text-slate-700 truncate max-w-20">{a.newValue ?? "—"}</span>
                    </>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(a.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
