import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, MessageSquare, UserCheck, X, Inbox, ArrowRightLeft, UserMinus, CalendarClock, AtSign } from "lucide-react";
import apiRequest from "../../utils/apiRequest";

const typeIcon = {
  ASSIGNMENT:    <UserCheck className="w-3.5 h-3.5 text-blue-500" />,
  COMMENT:       <MessageSquare className="w-3.5 h-3.5 text-violet-500" />,
  STATUS_CHANGE: <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" />,
  HANDOVER:      <UserMinus className="w-3.5 h-3.5 text-rose-500" />,
  DUE_DATE:      <CalendarClock className="w-3.5 h-3.5 text-red-500" />,
  MENTION:       <AtSign className="w-3.5 h-3.5 text-indigo-500" />,
};

const typeBg = {
  ASSIGNMENT:    "bg-blue-50 border border-blue-100",
  COMMENT:       "bg-violet-50 border border-violet-100",
  STATUS_CHANGE: "bg-amber-50 border border-amber-100",
  HANDOVER:      "bg-rose-50 border border-rose-100",
  DUE_DATE:      "bg-red-50 border border-red-100",
  MENTION:       "bg-indigo-50 border border-indigo-100",
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [isOpen,        setIsOpen]        = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiRequest.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await apiRequest.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiRequest.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-bold text-slate-700">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  All read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                  <Inbox className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-400">All caught up!</p>
                <p className="text-xs text-slate-300 mt-0.5">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                    n.isRead
                      ? "bg-white hover:bg-slate-50/50"
                      : "bg-blue-50/40 hover:bg-blue-50/70 cursor-pointer"
                  }`}
                >
                  <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${typeBg[n.type] || "bg-slate-50 border border-slate-100"}`}>
                    {typeIcon[n.type] || <Bell className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug ${n.isRead ? "text-slate-500" : "text-slate-700 font-medium"}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
