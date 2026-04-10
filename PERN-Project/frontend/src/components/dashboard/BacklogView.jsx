import React from "react";
import { Package, PlusCircle, Calendar, AlertCircle } from "lucide-react";

const BacklogView = ({ selectedProject, userRole, onIssueClick }) => {
  const issues = selectedProject?.issues || [];
  const backlogIssues = issues.filter((issue) => !issue.sprintId);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-slate-500" />
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Project Backlog ({backlogIssues.length})
          </h4>
        </div>
      </div>

      {backlogIssues.length > 0 ? (
        <div className="space-y-3">
          {backlogIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => onIssueClick(issue)}
              className="group flex items-center justify-between p-4 bg-slate-50/50 border border-slate-200 rounded-xl hover:bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`w-2 h-8 rounded-full ${
                    issue.priority === "HIGH"
                      ? "bg-red-500"
                      : issue.priority === "MEDIUM"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                  }`}
                />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    {issue.project?.key
                      ? `${issue.project.key}-${issue.id.slice(0, 4)}`
                      : `#${issue.id.slice(0, 4)}`}
                  </span>
                  <h5 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {issue.title}
                  </h5>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Status Pill */}
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    issue.status === "DONE"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : issue.status === "IN_PROGRESS"
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  {issue.status.replace("_", " ")}
                </span>

                {/* Assignee */}
                {issue.assignee ? (
                  <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white border border-slate-200">
                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                      <span className="text-[8px] font-bold text-white">
                        {issue.assignee.name
                          ? issue.assignee.name[0].toUpperCase()
                          : issue.assignee.email[0].toUpperCase()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-100 border border-dashed border-slate-300" />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Backlog is clean!
          </h3>
          <p className="text-xs text-slate-500">
            Every task is currently assigned to a sprint.
          </p>
        </div>
      )}
    </div>
  );
};

export default BacklogView;
