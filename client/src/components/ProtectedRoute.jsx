import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function ProtectedRoute({ roles }) {
  const { token, user } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  // Logged in, but not the right role
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/students" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;