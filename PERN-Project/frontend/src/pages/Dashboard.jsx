import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/usersSlice";
import apiRequest from "../utils/apiRequest";
import { X, Menu, Zap } from "lucide-react";

// Extracted Components
import Sidebar from "../components/dashboard/Sidebar";
import ProjectsSection from "../components/dashboard/ProjectsSection";
import AssignedIssuesSection from "../components/dashboard/AssignedIssuesSection";
import ProjectTeamView from "../components/dashboard/ProjectTeamView";
import ProjectSprintsView from "../components/dashboard/ProjectSprintsView";
import ProjectModal from "../components/dashboard/ProjectModal";
import DashboardHome from "../components/dashboard/DashboardHome";
import ProjectBoardView from "../components/dashboard/ProjectBoardView";
import AnalyticsDashboard from "../components/dashboard/AnalyticsDashboard";
import BacklogView from "../components/dashboard/BacklogView";
import ProfileSettings from "./ProfileSettings";

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

  // Project Modal State (Global Project CRU)
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

  // Global Context State
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [projectDetailsLoading, setProjectDetailsLoading] = React.useState(false);
  const [currentView, setCurrentView] = React.useState("DASHBOARD");
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // My Issues State
  const [myIssues, setMyIssues] = React.useState([]);
  const [myIssuesLoading, setMyIssuesLoading] = React.useState(false);

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

  const fetchProjectDetails = async (projectId, shouldChangeView = false) => {
    try {
      setProjectDetailsLoading(true);
      const response = await apiRequest.get(`/projects/${projectId}`);
      setSelectedProject(response.data.project);

      if (shouldChangeView) {
        setCurrentView("PROJECT_BOARD");
      }
    } catch (err) {
      console.error("Error fetching project details:", err);
    } finally {
      setProjectDetailsLoading(false);
    }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
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
    setIsSidebarOpen(false);
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

      fetchProjects();
    } catch (err) {
      console.error("Project submission error:", err);
      setFormStatus({
        loading: false,
        error: err.response?.data?.message || "Something went wrong. Please try again.",
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

  return (
    <div className="flex bg-slate-50 overflow-hidden h-screen relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        currentUser={currentUser}
        role={role}
        roleLabel={roleLabel}
        initials={initials}
        myIssuesCount={myIssues.length}
        selectedProject={selectedProject}
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          setIsSidebarOpen(false);
        }}
        closeProjectDetailsModal={closeProjectDetailsModal}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={() => {
          dispatch(logout());
          navigate("/login");
        }}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0 z-10 w-full">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
               <Zap className="w-4 h-4 text-white" />
             </div>
             <span className="font-bold text-slate-900 text-lg tracking-tight">
               CoreOps
             </span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -mr-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main
          id="main-scroll-area"
          className="flex-1 overflow-y-auto w-full relative pb-20 md:pb-0"
        >
        {["DASHBOARD", "GLOBAL_PROJECTS", "GLOBAL_ISSUES", "PROFILE"].includes(currentView) && (
          <div className="max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6">
            {currentView === "DASHBOARD" && (
              <DashboardHome
                currentUser={currentUser}
                role={role}
                roleLabel={roleLabel}
                initials={initials}
                myIssues={myIssues}
                projects={projects}
              />
            )}

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

            {currentView === "GLOBAL_ISSUES" && (
              <AssignedIssuesSection
                myIssues={myIssues}
                myIssuesLoading={myIssuesLoading}
                userRole={userRole}
              />
            )}

            {currentView === "PROFILE" && (
              <ProfileSettings currentUser={currentUser} />
            )}
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
                    {currentView.replace("PROJECT_", "").toLowerCase().replace("_", " ")}
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
                refreshProject={fetchProjectDetails}
                fetchProjects={fetchProjects}
              />
            )}

            {currentView === "PROJECT_SPRINTS" && (
              <ProjectSprintsView
                selectedProject={selectedProject}
                userRole={userRole}
                refreshProject={fetchProjectDetails}
              />
            )}

            {currentView === "PROJECT_BOARD" && (
              <ProjectBoardView
                selectedProject={selectedProject}
                userRole={userRole}
                refreshProject={fetchProjectDetails}
                fetchMyIssues={fetchMyIssues}
              />
            )}

            {currentView === "PROJECT_BACKLOG" && (
              <BacklogView
                selectedProject={selectedProject}
                userRole={userRole}
                onIssueClick={(issue) => {
                  // Reuse logic from Board if needed, or just view
                  setCurrentView("PROJECT_BOARD");
                }}
              />
            )}

            {currentView === "PROJECT_ANALYTICS" && (
              <AnalyticsDashboard
                selectedProject={selectedProject}
              />
            )}
          </div>
        )}
        </main>
      </div>

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
