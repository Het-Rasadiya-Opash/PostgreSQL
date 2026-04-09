import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { Users, Edit3, Trash2 } from "lucide-react";

const issueStatuses = ["TODO", "IN_PROGRESS", "DONE"];
const statusLabels = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const statusColors = {
  TODO: "bg-slate-100",
  IN_PROGRESS: "bg-blue-50",
  DONE: "bg-emerald-50",
};

const KanbanBoard = ({ issues, onDragEnd, onIssueClick, onDeleteIssue, userRole }) => {
  // Group issues by status
  const columns = issueStatuses.reduce((acc, status) => {
    acc[status] = issues.filter((issue) => issue.status === status);
    return acc;
  }, {});

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {issueStatuses.map((status) => (
          <div key={status} className="flex-1 min-w-75 flex flex-col">
            <div className={`mb-3 px-4 py-2 rounded-xl border border-slate-200 ${statusColors[status]} flex items-center justify-between shadow-sm`}>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                {statusLabels[status]}
              </h3>
              <span className="bg-white text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
                {columns[status].length}
              </span>
            </div>

            <Droppable droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 rounded-2xl p-2 min-h-37.5 transition-colors border border-dashed ${
                    snapshot.isDraggingOver ? "bg-slate-100 border-slate-300" : "bg-slate-50/50 border-transparent hover:border-slate-200"
                  }`}
                >
                  {columns[status].map((issue, index) => (
                    <Draggable key={issue.id} draggableId={issue.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => onIssueClick(issue)}
                          className={`group mb-3 bg-white p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col ${
                            snapshot.isDragging
                              ? "shadow-lg border-blue-400 rotate-2 scale-102"
                              : "shadow-sm border-slate-200 hover:border-blue-300 hover:shadow-md"
                          }`}
                          style={{
                            ...provided.draggableProps.style,
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                             <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                                issue.priority === "HIGH" ? "bg-red-500" : issue.priority === "MEDIUM" ? "bg-amber-500" : "bg-blue-500"
                              }`} title={`Priority: ${issue.priority}`} />
                             <p className="text-sm font-bold text-slate-800 flex-1 ml-2 leading-tight">
                               {issue.title}
                             </p>
                          </div>
                          
                          {issue.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 mb-3 px-1">{issue.description}</p>
                          )}

                          <div className="mt-auto pt-3 border-t border-slate-100/80 flex items-center justify-between">
                            <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              {issue.project?.key ? `${issue.project.key}-${issue.id.slice(0,4)}` : `#${issue.id.slice(0,4)}`}
                            </span>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      onIssueClick(issue);
                                  }}
                                  className="p-1 rounded-sm text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Edit Issue"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                {userRole === "PROJECT_MANAGER" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onDeleteIssue) onDeleteIssue(issue.id);
                                    }}
                                    className="p-1 rounded-sm text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="Delete Issue"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              
                              {/* Assignee */}
                              {issue.assignee ? (
                                <div 
                                  className="flex items-center gap-2 px-2 py-1 rounded-full bg-indigo-50 border border-indigo-100 shadow-xs"
                                  title={`Assigned to ${issue.assignee.name || issue.assignee.email}`}
                                >
                                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                                    <span className="text-[8px] font-bold text-white">
                                      {issue.assignee.name ? issue.assignee.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : issue.assignee.email[0].toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-bold text-indigo-700 truncate max-w-20">
                                    {issue.assignee.name || issue.assignee.email.split('@')[0]}
                                  </span>
                                </div>
                              ) : (
                                <div 
                                  className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-50 border border-slate-100"
                                  title="Unassigned"
                                >
                                  <Users className="w-3 h-3 text-slate-400" />
                                  <span className="text-[10px] font-bold text-slate-400">Unassigned</span>
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
