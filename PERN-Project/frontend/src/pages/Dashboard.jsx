import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/usersSlice";
import apiRequest from "../utils/apiRequest";
import {
  LogOut,
  Zap,
  Shield,
  BarChart3,
  FolderOpen,
  CheckCircle,
  Users,
  Clock,
  Mail,
  BadgeCheck,
  PlusCircle,
  X,
  FolderPlus,
  Loader2,
  Trash2,
  Edit3,
} from "lucide-react";

const roleColors = {
  ADMIN: {
    pill: "bg-purple-100 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  PROJECT_MANAGER: {
    pill: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  DEVELOPER: {
    pill: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  USER: {
    pill: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
};

const roleLabels = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Project Manager",
  DEVELOPER: "Developer",
  USER: "User",
};

const Dashboard = () => {
  const { currentUser } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState("create"); // "create" or "edit"
  const [editingProjectId, setEditingProjectId] = React.useState(null);
  const [projectForm, setProjectForm] = React.useState({
    name: "",
    key: "",
    description: "",
  });
  const [formStatus, setFormStatus] = React.useState({
    loading: false,
    error: null,
  });

  // Projects State
  const [projects, setProjects] = React.useState([]);
  const [projectsLoading, setProjectsLoading] = React.useState(true);
  const [projectsError, setProjectsError] = React.useState(null);

  // Project Details State
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [projectDetailsLoading, setProjectDetailsLoading] = React.useState(false);
  const [isProjectDetailsModalOpen, setIsProjectDetailsModalOpen] = React.useState(false);
  const [developers, setDevelopers] = React.useState([]);
  const [developersLoading, setDevelopersLoading] = React.useState(false);
  const [selectedDeveloperId, setSelectedDeveloperId] = React.useState("");
  const [memberUpdateLoading, setMemberUpdateLoading] = React.useState(false);
  const [memberUpdateError, setMemberUpdateError] = React.useState(null);

  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  // Fetch projects on component mount
  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser]);

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      setProjectsError(null);
      const response = await apiRequest.get("/projects");
      setProjects(response.data.projects || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjectsError(err.response?.data?.message || "Failed to load projects");
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchDevelopers = async () => {
    try {
      setDevelopersLoading(true);
      const response = await apiRequest.get("/users/developers");
      setDevelopers(response.data.users || []);
    } catch (err) {
      console.error("Error fetching developers:", err);
    } finally {
      setDevelopersLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId) => {
    try {
      setProjectDetailsLoading(true);
      const response = await apiRequest.get(`/projects/${projectId}`);
      setSelectedProject(response.data.project);
      setIsProjectDetailsModalOpen(true);
      if (currentUser?.role?.toUpperCase() === "PROJECT_MANAGER") {
        fetchDevelopers();
      }
    } catch (err) {
      console.error("Error fetching project details:", err);
    } finally {
      setProjectDetailsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedDeveloperId || !selectedProject) return;

    try {
      setMemberUpdateLoading(true);
      setMemberUpdateError(null);
      await apiRequest.put("/projects/members/add", {
        projectId: selectedProject.id,
        userId: selectedDeveloperId,
      });
      await fetchProjectDetails(selectedProject.id);
      await fetchProjects();
      setSelectedDeveloperId("");
    } catch (err) {
      console.error("Error adding member:", err);
      setMemberUpdateError(err.response?.data?.message || "Failed to add member");
    } finally {
      setMemberUpdateLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!selectedProject || !userId) return;

    if (!window.confirm("Are you sure you want to remove this member?")) return;

    try {
      setMemberUpdateLoading(true);
      setMemberUpdateError(null);
      await apiRequest.put("/projects/members/remove", {
        projectId: selectedProject.id,
        userId: userId,
      });
      await fetchProjectDetails(selectedProject.id);
      await fetchProjects();
    } catch (err) {
      console.error("Error removing member:", err);
      setMemberUpdateError(err.response?.data?.message || "Failed to remove member");
    } finally {
      setMemberUpdateLoading(false);
    }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation(); // Prevent clicking on project card details
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;

    try {
      setProjectsLoading(true);
      await apiRequest.delete(`/projects/${projectId}`);
      await fetchProjects();
    } catch (err) {
      console.error("Error deleting project:", err);
      setProjectsError(err.response?.data?.message || "Failed to delete project");
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleProjectClick = (projectId) => {
    fetchProjectDetails(projectId);
  };

  const closeProjectDetailsModal = () => {
    setIsProjectDetailsModalOpen(false);
    setSelectedProject(null);
    setDevelopers([]);
    setSelectedDeveloperId("");
    setMemberUpdateError(null);
  };

  const openEditModal = (e, project) => {
    e.stopPropagation();
    setModalMode("edit");
    setEditingProjectId(project.id);
    setProjectForm({
      name: project.name,
      key: project.key,
      description: project.description || "",
    });
    setIsProjectModalOpen(true);
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, error: null });

    try {
      if (modalMode === "create") {
        await apiRequest.post("/projects", {
          name: projectForm.name,
          key: projectForm.key.toUpperCase(),
          description: projectForm.description,
        });
      } else {
        await apiRequest.put(`/projects/${editingProjectId}`, {
          name: projectForm.name,
          key: projectForm.key.toUpperCase(),
          description: projectForm.description,
        });
      }

      setIsProjectModalOpen(false);
      setProjectForm({ name: "", key: "", description: "" });
      setEditingProjectId(null);
      setFormStatus({ loading: false, error: null });

      // Refresh projects list
      fetchProjects();
    } catch (err) {
      console.error("Project submission error:", err);
      setFormStatus({
        loading: false,
        error:
          err.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    }
  };

  if (!currentUser) return null;

  const initials = currentUser.name
    ? currentUser.name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("")
    : currentUser.email[0].toUpperCase();

  const userRole = currentUser.role?.toUpperCase() || "USER";
  const role = roleColors[userRole] || roleColors.USER;
  const roleLabel = roleLabels[userRole] || userRole;

  const stats = [
    {
      icon: FolderOpen,
      label: "Projects",
      value: projects.length.toString(),
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      icon: CheckCircle,
      label: "Tasks Done",
      value: "0", // This would need actual task data
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      icon: Users,
      label: "Team Members",
      value: projects.reduce((total, project) => total + (project._count?.members || 0), 0).toString(),
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
    },
    {
      icon: Clock,
      label: "Hours Logged",
      value: "0", // This would need actual time tracking data
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
  ];

  const availableDevelopers = developers.filter(
    (dev) =>
      !selectedProject?.members?.some((member) => member.id === dev.id) &&
      dev.id !== selectedProject?.owner?.id,
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">
              CoreOps
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                dispatch(logout());
                navigate("/login");
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all duration-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Cover */}
          <div className="h-36 bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 left-20 w-40 h-40 bg-violet-400/20 rounded-full blur-2xl" />
          </div>

          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-12 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 border-4 border-white shadow-xl flex items-center justify-center text-white text-3xl font-extrabold select-none">
                  {initials}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${role.dot}`}
                />
              </div>

              <div className="mb-1 flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${role.pill}`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  {roleLabel}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
                  {currentUser.name || "User"}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {currentUser.email}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-slate-500">
                    <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                    ID:{" "}
                    <span className="font-mono text-xs bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600">
                      {currentUser.id || "—"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 mt-6 pt-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">0</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Projects
                  </p>
                </div>
                <div className="border-x border-slate-100">
                  <p className="text-2xl font-extrabold text-slate-900">0</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Tasks Completed
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">0</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Hours Logged
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, label, value, color, bg, border }) => (
            <div
              key={label}
              className={`bg-white rounded-2xl border ${border} p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-200 group`}
            >
              <div
                className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}
              >
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 leading-none">
                  {value}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Projects Section ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
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

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100/60">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{project._count?.members || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-blue-500/70" />
                          <span className="truncate max-w-20">{project.owner?.name?.split(' ')[0] || "Owner"}</span>
                        </div>
                      </div>

                      {userRole === "PROJECT_MANAGER" && (
                        <div className="flex items-center gap-1">
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

        {/* ── Account Details Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Account Details
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="px-6 py-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {currentUser.name || "—"}
              </p>
            </div>
            <div className="px-6 py-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </p>
              <p className="text-sm font-semibold text-slate-900 break-all">
                {currentUser.email}
              </p>
            </div>
            <div className="px-6 py-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Access Role
              </p>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider ${role.pill}`}
              >
                <Shield className="w-3 h-3" />
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* ── Create Project Modal ── */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsProjectModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FolderPlus className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {modalMode === "create" ? "New Project" : "Edit Project"}
                </h3>
              </div>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleProjectSubmit} className="p-6 space-y-5">
              {formStatus.error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm font-semibold text-red-600 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  {formStatus.error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Project Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Marketing Automation"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  value={projectForm.name}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Project Key
                </label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    placeholder="e.g. MKT"
                    maxLength={10}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    value={projectForm.key}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        key: e.target.value
                          .replace(/[^a-zA-Z]/g, "")
                          .toUpperCase(),
                      })
                    }
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-1.5 py-0.5 rounded uppercase pointer-events-none">
                    Short Code
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Description{" "}
                  <span className="text-slate-300 font-normal italic">
                    (optional)
                  </span>
                </label>
                <textarea
                  rows={3}
                  placeholder="What is this project about?"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                  value={projectForm.description}
                  onChange={(e) =>
                    setProjectForm({
                      ...projectForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formStatus.loading}
                  className="flex-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {formStatus.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                  ) : (
                    modalMode === "create" ? "Create Project" : "Update Project"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Project Details Modal ── */}
      {isProjectDetailsModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={closeProjectDetailsModal}
          />

          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedProject.name}
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">
                    {selectedProject.key}
                  </span>
                </div>
              </div>
              <button
                onClick={closeProjectDetailsModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              {selectedProject.description && (
                <div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>
              )}

              {/* Owner Info */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Project Owner
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedProject.owner?.name || "Unknown"}
                  </p>
                </div>
              </div>

              {/* Members List */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-slate-500" />
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                    Team Members ({selectedProject.members?.length || 0})
                  </h4>
                </div>

                {userRole === "PROJECT_MANAGER" && (
                  <div className="mb-5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                          Add developer to project
                        </label>
                        <select
                          value={selectedDeveloperId}
                          onChange={(e) => setSelectedDeveloperId(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        >
                          <option value="">Select developer</option>
                          {availableDevelopers.map((developer) => (
                            <option key={developer.id} value={developer.id}>
                              {developer.name || developer.email} ({developer.email})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAddMember}
                          disabled={!selectedDeveloperId || memberUpdateLoading}
                          className="inline-flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          {memberUpdateLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                          ) : (
                            "Add member"
                          )}
                        </button>
                      </div>
                    </div>

                    {memberUpdateError && (
                      <p className="mt-3 text-sm text-red-600">{memberUpdateError}</p>
                    )}

                    {developersLoading && (
                      <p className="mt-3 text-sm text-slate-500">
                        Loading developers...
                      </p>
                    )}
                    {!developersLoading && availableDevelopers.length === 0 && (
                      <p className="mt-3 text-sm text-slate-500">
                        {developers.length > 0
                          ? "All available developers are already on this project."
                          : "There are no developers available to add."}
                      </p>
                    )}
                  </div>
                )}

                {selectedProject.members && selectedProject.members.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedProject.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-all duration-200"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-slate-600">
                            {member.name
                              ? member.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
                              : member.email[0].toUpperCase()
                            }
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {member.name || "Unknown"}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {member.email}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${member.role === "PROJECT_MANAGER"
                            ? "bg-blue-100 text-blue-700"
                            : member.role === "DEVELOPER"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                          {member.role?.toLowerCase().replace("_", " ") || "user"}
                        </span>
                        {userRole === "PROJECT_MANAGER" && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">No team members yet</p>
                  </div>
                )}
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-slate-900">
                    {selectedProject.members?.length || 0}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">Members</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-slate-900">
                    {selectedProject.tasks?.length || 0}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">Tasks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
