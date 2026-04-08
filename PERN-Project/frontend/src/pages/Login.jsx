import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import apiRequest from "../utils/apiRequest";
import { Eye, EyeOff, Mail, Lock, Building2, Loader2 } from "lucide-react";
import {
  setCurrentUser,
  setLoading,
  setError,
  clearError,
} from "../features/usersSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.users);

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(setLoading(true));

    try {
      const response = await apiRequest.post("/users/login", {
        email,
        password,
      });

      const userData = {
        id: response.data.data.user.id,
        email: response.data.data.user.email,
        name: response.data.data.user.name,
        role: response.data.data.user.role,
      };

      dispatch(setCurrentUser(userData));
      navigate("/dashboard");
    } catch (err) {
      dispatch(
        setError(
          err.response?.data?.message ||
            "Authentication failed. Please check your credentials.",
        ),
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="bg-[#faf9ff] text-[#051a3e] min-h-screen flex items-center justify-center p-6">
      <main
        className="w-full max-w-300 grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-xl bg-white"
        style={{ boxShadow: "0 32px 64px -12px rgba(5,26,62,0.08)" }}
      >
       

        <section className="lg:col-span-5 p-8 md:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <header className="mb-10">
              <h2 className="font-bold text-3xl text-[#051a3e] mb-2">
                Sign in
              </h2>
              <p className="text-[#434654] text-sm">
                Access your project dashboard and active sprints.
              </p>
            </header>

            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Email */}
              <div className="space-y-2">
                <label
                  className="block text-[0.75rem] font-bold uppercase tracking-wider text-[#434654]"
                  htmlFor="email"
                >
                  Corporate Email
                </label>
                <div className="relative group">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-[#c3c6d6] focus:ring-0 focus:border-[#003d9b] outline-none transition-all duration-300 placeholder:text-[#737685] font-medium text-[#051a3e]"
                  />
                  <Mail className="absolute right-0 top-3 text-[#737685] group-focus-within:text-[#003d9b] transition-colors w-5 h-5" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    className="block text-[0.75rem] font-bold uppercase tracking-wider text-[#434654]"
                    htmlFor="password"
                  >
                    Access Password
                  </label>
                  <a
                    href="#"
                    className="text-[0.75rem] font-bold text-[#003d9b] hover:text-[#0052cc] transition-colors uppercase tracking-tight"
                  >
                    Forgot?
                  </a>
                </div>
                <div className="relative group">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-[#c3c6d6] focus:ring-0 focus:border-[#003d9b] outline-none transition-all duration-300 placeholder:text-[#737685] font-medium text-[#051a3e] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-3 text-[#737685] group-focus-within:text-[#003d9b] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-[#ffdad6]/30 rounded border border-[#ba1a1a]/10">
                  <Lock className="text-[#ba1a1a] w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold text-[#93000a] leading-none">
                    {error}
                  </span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 px-6 bg-[#003d9b] !text-white font-bold text-sm uppercase tracking-[0.15em] rounded shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Authorize Access</span>
                )}
              </button>
            </form>


            <footer className="mt-12 text-center">
              <p className="text-sm text-[#434654] font-medium">
                New to the core?{" "}
                <Link
                  to="/register"
                  className="text-[#003d9b] font-bold hover:underline underline-offset-4 ml-1"
                >
                  Create an account
                </Link>
              </p>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;
