import React from 'react';
import { FolderOpen, PlusCircle, Loader2, Users, Shield, Edit3, Trash2 } from 'lucide-react';

const ProjectsSection = ({
  projects,
  projectsLoading,
  projectsError,
  fetchProjects,
  userRole,
  setModalMode,
  setProjectForm,
  setIsProjectModalOpen,
  handleProjectClick,
  openEditModal,
  handleDeleteProject
}) => {
  return (
    <div id="projects-section" className="bg-white rounded-2xl border border-slate-200 shadow-sm scroll-mt-6">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <FolderOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">My Projects</h2>
        </div>
        {userRole === "PROJECT_MANAGER" && (
          <button
            onClick={() => {
              setModalMode("create");
              setProjectForm({ name: "", key: "", description: "" });
              setIsProjectModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 transition-all duration-200 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Project</span>
          </button>
        )}
      </div>

      <div className="p-6">
        {projectsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-slate-500">Loading projects...</span>
          </div>
        ) : projectsError ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-600 font-medium">{projectsError}</p>
            <button
              onClick={fetchProjects}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Try again
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects yet</h3>
            <p className="text-sm text-slate-500 mb-4">
              {userRole === "PROJECT_MANAGER"
                ? "Create your first project to get started"
                : "You'll see projects here once you're added as a member"
              }
            </p>
            {userRole === "PROJECT_MANAGER" && (
              <button
                onClick={() => {
                  setModalMode("create");
                  setProjectForm({ name: "", key: "", description: "" });
                  setIsProjectModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Project</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className="bg-slate-50 rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                      {project.name}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">
                      {project.key}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <FolderOpen className="w-4 h-4 text-blue-600" />
                  </div>
                </div>

                {project.description && (
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100/60">
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 flex-1 min-w-0">
                    <div className="flex items-center shrink-0">
                      {project.members && project.members.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 shrink-0">
                            {project.members.slice(0, 4).map((member, i) => (
                              <div
                                key={i}
                                className="w-6 h-6 rounded-full border-2 border-slate-50 bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[8px] font-bold text-white shadow-sm ring-1 ring-slate-900/5 relative z-10"
                                title={member.name || member.email}
                              >
                                {(member.name ? member.name.charAt(0) : member.email?.charAt(0) || 'U').toUpperCase()}
                              </div>
                            ))}
                            {project.members.length > 4 && (
                              <div className="w-6 h-6 rounded-full border-2 border-slate-50 bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-600 shadow-sm relative z-0">
                                +{project.members.length - 4}
                              </div>
                            )}
                          </div>
                          <span className="text-slate-500 font-medium whitespace-nowrap">
                            {project.members.length} {project.members.length === 1 ? 'Member' : 'Members'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 shrink-0">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>0 Members</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Shield className="w-3.5 h-3.5 text-blue-500/70 shrink-0" />
                      <span className="truncate font-medium" title={project.owner?.name || "Owner"}>
                        {project.owner?.name?.split(' ')[0] || "Owner"}
                      </span>
                    </div>
                  </div>

                  {userRole === "PROJECT_MANAGER" && (
                    <div className="flex items-center gap-1 shrink-0 border-l border-slate-100/60 pl-2">
                      <button
                        onClick={(e) => openEditModal(e, project)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsSection;
