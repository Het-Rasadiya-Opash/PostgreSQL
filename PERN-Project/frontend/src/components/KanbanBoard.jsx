import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Users, Edit3, Trash2, CheckCircle2, Circle, CalendarClock, MessageSquare, History,
} from "lucide-react";
import { formatDate } from "../utils/dateFormat";

const issueStatuses = ["TODO", "IN_PROGRESS", "DONE"];
const statusLabels = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const statusColors = {
  TODO: "bg-ads-surface",
  IN_PROGRESS: "bg-ads-info-light",
  DONE: "bg-ads-success-light",
};

const KanbanBoard = ({
  issues,
  onDragEnd,
  onIssueClick,
  onActivityClick,
  onDeleteIssue,
  onToggleSubTask,
  userRole,
}) => {
  // Group issues by status
  const columns = issueStatuses.reduce((acc, status) => {
    acc[status] = issues.filter((issue) => issue.status === status);
    return acc;
  }, {});

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory">
        {issueStatuses.map((status) => (
          <div
            key={status}
            className="flex-1 min-w-70 sm:min-w-[320px] flex flex-col snap-center"
          >
            <div
              className={`mb-3 px-4 py-3 rounded-lg border border-ads-border ${statusColors[status]} flex items-center justify-between shadow-sm`}
            >
              <h3 className="text-sm font-bold text-ads-text uppercase tracking-wider">
                {statusLabels[status]}
              </h3>
              <span className="bg-white text-ads-text-subtle text-xs font-bold px-2 py-0.5 rounded-full border border-ads-border shadow-sm">
                {columns[status].length}
              </span>
            </div>

            <Droppable droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 rounded-xl p-2 min-h-37.5 transition-colors border-2 border-dashed ${
                    snapshot.isDraggingOver
                      ? "bg-ads-surface-hover border-ads-border"
                      : "bg-transparent border-transparent hover:border-ads-surface"
                  }`}
                >
                  {columns[status].map((issue, index) => (
                    <Draggable
                      key={issue.id}
                      draggableId={issue.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`group mb-3 bg-white p-3.5 rounded border transition-all duration-200 cursor-default flex flex-col ${
                            snapshot.isDragging
                              ? "shadow-ads-modal border-ads-primary rotate-1 scale-102"
                              : "shadow-ads-card border-ads-border hover:border-ads-primary hover:shadow-ads-card"
                          }`}
                          style={{ ...provided.draggableProps.style }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div
                              className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                                issue.priority === "HIGH"
                                  ? "bg-ads-danger"
                                  : issue.priority === "MEDIUM"
                                    ? "bg-ads-warning"
                                    : "bg-ads-info"
                              }`}
                              title={`Priority: ${issue.priority}`}
                            />
                            <p className="text-sm font-bold text-ads-text flex-1 ml-2 leading-tight">
                              {issue.title}
                            </p>
                          </div>

                          {issue.description && (
                            <p className="text-xs text-ads-text-subtle line-clamp-2 mb-3 px-1">
                              {issue.description}
                            </p>
                          )}

                          {/* Subtask list */}
                          {issue.subTasks?.length > 0 && (
                            <div className="mb-3 px-1 space-y-1">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold text-ads-text-subtlest uppercase tracking-wider">
                                  Subtasks
                                </span>
                                <span className="text-[10px] font-bold text-ads-text-subtlest">
                                  {
                                    issue.subTasks.filter((s) => s.isCompleted)
                                      .length
                                  }
                                  /{issue.subTasks.length}
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full h-1 bg-ads-surface rounded-full overflow-hidden mb-2">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    issue.subTasks.every((s) => s.isCompleted)
                                      ? "bg-ads-success"
                                      : "bg-ads-primary"
                                  }`}
                                  style={{
                                    width: `${Math.round((issue.subTasks.filter((s) => s.isCompleted).length / issue.subTasks.length) * 100)}%`,
                                  }}
                                />
                              </div>

                              {/* Subtask rows */}
                              {issue.subTasks.map((sub) => (
                                <div
                                  key={sub.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleSubTask &&
                                      onToggleSubTask(sub.id, issue.id);
                                  }}
                                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                                    sub.isCompleted
                                      ? "bg-ads-success-light hover:bg-ads-success-light/80"
                                      : "bg-ads-surface hover:bg-ads-surface-hover"
                                  }`}
                                >
                                  {sub.isCompleted ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-ads-success shrink-0" />
                                  ) : (
                                    <Circle className="w-3.5 h-3.5 text-ads-border shrink-0" />
                                  )}
                                  <span
                                    className={`text-xs leading-tight truncate ${
                                      sub.isCompleted
                                        ? "line-through text-ads-text-subtlest"
                                        : "text-ads-text-subtle"
                                    }`}
                                  >
                                    {sub.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-auto pt-3 border-t border-ads-border/50 flex flex-wrap items-center justify-between gap-y-2.5">
                            <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                              <span className="bg-ads-surface text-ads-text-subtle px-1.5 py-0.5 rounded text-[10px] font-bold border border-ads-border shrink-0">
                                {issue.project?.key
                                  ? `${issue.project.key}-${issue.id.slice(0, 4)}`
                                  : `#${issue.id.slice(0, 4)}`}
                              </span>
                              {issue.dueDate &&
                                (() => {
                                  const due = new Date(issue.dueDate);
                                  const now = new Date();
                                  due.setHours(0,0,0,0);
                                  now.setHours(0,0,0,0);
                                  const isOverdue  = due < now && issue.status !== "DONE";
                                  const isDueToday = due.getTime() === now.getTime();
                                  return (
                                    <span
                                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                                        isOverdue
                                          ? "bg-red-50 text-red-600 border-red-200"
                                          : isDueToday
                                            ? "bg-yellow-100 text-yellow-700 border-yellow-400"
                                            : "bg-emerald-50 text-emerald-600 border-emerald-200"
                                      }`}
                                    >
                                      <CalendarClock className="w-3 h-3" />
                                      {isOverdue
                                        ? "Overdue"
                                        : isDueToday
                                          ? "Due Today"
                                          : formatDate(due)}
                                    </span>
                                  );
                                })()}
                              {issue._count?.comments > 0 && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border border-violet-200 bg-violet-50 text-violet-600 shrink-0">
                                  <MessageSquare className="w-3 h-3" />
                                  {issue._count.comments}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => onIssueClick(issue)}
                                  className="p-1 rounded-sm text-ads-text-subtlest hover:text-ads-primary hover:bg-ads-primary-light transition-colors"
                                  title="Edit Issue"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); onActivityClick && onActivityClick(issue); }}
                                  className="p-1 rounded-sm text-ads-text-subtlest hover:text-amber-500 hover:bg-amber-50 transition-colors"
                                  title="Activity Log"
                                >
                                  <History className="w-3.5 h-3.5" />
                                </button>
                                {userRole === "PROJECT_MANAGER" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onDeleteIssue)
                                        onDeleteIssue(issue.id);
                                    }}
                                    className="p-1 rounded-sm text-ads-text-subtlest hover:text-ads-danger hover:bg-ads-danger-light transition-colors"
                                    title="Delete Issue"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              {/* Assignee */}
                              {issue.assignee ? (
                                <div
                                  className="flex items-center gap-2 px-2 py-1 rounded-full bg-ads-primary-light border border-ads-primary/10 shadow-xs"
                                  title={`Assigned to ${issue.assignee.name || issue.assignee.email}`}
                                >
                                  <div className="w-5 h-5 rounded-full bg-ads-primary flex items-center justify-center shrink-0">
                                    <span className="text-[8px] font-bold text-white">
                                      {issue.assignee.name
                                        ? issue.assignee.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .substring(0, 2)
                                            .toUpperCase()
                                        : issue.assignee.email[0].toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-bold text-ads-primary truncate max-w-20">
                                    {issue.assignee.name ||
                                      issue.assignee.email.split("@")[0]}
                                  </span>
                                </div>
                              ) : (
                                <div
                                  className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-ads-surface border border-ads-border"
                                  title="Unassigned"
                                >
                                  <Users className="w-3 h-3 text-ads-text-subtlest" />
                                  <span className="text-[10px] font-bold text-ads-text-subtlest">
                                    Unassigned
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
