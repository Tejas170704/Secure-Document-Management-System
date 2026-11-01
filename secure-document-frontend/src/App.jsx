import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyDocuments from "./pages/MyDocuments";
import SharedDocuments from "./pages/SharedDocuments";
import Converter from "./pages/Converter";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import UploadDocument from "./pages/UploadDocument";
import DocumentDetails from "./pages/DocumentDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./context/ToastContext";

function App() {

    useEffect(() => {
        const savedTheme =
            localStorage.getItem("theme") || "light";

        document.documentElement.setAttribute(
            "data-theme",
            savedTheme
        );
    }, []);

    return (
        <ToastProvider>
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* Dashboard */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* My Documents */}
                <Route
                    path="/documents"
                    element={
                        <ProtectedRoute>
                            <MyDocuments />
                        </ProtectedRoute>
                    }
                />

                {/* Document Converter */}
                <Route
                    path="/converter"
                    element={
                        <ProtectedRoute>
                            <Converter />
                        </ProtectedRoute>
                    }
                />

                {/* Upload Document */}
                <Route
                    path="/upload"
                    element={
                        <ProtectedRoute>
                            <UploadDocument />
                        </ProtectedRoute>
                    }
                />

                {/* Document Details */}
                <Route
                    path="/documents/:id"
                    element={
                        <ProtectedRoute>
                            <DocumentDetails />
                        </ProtectedRoute>
                    }
                />

                {/* Shared Documents */}
                <Route
                    path="/shared-documents"
                    element={
                        <ProtectedRoute>
                            <SharedDocuments />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Dashboard */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute adminOnly>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Default */}
                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

                {/* 404 */}
                <Route
                    path="*"
                    element={<NotFound />}
                />
            </Routes>
        </ToastProvider>
    );
}

export default App;