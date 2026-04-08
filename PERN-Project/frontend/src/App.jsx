import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import apiRequest from "./utils/apiRequest";
import { setCurrentUser, setCheckingAuth } from "./features/usersSlice";
import { Loader2 } from "lucide-react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

const GuestRoute = ({ children }) => {
  const { currentUser } = useSelector((state) => state.users);
  return currentUser ? <Navigate to="/dashboard" replace /> : children;
};

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useSelector((state) => state.users);
  return currentUser ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const dispatch = useDispatch();
  const { isCheckingAuth } = useSelector((state) => state.users);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest.get("/users/");
        dispatch(setCurrentUser(response.data.data));
      } catch (error) {
        dispatch(setCheckingAuth(false));
      }
    };
    checkAuth();
  }, [dispatch]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Initializing Secure Session...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
