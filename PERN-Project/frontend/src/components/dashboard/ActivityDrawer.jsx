import React, { useState, useEffect, useRef } from "react";
import {
  X,
  History,
  ArrowRight,
  Loader2,
  Activity,
  Tag,
  UserCheck,
  AlignLeft,
} from "lucide-react";
import apiRequest from "../../utils/apiRequest";

const fieldIcon = {
  status: <Activity className="w-3 h-3 text-amber-500" />,
  priority: <Tag className="w-3 h-3 text-violet-500" />,
  assignee: <UserCheck className="w-3 h-3 text-blue-500" />,
  title: <AlignLeft className="w-3 h-3 text-slate-400" />,
  created: <History className="w-3 h-3 text-emerald-500" />,
};

const fieldLabel = {
  status: "Status",
  priority: "Priority",
  assignee: "Assignee",
  title: "Title",
  created: "Created",
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const ActivityDrawer = ({ issue, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    apiRequest
      .get(`/issues/${issue.id}/activity`)
      .then((res) => setActivities(res.data.activities || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [issue.id]);

  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={ref}
        className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <History className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Activity Log</p>
              <p className="text-[10px] text-slate-400 truncate max-w-48">
                {issue.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                <History className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-400">
                No activity yet
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                Changes will appear here
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-100" />

              <div className="space-y-4">
                {activities.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 relative">
                    {/* Avatar on timeline */}
                    <div className="w-7 h-7 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 z-10 overflow-hidden ring-2 ring-white">
                      {a.actor?.avatar ? (
                        <img
                          src={a.actor.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[9px] font-bold text-white">
                          {a.actor?.name?.[0]?.toUpperCase() ?? "?"}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pb-1">
                      <div className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="text-xs font-bold text-slate-700">
                            {a.actor?.name ?? "Someone"}
                          </span>

                          {a.field === "created" ? (
                            <span className="text-xs text-slate-500">
                              created this issue
                            </span>
                          ) : (
                            <>
                              <span className="text-xs text-slate-400">
                                changed
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                                {fieldIcon[a.field]}
                                {fieldLabel[a.field] ?? a.field}
                              </span>
                            </>
                          )}
                        </div>

                        {a.field !== "created" && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {a.oldValue && (
                              <>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-500 border border-red-100 font-medium line-through">
                                  {a.oldValue}
                                </span>
                                <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                              </>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">
                              {a.newValue ?? "—"}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 ml-1">
                        {timeAgo(a.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityDrawer;
