import React, { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Circle } from "lucide-react";

const statusColors = {
  TODO:        { dot: "bg-slate-400",  pill: "bg-slate-100 text-slate-600 border-slate-200" },
  IN_PROGRESS: { dot: "bg-blue-500",   pill: "bg-blue-50 text-blue-600 border-blue-200"    },
  DONE:        { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-600 border-emerald-200" },
};

const priorityDot = {
  HIGH:   "bg-red-500",
  MEDIUM: "bg-amber-500",
  LOW:    "bg-blue-400",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const ProjectCalendarView = ({ selectedProject }) => {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [hoveredIssue, setHoveredIssue] = useState(null);

  const issues = (selectedProject.issues || []).filter(i => i.dueDate);

  const prevMonth = () => setCurrent(c => {
    const d = new Date(c.year, c.month - 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const nextMonth = () => setCurrent(c => {
    const d = new Date(c.year, c.month + 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Build calendar grid
  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Map issues to day numbers
  const issuesByDay = {};
  issues.forEach(issue => {
    const d = new Date(issue.dueDate);
    if (d.getFullYear() === current.year && d.getMonth() === current.month) {
      const day = d.getDate();
      if (!issuesByDay[day]) issuesByDay[day] = [];
      issuesByDay[day].push(issue);
    }
  });

  const isToday = (day) =>
    day === today.getDate() &&
    current.month === today.getMonth() &&
    current.year === today.getFullYear();

  // Issues with due dates this month for the list panel
  const monthIssues = issues.filter(i => {
    const d = new Date(i.dueDate);
    return d.getFullYear() === current.year && d.getMonth() === current.month;
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-500" />
            <h4 className="text-sm font-bold text-slate-700">
              {MONTHS[current.month]} {current.year}
            </h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              {monthIssues.length} tasks
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrent({ year: today.getFullYear(), month: today.getMonth() })}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition-all cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const dayIssues = day ? (issuesByDay[day] || []) : [];
            const visible = dayIssues.slice(0, 3);
            const overflow = dayIssues.length - 3;

            return (
              <div
                key={idx}
                className={`min-h-24 p-1.5 border-b border-r border-slate-100 ${!day ? "bg-slate-50/50" : "bg-white hover:bg-slate-50/60"} transition-colors`}
              >
                {day && (
                  <>
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                      isToday(day)
                        ? "bg-blue-600 text-white"
                        : "text-slate-500"
                    }`}>
                      {day}
                    </span>

                    <div className="space-y-0.5">
                      {visible.map(issue => {
                        const sCfg = statusColors[issue.status] || statusColors.TODO;
                        return (
                          <div
                            key={issue.id}
                            onMouseEnter={() => setHoveredIssue(issue)}
                            onMouseLeave={() => setHoveredIssue(null)}
                            className={`relative group flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold cursor-default border truncate ${sCfg.pill} transition-all hover:shadow-sm`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot[issue.priority]}`} />
                            <span className="truncate">{issue.title}</span>

                            {/* Tooltip */}
                            {hoveredIssue?.id === issue.id && (
                              <div className="absolute left-0 top-full mt-1 z-30 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-3 pointer-events-none">
                                <p className="text-xs font-bold text-slate-800 mb-2 leading-snug">{issue.title}</p>
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400">Status</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${sCfg.pill}`}>
                                      {issue.status.replace("_", " ")}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400">Priority</span>
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                                      <span className={`w-1.5 h-1.5 rounded-full ${priorityDot[issue.priority]}`} />
                                      {issue.priority}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400">Assignee</span>
                                    <span className="text-[10px] font-bold text-slate-700 truncate max-w-24">
                                      {issue.assignee?.name || "Unassigned"}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400">Due</span>
                                    <span className="text-[10px] font-bold text-slate-700">
                                      {new Date(issue.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {overflow > 0 && (
                        <p className="text-[9px] font-bold text-slate-400 pl-1">+{overflow} more</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Issue list for the month */}
      {monthIssues.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Tasks due in {MONTHS[current.month]}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {monthIssues.map(issue => {
              const sCfg = statusColors[issue.status] || statusColors.TODO;
              const due = new Date(issue.dueDate);
              const now = new Date(); now.setHours(0,0,0,0);
              const isOverdue = due < now && issue.status !== "DONE";
              const isDueToday = due.toDateString() === now.toDateString();

              return (
                <div key={issue.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                  {/* Day badge */}
                  <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                    isOverdue ? "bg-red-50 border-red-200" :
                    isDueToday ? "bg-yellow-50 border-yellow-300" :
                    "bg-slate-50 border-slate-200"
                  }`}>
                    <span className={`text-[10px] font-bold uppercase ${isOverdue ? "text-red-400" : isDueToday ? "text-yellow-600" : "text-slate-400"}`}>
                      {due.toLocaleDateString(undefined, { month: "short" })}
                    </span>
                    <span className={`text-sm font-extrabold leading-none ${isOverdue ? "text-red-600" : isDueToday ? "text-yellow-700" : "text-slate-700"}`}>
                      {due.getDate()}
                    </span>
                  </div>

                  {/* Issue info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot[issue.priority]}`} />
                      <p className={`text-sm font-semibold truncate ${issue.status === "DONE" ? "line-through text-slate-400" : "text-slate-800"}`}>
                        {issue.title}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      {selectedProject.key}-{issue.id.slice(0, 4).toUpperCase()}
                    </span>
                  </div>

                  {/* Status */}
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${sCfg.pill}`}>
                    {issue.status.replace("_", " ")}
                  </span>

                  {/* Assignee */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    {issue.assignee ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                          {issue.assignee.avatar ? (
                            <img src={issue.assignee.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[9px] font-bold text-white">
                              {issue.assignee.name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-slate-600 hidden sm:block truncate max-w-20">
                          {issue.assignee.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-400">Unassigned</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {monthIssues.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center">
          <CalendarDays className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-400">No tasks due in {MONTHS[current.month]}</p>
          <p className="text-xs text-slate-300 mt-1">Set due dates on issues to see them here</p>
        </div>
      )}
    </div>
  );
};

export default ProjectCalendarView;
