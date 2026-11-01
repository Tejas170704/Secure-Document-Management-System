import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ThemeSelector from "./ThemeSelector";

function Navbar() {
    const navigate = useNavigate();

    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");
    const isAdmin = role === "ADMIN";

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        navigate("/login", { replace: true });
    };

    const handleBrandClick = () => {
        navigate(isAdmin ? "/admin" : "/dashboard");
    };

    return (
        <header className="top-navbar">
            {/* Brand Logo */}
            <div
                className="brand"
                onClick={handleBrandClick}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        handleBrandClick();
                    }
                }}
                title="Go to Dashboard"
            >
                <div className="brand-icon animated-shield">
                    🔐
                </div>

                <div className="brand-text">
                    <div className="brand-title">
                        SecureDocs
                    </div>
                    <div className="brand-subtitle">
                        Document Vault
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="navbar-nav-links">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `nav-item-link ${isActive ? "active" : ""}`}
                >
                    <span className="nav-link-icon">📊</span>
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/documents"
                    className={({ isActive }) => `nav-item-link ${isActive ? "active" : ""}`}
                >
                    <span className="nav-link-icon">📄</span>
                    <span>My Documents</span>
                </NavLink>

                <NavLink
                    to="/shared-documents"
                    className={({ isActive }) => `nav-item-link ${isActive ? "active" : ""}`}
                >
                    <span className="nav-link-icon">👥</span>
                    <span>Shared</span>
                </NavLink>

                <NavLink
                    to="/converter"
                    className={({ isActive }) => `nav-item-link converter-nav-link ${isActive ? "active" : ""}`}
                >
                    <span className="nav-link-icon">🪄</span>
                    <span>Converter</span>
                    <span className="nav-new-badge">NEW</span>
                </NavLink>

                {isAdmin && (
                    <NavLink
                        to="/admin"
                        className={({ isActive }) => `nav-item-link admin-nav-link ${isActive ? "active" : ""}`}
                    >
                        <span className="nav-link-icon">👑</span>
                        <span>Admin</span>
                    </NavLink>
                )}
            </nav>

            {/* Right Side Tools & Profile */}
            <div className="navbar-right">
                {/* Theme Selector */}
                <ThemeSelector />

                {/* User Information */}
                <div className="user-info">
                    <div className="user-avatar">
                        {email ? email.charAt(0).toUpperCase() : "U"}
                    </div>

                    <div className="user-details">
                        <span className="user-email">
                            {email || "User"}
                        </span>
                        <span className={`user-role ${isAdmin ? "admin-role" : "user-role"}`}>
                            {role || "USER"}
                        </span>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                    title="Logout"
                >
                    <span className="logout-icon">↪</span>
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
}

export default Navbar;