import React, { useState } from "react";
import { User, Mail, Lock, Shield, Loader2, CheckCircle2 } from "lucide-react";
import { useDispatch } from "react-redux";
import apiRequest from "../utils/apiRequest";
import { setCurrentUser } from "../features/usersSlice";

const ProfileSettings = ({ currentUser }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiRequest.put("/users/profile", {
        name: form.name,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      
      dispatch(setCurrentUser(response.data.data));
      setSuccess(true);
      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }));
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="relative z-10 flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
                    <span className="text-3xl font-extrabold text-white">
                        {currentUser?.name ? currentUser.name[0].toUpperCase() : "U"}
                    </span>
                </div>
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight">{currentUser?.name}</h2>
                    <div className="flex items-center gap-2 mt-1 opacity-80">
                        <Shield className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-sm font-bold uppercase tracking-wider">{currentUser?.role}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                value={form.name}
                                onChange={(e) => setForm({...form, name: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="email"
                                disabled
                                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-100 text-slate-400 text-sm outline-none transition-all cursor-not-allowed"
                                value={form.email}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-6">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-slate-400" />
                        Security & Password
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Current Password</label>
                            <input 
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                value={form.currentPassword}
                                onChange={(e) => setForm({...form, currentPassword: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                            <input 
                                type="password"
                                placeholder="Min. 8 characters"
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                value={form.newPassword}
                                onChange={(e) => setForm({...form, newPassword: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-between pt-6">
                    <button 
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3.5 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                    </button>

                    {success && (
                        <div className="flex items-center gap-2 text-emerald-600 animate-in fade-in slide-in-from-right-4">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-xs font-bold">Profile updated!</span>
                        </div>
                    )}
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
