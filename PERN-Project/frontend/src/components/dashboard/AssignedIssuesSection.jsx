import React from 'react';
import { CheckCircle, Loader2, FolderOpen } from 'lucide-react';

const AssignedIssuesSection = ({
  myIssues,
  myIssuesLoading,
  userRole
}) => {
  // Group issues by project
  const issuesByProject = React.useMemo(() => {
    return myIssues.reduce((acc, issue) => {
      const projectName = issue.project?.name || "Unassigned Project";
      if (!acc[projectName]) {
        acc[projectName] = [];
      }
      acc[projectName].push(issue);
      return acc;
    }, {});
  }, [myIssues]);

  return (
    <div id="issues-section" className="bg-white rounded-2xl border border-slate-200 shadow-sm scroll-mt-6">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">
            {userRole === "DEVELOPER" ? "Assigned to Developer" : "All Project Issues"}
          </h2>
        </div>
        <span className="px-2 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
          {myIssues.length} Issues
        </span>
      </div>

      <div className="p-6">
        {myIssuesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="ml-2 text-sm text-slate-500">Loading issues...</span>
          </div>
        ) : myIssues.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Clean slate!</h3>
            <p className="text-sm text-slate-500">
              No issues are assigned to you at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(issuesByProject).map(([projectName, projectIssues]) => (
              <div key={projectName} className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <FolderOpen className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-700">{projectName}</h3>
                  <span className="ml-2 px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                    {projectIssues.length}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projectIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all duration-200 cursor-default group"
                    >
                      <div className="flex items-start justify-between mb-2">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              issue.status === "DONE" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                : issue.status === "IN_PROGRESS"
                                  ? "bg-blue-50 text-blue-700 border-blue-100"
                                  : "bg-slate-50 text-slate-600 border-slate-100"
                            }`}>
                              {issue.status.replace("_", " ")}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${
                            issue.priority === "HIGH" ? "bg-red-500" : issue.priority === "MEDIUM" ? "bg-amber-500" : "bg-blue-500"
                          }`} />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1 group-hover:text-emerald-600">
                        {issue.title}
                      </h3>
                      <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-200/60">
                         <div className="flex items-center gap-1.5 p-1 px-2 bg-white rounded-lg border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-500 line-clamp-1">
                              {issue.project?.key || "DEV"} - {issue.id.slice(0, 8)}
                            </span>
                         </div>
                         {/* Assignee */}
                         <div className="shrink-0">
                           {issue.assignee ? (
                             <div 
                               className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100"
                               title={`Assigned to ${issue.assignee.name || issue.assignee.email}`}
                             >
                               <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                                 <span className="text-[7px] font-bold text-white">
                                   {issue.assignee.name ? issue.assignee.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : issue.assignee.email[0].toUpperCase()}
                                 </span>
                               </div>
                               <span className="text-[9px] font-bold text-indigo-700 truncate max-w-[70px]">
                                 {issue.assignee.name || issue.assignee.email.split('@')[0]}
                               </span>
                             </div>
                           ) : (
                             <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100" title="Unassigned">
                               <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                 <span className="text-[7px] font-bold text-slate-400">?</span>
                               </div>
                               <span className="text-[9px] font-bold text-slate-400">Unassigned</span>
                             </div>
                           )}
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedIssuesSection;
