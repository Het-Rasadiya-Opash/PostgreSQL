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
  Calendar,
  Flag,
  AlertCircle,
  MessageSquare,
  Tag,
} from "lucide-react";
import KanbanBoard from "../components/KanbanBoard";

// Extracted Components
import Sidebar from "../components/dashboard/Sidebar";
import ProjectsSection from "../components/dashboard/ProjectsSection";
import AssignedIssuesSection from "../components/dashboard/AssignedIssuesSection";
import ProjectTeamView from "../components/dashboard/ProjectTeamView";
import ProjectSprintsView from "../components/dashboard/ProjectSprintsView";
import ProjectModal from "../components/dashboard/ProjectModal";

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
  const [projectDetailsLoading, setProjectDetailsLoading] =
    React.useState(false);
  const [currentView, setCurrentView] = React.useState("DASHBOARD");
  const [developers, setDevelopers] = React.useState([]);
  const [developersLoading, setDevelopersLoading] = React.useState(false);
  const [selectedDeveloperId, setSelectedDeveloperId] = React.useState("");
  const [memberUpdateLoading, setMemberUpdateLoading] = React.useState(false);
  const [memberUpdateError, setMemberUpdateError] = React.useState(null);

  // Sprint State
  const [isSprintModalOpen, setIsSprintModalOpen] = React.useState(false);
  const [sprintForm, setSprintForm] = React.useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
    status: "PLANNED",
  });
  const [sprintSubmitLoading, setSprintSubmitLoading] = React.useState(false);

  // Issue State
  const [isIssueModalOpen, setIsIssueModalOpen] = React.useState(false);
  const [issueForm, setIssueForm] = React.useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    assigneeId: "",
    sprintId: "",
  });
  const [issueSubmitLoading, setIssueSubmitLoading] = React.useState(false);

  // My Issues State
  const [myIssues, setMyIssues] = React.useState([]);
  const [myIssuesLoading, setMyIssuesLoading] = React.useState(false);

  // Sprint Modal Modal Mode
  const [sprintModalMode, setSprintModalMode] = React.useState("create"); // "create" or "edit"
  const [editingSprintId, setEditingSprintId] = React.useState(null);

  // Issue Modal Modal Mode
  const [issueModalMode, setIssueModalMode] = React.useState("create"); // "create" or "edit"
  const [editingIssueId, setEditingIssueId] = React.useState(null);

  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  useEffect(() => {
    if (currentUser) {
      fetchProjects();
      fetchMyIssues();
    }
  }, [currentUser]);

  const fetchMyIssues = async () => {
    try {
      setMyIssuesLoading(true);
      const response = await apiRequest.get("/issues");
      const allIssues = response.data.issues || [];
      
      let filteredIssues = allIssues;
      if (currentUser?.role?.toUpperCase() === "DEVELOPER") {
        filteredIssues = allIssues.filter(issue => issue.assigneeId === currentUser.id);
      }
      
      setMyIssues(filteredIssues);
    } catch (err) {
      console.error("Error fetching my issues:", err);
    } finally {
      setMyIssuesLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      setProjectsError(null);
      const response = await apiRequest.get("/projects");
      setProjects(response.data.projects || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjectsError(
        err.response?.data?.message || "Failed to load projects",
      );
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

  const fetchProjectDetails = async (projectId, shouldChangeView = false) => {
    try {
      setProjectDetailsLoading(true);
      const response = await apiRequest.get(`/projects/${projectId}`);
      setSelectedProject(response.data.project);
      
      if (shouldChangeView) {
        setCurrentView("PROJECT_BOARD");
      }
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
      setMemberUpdateError(
        err.response?.data?.message || "Failed to add member",
      );
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
      setMemberUpdateError(
        err.response?.data?.message || "Failed to remove member",
      );
    } finally {
      setMemberUpdateLoading(false);
    }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation(); // Prevent clicking on project card details
    if (
      !window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone.",
      )
    )
      return;

    try {
      setProjectsLoading(true);
      await apiRequest.delete(`/projects/${projectId}`);
      await fetchProjects();
    } catch (err) {
      console.error("Error deleting project:", err);
      setProjectsError(
        err.response?.data?.message || "Failed to delete project",
      );
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleProjectClick = (projectId) => {
    fetchProjectDetails(projectId, true);
  };

  const closeProjectDetailsModal = () => {
    setCurrentView("DASHBOARD");
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

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!sprintForm.name) return;
    if (sprintModalMode === "create" && !selectedProject) return;

    try {
      setSprintSubmitLoading(true);
      if (sprintModalMode === "create") {
        await apiRequest.post("/sprints", {
          ...sprintForm,
          projectId: selectedProject.id,
        });
      } else {
        await apiRequest.put(`/sprints/${editingSprintId}`, sprintForm);
      }
      // Refresh project details if a project is open
      if (selectedProject) await fetchProjectDetails(selectedProject.id);
      setSprintForm({ name: "", goal: "", startDate: "", endDate: "" });
      setIsSprintModalOpen(false);
      setEditingSprintId(null);
    } catch (err) {
      console.error("Error creating/updating sprint:", err);
      alert(err.response?.data?.message || "Failed to process sprint");
    } finally {
      setSprintSubmitLoading(false);
    }
  };

  const handleEditSprint = (sprint) => {
    setSprintModalMode("edit");
    setEditingSprintId(sprint.id);
    setSprintForm({
      name: sprint.name,
      goal: sprint.goal || "",
      startDate: sprint.startDate ? sprint.startDate.split("T")[0] : "",
      endDate: sprint.endDate ? sprint.endDate.split("T")[0] : "",
      status: sprint.status || "PLANNED",
    });
    setIsSprintModalOpen(true);
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!issueForm.title) return;
    if (issueModalMode === "create" && !selectedProject) return;

    try {
      setIssueSubmitLoading(true);
      if (issueModalMode === "create") {
        await apiRequest.post("/issues", {
          ...issueForm,
          projectId: selectedProject.id,
        });
      } else {
        await apiRequest.put(`/issues/${editingIssueId}`, issueForm);
      }
      // Refresh project details if a project is open
      if (selectedProject) await fetchProjectDetails(selectedProject.id);
      fetchMyIssues();
      setIssueForm({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: "",
        sprintId: "",
      });
      setIsIssueModalOpen(false);
      setEditingIssueId(null);
    } catch (err) {
      console.error("Error creating/updating issue:", err);
      alert(err.response?.data?.message || "Failed to process issue");
    } finally {
      setIssueSubmitLoading(false);
    }
  };

  const handleEditIssue = (issue) => {
    setIssueModalMode("edit");
    setEditingIssueId(issue.id);
    setIssueForm({
      title: issue.title,
      description: issue.description || "",
      status: issue.status,
      priority: issue.priority,
      assigneeId: issue.assigneeId || "",
      sprintId: issue.sprintId || "",
    });
    setIsIssueModalOpen(true);
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    try {
      await apiRequest.delete(`/issues/${issueId}`);
      if (selectedProject) fetchProjectDetails(selectedProject.id);
      fetchMyIssues();
    } catch (err) {
      console.error("Error deleting issue:", err);
      alert(err.response?.data?.message || "Failed to delete issue");
    }
  };

  const handleStatusDragUpdate = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;

    // Optimistic Update
    if (selectedProject) {
      const updatedIssues = selectedProject.issues.map((issue) =>
        issue.id === draggableId ? { ...issue, status: newStatus } : issue,
      );
      setSelectedProject({ ...selectedProject, issues: updatedIssues });
    }

    try {
      await apiRequest.put(`/issues/${draggableId}`, { status: newStatus });
      fetchMyIssues();
    } catch (err) {
      console.error("Failed to update status via drag", err);
      // Revert Optimistic Update
      if (selectedProject) {
        fetchProjectDetails(selectedProject.id);
      }
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

  const doneTasks = myIssues.filter((i) => i.status === "DONE").length;
  const inProgressTasks = myIssues.filter((i) => i.status === "IN_PROGRESS").length;
  const todoTasks = myIssues.filter((i) => i.status === "TODO").length;

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
      icon: Flag,
      label: "To Do",
      value: todoTasks.toString(),
      color: "text-slate-600",
      bg: "bg-slate-100",
      border: "border-slate-200",
    },
    {
      icon: Clock,
      label: "In Progress",
      value: inProgressTasks.toString(),
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      icon: CheckCircle,
      label: "Tasks Done",
      value: doneTasks.toString(),
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      icon: Users,
      label: "Team Members",
      value: projects
        .reduce((total, project) => total + (project._count?.members || 0), 0)
        .toString(),
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
    },
  ];

  const availableDevelopers = developers.filter(
    (dev) =>
      !selectedProject?.members?.some((member) => member.id === dev.id) &&
      dev.id !== selectedProject?.owner?.id,
  );

  return (
    <div className="flex bg-slate-50 overflow-hidden h-screen">
      {/* Sidebar - Jira Style */}
      <Sidebar
        currentUser={currentUser}
        role={role}
        roleLabel={roleLabel}
        initials={initials}
        myIssuesCount={myIssues.length}
        selectedProject={selectedProject}
        currentView={currentView}
        setCurrentView={setCurrentView}
        closeProjectDetailsModal={closeProjectDetailsModal}
        onLogout={() => {
          dispatch(logout());
          navigate("/login");
        }}
      />

      {/* Main SCROLLABLE Area */}
      <main
        id="main-scroll-area"
        className="flex-1 overflow-y-auto w-full relative"
      >
        {["DASHBOARD", "GLOBAL_PROJECTS", "GLOBAL_ISSUES"].includes(
          currentView,
        ) && (
          <div className="max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6">
            {currentView === "DASHBOARD" && (
              <>
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
                  </div>
                </div>

                {/* ── Stats Grid ── */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {stats.map(
                    ({ icon: Icon, label, value, color, bg, border }) => (
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
                    ),
                  )}
                </div>
              </>
            )}

            {/* ── Projects Section ── */}
            {currentView === "GLOBAL_PROJECTS" && (
              <ProjectsSection
                projects={projects}
                projectsLoading={projectsLoading}
                projectsError={projectsError}
                fetchProjects={fetchProjects}
                userRole={userRole}
                setModalMode={setModalMode}
                setProjectForm={setProjectForm}
                setIsProjectModalOpen={setIsProjectModalOpen}
                handleProjectClick={handleProjectClick}
                openEditModal={openEditModal}
                handleDeleteProject={handleDeleteProject}
              />
            )}

            {/* ── Assigned to Me Issues Section ── */}
            {currentView === "GLOBAL_ISSUES" && (
              <AssignedIssuesSection
                myIssues={myIssues}
                myIssuesLoading={myIssuesLoading}
                setIssueModalMode={setIssueModalMode}
                setEditingIssueId={setEditingIssueId}
                setIssueForm={setIssueForm}
                setIsIssueModalOpen={setIsIssueModalOpen}
                userRole={userRole}
              />
            )}
          </div>
        )}

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
                    ) : modalMode === "create" ? (
                      "Create Project"
                    ) : (
                      "Update Project"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── PROJECT WORKSPACE ── */}
        {selectedProject && currentView.startsWith("PROJECT_") && (
          <div className="max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6">
            {/* Header (Shared across project views) */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {selectedProject.name}
                </h2>
                <p className="text-sm font-semibold text-slate-500 mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold uppercase">
                    {selectedProject.key}
                  </span>
                  <span>•</span>
                  <span className="capitalize">
                    {currentView.replace("PROJECT_", "").toLowerCase()}
                  </span>
                </p>
              </div>
              <button
                onClick={closeProjectDetailsModal}
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {currentView === "PROJECT_TEAM" && (
              <ProjectTeamView
                selectedProject={selectedProject}
                userRole={userRole}
                availableDevelopers={availableDevelopers}
                selectedDeveloperId={selectedDeveloperId}
                setSelectedDeveloperId={setSelectedDeveloperId}
                handleAddMember={handleAddMember}
                handleRemoveMember={handleRemoveMember}
                memberUpdateLoading={memberUpdateLoading}
                memberUpdateError={memberUpdateError}
                developersLoading={developersLoading}
                developers={developers}
              />
            )}

            {currentView === "PROJECT_SPRINTS" && (
              <ProjectSprintsView
                selectedProject={selectedProject}
                userRole={userRole}
                isSprintModalOpen={isSprintModalOpen}
                setIsSprintModalOpen={setIsSprintModalOpen}
                sprintModalMode={sprintModalMode}
                setSprintModalMode={setSprintModalMode}
                sprintForm={sprintForm}
                setSprintForm={setSprintForm}
                handleCreateSprint={handleCreateSprint}
                sprintSubmitLoading={sprintSubmitLoading}
                setEditingSprintId={setEditingSprintId}
                handleEditSprint={handleEditSprint}
              />
            )}

            {currentView === "PROJECT_BOARD" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-slate-500" />
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                      Issues ({selectedProject.issues?.length || 0})
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      setIssueModalMode("create");
                      setIssueForm({
                        title: "",
                        description: "",
                        status: "TODO",
                        priority: "MEDIUM",
                        assigneeId: "",
                        sprintId: "",
                      });
                      setEditingIssueId(null);
                      setIsIssueModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-all duration-200 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Issue</span>
                  </button>
                </div>

                {isIssueModalOpen && (
                  <div className="mb-6 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {issueModalMode === "create"
                          ? "Create New Issue"
                          : "Edit Issue"}
                      </h5>
                      <button
                        onClick={() => setIsIssueModalOpen(false)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <form onSubmit={handleCreateIssue} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                          Title
                        </label>
                        <input
                          required
                          disabled={
                            userRole === "DEVELOPER" &&
                            issueModalMode === "edit"
                          }
                          type="text"
                          placeholder="e.g. Implement user auth"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                          value={issueForm.title}
                          onChange={(e) =>
                            setIssueForm({
                              ...issueForm,
                              title: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          disabled={
                            userRole === "DEVELOPER" &&
                            issueModalMode === "edit"
                          }
                          placeholder="What needs to be done?"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none disabled:bg-slate-50 disabled:text-slate-500"
                          value={issueForm.description}
                          onChange={(e) =>
                            setIssueForm({
                              ...issueForm,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                            Status
                          </label>
                          <select
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                            value={issueForm.status}
                            onChange={(e) =>
                              setIssueForm({
                                ...issueForm,
                                status: e.target.value,
                              })
                            }
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                            Priority
                          </label>
                          <select
                            disabled={
                              userRole === "DEVELOPER" &&
                              issueModalMode === "edit"
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                            value={issueForm.priority}
                            onChange={(e) =>
                              setIssueForm({
                                ...issueForm,
                                priority: e.target.value,
                              })
                            }
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                            Assignee
                          </label>
                          <select
                            disabled={
                              userRole === "DEVELOPER" &&
                              issueModalMode === "edit"
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                            value={issueForm.assigneeId}
                            onChange={(e) =>
                              setIssueForm({
                                ...issueForm,
                                assigneeId: e.target.value,
                              })
                            }
                          >
                            <option value="">Unassigned</option>
                            {selectedProject.members?.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.name || member.email}
                              </option>
                            ))}
                            <option value={selectedProject.owner?.id}>
                              {selectedProject.owner?.name} (Owner)
                            </option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                            Sprint
                          </label>
                          <select
                            disabled={
                              userRole === "DEVELOPER" &&
                              issueModalMode === "edit"
                            }
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                            value={issueForm.sprintId}
                            onChange={(e) =>
                              setIssueForm({
                                ...issueForm,
                                sprintId: e.target.value,
                              })
                            }
                          >
                            <option value="">Backlog (No Sprint)</option>
                            {selectedProject.sprints?.map((sprint) => (
                              <option key={sprint.id} value={sprint.id}>
                                {sprint.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={issueSubmitLoading || !issueForm.title}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                          {issueSubmitLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <PlusCircle className="w-3.5 h-3.5" />
                          )}
                          {issueModalMode === "create"
                            ? "Create Issue"
                            : "Update Issue"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {selectedProject.issues && selectedProject.issues.length > 0 ? (
                  <div className="mt-4">
                    <KanbanBoard
                      issues={selectedProject.issues}
                      onDragEnd={handleStatusDragUpdate}
                      onIssueClick={handleEditIssue}
                      onDeleteIssue={handleDeleteIssue}
                      userRole={userRole}
                    />
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">
                      No issues reported yet
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Start tracking tasks and bugs by adding your first issue
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <ProjectModal
        isProjectModalOpen={isProjectModalOpen}
        setIsProjectModalOpen={setIsProjectModalOpen}
        modalMode={modalMode}
        projectForm={projectForm}
        setProjectForm={setProjectForm}
        formStatus={formStatus}
        handleProjectSubmit={handleProjectSubmit}
      />
    </div>
  );
};

export default Dashboard;
