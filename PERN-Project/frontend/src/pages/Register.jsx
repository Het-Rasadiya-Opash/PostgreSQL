import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import apiRequest from "../utils/apiRequest";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Lock,
  Zap,
  Star,
  Globe,
  Cpu,
  ChevronDown,
} from "lucide-react";
import { setLoading, setError, clearError } from "../features/usersSlice";

const perks = [
  { icon: Star, label: "Trusted by 5,000+ teams worldwide" },
  { icon: Globe, label: "Available in 40+ countries" },
  { icon: Cpu, label: "AI-powered sprint automation" },
];

const ROLES = [
  { value: "DEVELOPER", label: "Developer" },
  { value: "PROJECT_MANAGER", label: "Project Manager" },
  { value: "ADMIN", label: "Admin" },
];

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "DEVELOPER",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.users);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      dispatch(setError("Passwords do not match."));
      return;
    }
    dispatch(clearError());
    dispatch(setLoading(true));
    try {
      await apiRequest.post("/users/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      navigate("/login");
    } catch (err) {
      dispatch(
        setError(
          err.response?.data?.message || "Registration failed. Please try again."
        )
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  const inputClass =
    "w-full pl-4 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200";

  const iconInputClass =
    "w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200";

  const labelClass =
    "block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[42%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-linear-to-br from-indigo-600 via-blue-700 to-blue-900" />

        {/* Animated orbs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-15 -right-15 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse [animation-delay:1.5s]" />

        {/* Grid dot overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">PMS</span>
          </div>
        </div>

        <div className="relative z-10 py-8">
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
            Join thousands<br />
            <span className="text-blue-200">of elite teams.</span>
          </h1>
          <p className="text-blue-100/80 text-base leading-relaxed max-w-xs">
            Set up your account in under 60 seconds and start shipping with confidence.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {perks.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-blue-100 text-sm font-medium">{label}</p>
            </div>
          ))}

          {/* Testimonial */}
          {/* <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <p className="text-white/90 text-sm leading-relaxed italic mb-3">
              "PMS cut our sprint planning time in half. Our team is finally in sync."
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-300 to-indigo-300 flex items-center justify-center text-xs font-bold text-white">
                JA
              </div>
              <div>
                <p className="text-white text-xs font-semibold leading-none">Julian A.</p>
                <p className="text-blue-200/70 text-xs mt-0.5">CTO, Velotech Inc.</p>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">PMS</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-1">Create an account</h2>
            <p className="text-slate-500 text-sm">Get started with your free workspace today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className={labelClass}>Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Julian Alexander"
                required
                value={form.name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClass}>Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                required
                value={form.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className={labelClass}>Role</label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={inputClass + " cursor-pointer pr-10"}
                  style={{ WebkitAppearance: "none", MozAppearance: "none", appearance: "none" }}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Password row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="6+ characters"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={handleChange}
                    className={iconInputClass + " pr-10"}
                  />
                  <div className="absolute inset-y-0 right-3.5 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="confirm_password" className={labelClass}>Confirm</label>
                <div className="relative">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Match password"
                    required
                    value={form.confirm_password}
                    onChange={handleChange}
                    className={iconInputClass + " pr-10"}
                  />
                  <div className="absolute inset-y-0 right-3.5 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                <Lock className="text-red-500 w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-red-700 leading-snug">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center my-7">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-widest">or</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* SSO */}
          

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 transition-colors"
            >
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
