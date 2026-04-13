import React, { useState, useEffect } from 'react';
import { Shield, Users, Loader2, Trash2, BarChart3 } from 'lucide-react';
import apiRequest from '../../utils/apiRequest';

const ProjectTeamView = ({ selectedProject, userRole, refreshProject, fetchProjects }) => {
  const [developers, setDevelopers] = useState([]);
  const [developersLoading, setDevelopersLoading] = useState(false);
  const [selectedDeveloperId, setSelectedDeveloperId] = useState("");
  const [memberUpdateLoading, setMemberUpdateLoading] = useState(false);
  const [memberUpdateError, setMemberUpdateError] = useState(null);

  useEffect(() => {
    if (userRole === "PROJECT_MANAGER") {
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
      
      fetchDevelopers();
    }
  }, [userRole]);

  const handleAddMember = async () => {
    if (!selectedDeveloperId || !selectedProject) return;

    try {
      setMemberUpdateLoading(true);
      setMemberUpdateError(null);
      await apiRequest.put("/projects/members/add", {
        projectId: selectedProject.id,
        userId: selectedDeveloperId,
      });
      await refreshProject(selectedProject.id);
      if (fetchProjects) await fetchProjects();
      setSelectedDeveloperId("");
    } catch (err) {
      console.error("Error adding member:", err);
      setMemberUpdateError(
        err.response?.data?.message || "Failed to add member"
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
      await refreshProject(selectedProject.id);
      if (fetchProjects) await fetchProjects();
    } catch (err) {
      console.error("Error removing member:", err);
      setMemberUpdateError(
        err.response?.data?.message || "Failed to remove member"
      );
    } finally {
      setMemberUpdateLoading(false);
    }
  };

  const availableDevelopers = developers.filter(
    (dev) =>
      !selectedProject?.members?.some((member) => member.id === dev.id) &&
      dev.id !== selectedProject?.owner?.id
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
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
                className="flex flex-wrap items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 shadow-xs shrink-0">
                      <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                        <span className="text-[7px] font-bold text-white">
                          {member.name ? member.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : member.email[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-700 truncate max-w-[80px] sm:max-w-[120px]">
                        {member.name || member.email.split('@')[0]}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 ml-2 truncate">
                    {member.email}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${member.role === "PROJECT_MANAGER"
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

      {/* Team Workload - PM View Only */}
      {userRole === "PROJECT_MANAGER" && (
        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Team Workload
            </h4>
          </div>
          <div className="space-y-4">
            {[selectedProject.owner, ...(selectedProject.members || [])].map((member) => (
              <div key={member?.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 shrink-0">
                      <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                        <span className="text-[7px] font-bold text-white">
                          {member?.name ? member.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : member?.email[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-700">
                        {member?.name || member?.email.split('@')[0]}
                      </span>
                    </div>
                    {member?.id === selectedProject.owner?.id && (
                      <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-tight">Owner</span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {selectedProject.issues?.filter(i => i.assigneeId === member?.id).length || 0} issues
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedProject.issues?.filter(i => i.assigneeId === member?.id).map(issue => (
                    <div key={issue.id} className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] hover:border-blue-300 transition-all shadow-xs group/issue">
                      <span className="text-slate-700 font-bold flex-1 min-w-0 truncate" title={issue.title}>
                        {issue.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                        issue.status === "DONE" ? "text-emerald-700 bg-emerald-50 border border-emerald-100" : issue.status === "IN_PROGRESS" ? "text-blue-700 bg-blue-50 border border-blue-100" : "text-slate-500 bg-slate-50 border border-slate-200"
                      }`}>
                        {issue.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                  {selectedProject.issues?.filter(i => i.assigneeId === member?.id).length === 0 && (
                    <p className="text-[10px] text-slate-400 italic text-center py-1">No issues assigned</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTeamView;
