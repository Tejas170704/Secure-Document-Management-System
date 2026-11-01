import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, adminOnly = false }) {

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // User is not logged in
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Admin page but user is not admin
    if (adminOnly && role !== "ADMIN") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;