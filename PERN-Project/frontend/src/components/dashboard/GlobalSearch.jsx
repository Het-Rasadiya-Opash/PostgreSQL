import React, { useState, useEffect, useRef } from "react";
import { Search, FolderOpen, X, Hash, ChevronRight, Layers, AlertCircle } from "lucide-react";

const statusConfig = {
  DONE:        { label: "Done",        cls: "bg-emerald-100 text-emerald-700" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-blue-100 text-blue-700"      },
  TODO:        { label: "To Do",       cls: "bg-slate-100 text-slate-500"    },
};

const priorityConfig = {
  HIGH:   { cls: "bg-red-500",   label: "High"   },
  MEDIUM: { cls: "bg-amber-400", label: "Medium" },
  LOW:    { cls: "bg-blue-400",  label: "Low"    },
};

function highlight(text, q) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-100 text-yellow-800 rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

const GlobalSearch = ({ projects, issues, onProjectClick, onIssueClick }) => {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef    = useRef(null);
  const containerRef = useRef(null);
  const listRef     = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); }
    else { setQuery(""); setActive(0); }
  }, [open]);

  useEffect(() => {
    const h = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const q = query.trim().toLowerCase();

  const matchedProjects = q
    ? (projects || []).filter(p => p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q)).slice(0, 3)
    : (projects || []).slice(0, 3);

  const matchedIssues = q
    ? (issues || []).filter(i => i.title.toLowerCase().includes(q) || i.project?.key?.toLowerCase().includes(q)).slice(0, 5)
    : (issues || []).slice(0, 5);

  const allItems = [
    ...matchedProjects.map(p => ({ type: "project", data: p })),
    ...matchedIssues.map(i => ({ type: "issue",   data: i })),
  ];

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, allItems.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
      if (e.key === "Enter" && allItems[active]) {
        const item = allItems[active];
        if (item.type === "project") { setOpen(false); onProjectClick(item.data.id); }
        else { setOpen(false); onIssueClick(item.data); }
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, active, allItems]);

  useEffect(() => setActive(0), [query]);

  const hasResults = allItems.length > 0;

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-2.5 h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-transparent hover:border-slate-300 text-slate-400 hover:text-slate-600 transition-all duration-200 cursor-pointer w-60"
      >
        <Search className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 text-left text-xs font-medium">Search anything...</span>
        <div className="flex items-center gap-0.5 shrink-0">
          <kbd className="text-[9px] font-bold bg-white border border-slate-200 text-slate-400 rounded px-1 py-0.5 shadow-sm">⌘</kbd>
          <kbd className="text-[9px] font-bold bg-white border border-slate-200 text-slate-400 rounded px-1 py-0.5 shadow-sm">K</kbd>
        </div>
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div
            ref={containerRef}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Search input row */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <Search className="w-4 h-4 text-white" />
              </div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search projects, issues, tasks..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 text-base text-slate-800 placeholder:text-slate-400 outline-none bg-transparent font-medium"
              />
              <div className="flex items-center gap-2 shrink-0">
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <kbd className="text-[10px] font-bold text-slate-400 border border-slate-200 rounded-md px-1.5 py-0.5 bg-slate-50">ESC</kbd>
              </div>
            </div>

            {/* Results area */}
            <div ref={listRef} className="max-h-[420px] overflow-y-auto">
              {!hasResults && q ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <AlertCircle className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-500">No results for <span className="text-slate-700">"{query}"</span></p>
                  <p className="text-xs text-slate-400 mt-1">Try searching with a different keyword</p>
                </div>
              ) : (
                <div className="p-2">

                  {/* Projects section */}
                  {matchedProjects.length > 0 && (
                    <div className="mb-1">
                      <div className="flex items-center gap-2 px-3 py-2">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projects</span>
                      </div>
                      {matchedProjects.map((project, idx) => {
                        const globalIdx = idx;
                        const isActive = active === globalIdx;
                        return (
                          <button
                            key={project.id}
                            onClick={() => { setOpen(false); onProjectClick(project.id); }}
                            onMouseEnter={() => setActive(globalIdx)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-100 text-left group ${isActive ? "bg-blue-50 border border-blue-100" : "hover:bg-slate-50 border border-transparent"}`}
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isActive ? "bg-blue-600" : "bg-blue-100"}`}>
                              <FolderOpen className={`w-4 h-4 ${isActive ? "text-white" : "text-blue-600"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">
                                {highlight(project.name, q)}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                <span className="font-bold text-blue-500">{project.key}</span>
                                {" · "}
                                {project.members?.length || 0} member{project.members?.length !== 1 ? "s" : ""}
                                {project.description && ` · ${project.description.slice(0, 40)}${project.description.length > 40 ? "…" : ""}`}
                              </p>
                            </div>
                            <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-blue-500" : "text-slate-300"}`} />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Divider */}
                  {matchedProjects.length > 0 && matchedIssues.length > 0 && (
                    <div className="mx-3 my-1 border-t border-slate-100" />
                  )}

                  {/* Issues section */}
                  {matchedIssues.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-3 py-2">
                        <Hash className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issues</span>
                      </div>
                      {matchedIssues.map((issue, idx) => {
                        const globalIdx = matchedProjects.length + idx;
                        const isActive  = active === globalIdx;
                        const sCfg = statusConfig[issue.status] || statusConfig.TODO;
                        const pCfg = priorityConfig[issue.priority] || priorityConfig.MEDIUM;
                        return (
                          <button
                            key={issue.id}
                            onClick={() => { setOpen(false); onIssueClick(issue); }}
                            onMouseEnter={() => setActive(globalIdx)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-100 text-left group ${isActive ? "bg-slate-50 border border-slate-200" : "hover:bg-slate-50 border border-transparent"}`}
                          >
                            {/* Priority indicator */}
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isActive ? "bg-slate-200" : "bg-slate-100"}`}>
                              <span className={`w-3 h-3 rounded-full ${pCfg.cls}`} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">
                                {highlight(issue.title, q)}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold text-slate-400">
                                  {issue.project?.key}-{issue.id.slice(0, 4).toUpperCase()}
                                </span>
                                {issue.project?.name && (
                                  <span className="text-[10px] text-slate-400 truncate max-w-32">{issue.project.name}</span>
                                )}
                                {issue.assignee && (
                                  <span className="text-[10px] text-slate-400 truncate">· {issue.assignee.name}</span>
                                )}
                              </div>
                            </div>

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${sCfg.cls}`}>
                              {sCfg.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Empty query state */}
                  {!q && !hasResults && (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                      <Search className="w-8 h-8 text-slate-200 mb-3" />
                      <p className="text-sm font-semibold text-slate-400">No data available</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <kbd className="bg-white border border-slate-200 rounded px-1 py-0.5 font-bold shadow-sm">↑</kbd>
                  <kbd className="bg-white border border-slate-200 rounded px-1 py-0.5 font-bold shadow-sm">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-white border border-slate-200 rounded px-1 py-0.5 font-bold shadow-sm">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-white border border-slate-200 rounded px-1 py-0.5 font-bold shadow-sm">ESC</kbd>
                  Close
                </span>
              </div>
              {hasResults && (
                <span className="text-[10px] font-semibold text-slate-400">
                  {allItems.length} result{allItems.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;
