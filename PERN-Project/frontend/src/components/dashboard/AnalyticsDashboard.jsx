import React, { useMemo } from "react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from "recharts";
import { BarChart3, PieChart as PieIcon, Activity, TrendingUp } from "lucide-react";

const COLORS = ["#f87171", "#60a5fa", "#34d399"]; // Red, Blue, Green (Todo, In Progress, Done)
const PRIORITY_COLORS = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#3b82f6"
};

const AnalyticsDashboard = ({ selectedProject }) => {
  const issues = selectedProject?.issues || [];

  // Data for Status Distribution (Pie Chart)
  const statusData = useMemo(() => {
    const counts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    issues.forEach(issue => {
      if (counts[issue.status] !== undefined) {
        counts[issue.status]++;
      }
    });

    return [
      { name: "To Do", value: counts.TODO },
      { name: "In Progress", value: counts.IN_PROGRESS },
      { name: "Done", value: counts.DONE }
    ];
  }, [issues]);

  // Data for Team Workload (Bar Chart)
  const workloadData = useMemo(() => {
    const memberMap = {};
    
    // Include owner
    if (selectedProject?.owner) {
      memberMap[selectedProject.owner.id] = { name: selectedProject.owner.name, count: 0 };
    }
    
    // Include members
    selectedProject?.members?.forEach(m => {
      memberMap[m.id] = { name: m.name, count: 0 };
    });

    issues.forEach(issue => {
      if (issue.assigneeId && memberMap[issue.assigneeId]) {
        memberMap[issue.assigneeId].count++;
      }
    });

    return Object.values(memberMap);
  }, [selectedProject, issues]);

  // Data for Priority Distribution
  const priorityData = useMemo(() => {
    const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    issues.forEach(issue => {
      if (counts[issue.priority] !== undefined) {
        counts[issue.priority]++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [issues]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <h5 className="text-sm font-bold text-slate-500">Total Issues</h5>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{issues.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h5 className="text-sm font-bold text-slate-500">Completion Rate</h5>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            {issues.length > 0 ? Math.round((statusData[2].value / issues.length) * 100) : 0}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 md:col-span-2">
           <div className="flex items-center gap-3 mb-4">
               <PieIcon className="w-5 h-5 text-purple-500" />
               <h5 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Status Distribution</h5>
           </div>
           <div className="h-[200px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={statusData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
                       <YAxis axisLine={false} tickLine={false} hide />
                       <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                       <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                           {statusData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index]} />
                           ))}
                       </Bar>
                   </BarChart>
               </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Workload Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            <h5 className="text-sm font-bold text-slate-900">Team Workload (Assigned Issues)</h5>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={100} tick={{fontSize: 12, fontWeight: 600}} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <PieIcon className="w-5 h-5 text-amber-500" />
            <h5 className="text-sm font-bold text-slate-900">Priority Breakdown</h5>
          </div>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
